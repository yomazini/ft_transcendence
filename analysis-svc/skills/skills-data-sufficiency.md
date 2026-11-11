---
skill: data-sufficiency
purpose: Stop the synthesis when the comment sample is too small or off-topic
used_by: analysis-svc synthesis prompt
---

# Data sufficiency

Use only the comments in the `<comments>` section. Do not invent facts, products, prices, or user needs.

Return the insufficient-data result when either condition is true:

- Fewer than 3 independent comments discuss the product.
- The comments do not discuss the product or the customer persona.
- focus on the user orgs persona as well ; for example his organization

The insufficient-data result uses the normal JSON shape:

- `swot`: empty arrays for strengths, weaknesses, opportunities, and threats. Put `"Not enough information: ..."` in `swot.notes`.
- `blue_ocean`: empty arrays for eliminate, reduce, raise, and create.
- `features`: empty array.
- `weakest_suggestion`: empty string.

Do not fill the empty arrays with generic advice. Do not treat one comment as a pattern.
