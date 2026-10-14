# How these three skills combine into ONE OpenRouter LLM call

This file is the assembly instructions — not sent to the LLM itself, just for
whoever wires this up in `analysis-svc`.

## Why one call, not three

OpenRouter's free tier runs 20 requests/minute (50/day without credits, 1000/day with $10 credits). Three separate calls per job
(SWOT, then Blue Ocean, then Features) would triple that cost for zero benefit —
Blue Ocean and Features are mechanical transformations of the SWOT reasoning,
not independent analyses that need fresh context. One call, three sections,
one combined JSON response.

## The actual prompt sent to OpenRouter, assembled in this order

```
[SYSTEM / TOP OF PROMPT]

<customer_persona>
description: <from the job, or "not provided">
price_sensitivity: <budget | mid-market | premium | not provided>
top_priority: <string, or "not provided">
</customer_persona>

<comment id="c1" upvotes="89">
<text>...</text>
<thread_context>...</thread_context>
</comment>
... up to c10 ...

[Contents of skills-swot.md, in full]

[Contents of skills-blue-ocean.md, in full]

[Contents of skills-feature-suggestions.md, in full — this is where the
final "return ONLY this JSON" instruction and the complete combined schema
live, since it's the last section]
```

The comment data goes at the **top**, before any instructions — this matters
for the injection defense: the model reads "this is data" framing (in
skills-swot.md) immediately after seeing the data itself, and the actual
instructions it should follow come from the skill files, positioned and
reinforced three separate times (once per section), not the untrusted content.

## API call parameters

| Parameter         | Value                                                                                         | Why                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | `meta-llama/llama-3.3-70b-instruct:free` (or `openai/gpt-4o-mini` / `deepseek/deepseek-chat`) | Configured via `OPENROUTER_MODEL` in `analysis-svc` — works on OpenRouter Free Tier now and $10 Paid Tier later                                                                                               |
| `temperature`     | `0.3`                                                                                         | Low, deliberately — this is business analysis, not creative writing. Lower temperature means the same 10 comments produce a similar analysis run to run, which matters for trust and for demoing consistently |
| `max_tokens`      | `3072`                                                                                        | Covers all three sections' combined JSON comfortably (estimated real usage ~1000-1100 tokens) with real headroom, without being wasteful against rate limits                                                  |
| `response_format` | `{"type": "json_object"}`                                                                     | Enforces valid JSON output via OpenRouter's OpenAI-compatible structured output parameter — an extra layer on top of the "return ONLY this JSON" instruction                                                  |

## What happens on the response side

1. Parse the response as JSON. If it fails to parse (rare, but possible), retry
   once with the same prompt before falling back to an error state for that job
   — don't silently store malformed data.
2. Store `swot` and `blue_ocean` directly into the `Report` row (matches the
   `Report` schema in `contracts/openapi.yaml`).
3. Store `features` and `weakest_suggestion` alongside — not yet in the OpenAPI
   contract's `Report` schema, worth adding as a follow-up PR against that file
   once this is wired up for real.
4. The `notes` field (if present, e.g. a flagged injection attempt) goes to a
   log, not silently dropped and not surfaced to the end user without review.
