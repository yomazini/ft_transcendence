import json
from pathlib import Path

from .ranking import rank_top_comments

SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"


def format_comments_xml(comments: list[dict]) -> str:
    lines = []
    for i, c in enumerate(comments, 1):
        cid = f"c{i}"
        upvotes = int(c.get("upvotes", 0))
        text = str(c.get("text", "")).strip()
        lines.append(f'<comment id="{cid}" upvotes="{upvotes}">')
        lines.append(f"<text>{text}</text>")
        lines.append("</comment>")
    return "\n".join(lines)


def format_persona_xml(job: dict | None) -> str:
    persona = (job or {}).get("customer_persona") or {}
    if isinstance(persona, str):
        try:
            persona = json.loads(persona)
        except json.JSONDecodeError:
            persona = {"description": persona}

    desc = persona.get("description", "not provided")
    price = persona.get("price_sensitivity", "not provided")
    priority = persona.get("top_priority", "not provided")

    return (
        "<customer_persona>\n"
        f"description: {desc}\n"
        f"price_sensitivity: {price}\n"
        f"top_priority: {priority}\n"
        "</customer_persona>"
    )


def build_synthesis_prompt(job: dict | None, scored_comments: list[dict]) -> str:
    ranked = rank_top_comments(scored_comments, top_k=10)
    top_10 = ranked["top_overall"]

    persona_xml = format_persona_xml(job)
    comments_xml = format_comments_xml(top_10)

    sufficiency_skill = (SKILLS_DIR / "skills-data-sufficiency.md").read_text(
        encoding="utf-8"
    )
    swot_skill = (SKILLS_DIR / "skills-swot.md").read_text(encoding="utf-8")
    blue_ocean_skill = (SKILLS_DIR / "skills-blue-ocean.md").read_text(encoding="utf-8")
    features_skill = (SKILLS_DIR / "skills-feature-suggestions.md").read_text(
        encoding="utf-8"
    )

    return (
        f"{persona_xml}\n\n"
        f"{comments_xml}\n\n"
        f"{sufficiency_skill}\n\n"
        f"{swot_skill}\n\n"
        f"{blue_ocean_skill}\n\n"
        f"{features_skill}"
    )


def build_rag_prompt(
    query: str, retrieved_comments: list[dict], job: dict | None = None
) -> str:

    persona_xml = format_persona_xml(job) if job else ""
    rag_skill = (SKILLS_DIR / "skills-rag-followup-qa.md").read_text(encoding="utf-8")
    comments_block = []
    for i, c in enumerate(retrieved_comments, 1):
        cid = f"c{i}"
        score = round(float(c.get("similarity", 0.0)), 2)
        upvotes = int(c.get("upvotes", 0))
        text = str(c.get("text", "")).strip()
        comments_block.append(
            f'<retrieved_comment id="{cid}" relevance_score="{score}" upvotes="{upvotes}">\n'
            f"<text>{text}</text>\n"
            "</retrieved_comment>"
        )

    full_context = f"{persona_xml}\n\n<question>{query}</question>\n\n"
    comments_xml = "\n".join(comments_block)
    return f"{full_context}{comments_xml}\n\n{rag_skill}"
