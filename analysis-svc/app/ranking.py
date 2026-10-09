import math


def compute_impact_score(comment: dict) -> float:
    upvotes = max(0, int(comment.get("upvotes", 0)))
    compound = abs(float(comment.get("compound", 0.0)))
    score = (math.log1p(upvotes) * 0.6) + (compound * 0.4)
    return round(score, 4)


def rank_top_comments(
    scored_comments: list[dict],
    top_k: int = 10,
) -> dict:
    enriched = []
    for c in scored_comments:
        item = dict(c)
        item["impact_score"] = compute_impact_score(item)
        enriched.append(item)

    ranked = sorted(enriched, key=lambda x: x["impact_score"], reverse=True)

    top_positive = [c for c in ranked if float(c.get("compound", 0.0)) >= 0.05][:5]
    top_negative = [c for c in ranked if float(c.get("compound", 0.0)) <= -0.05][:5]

    return {
        "top_overall": ranked[:top_k],
        "top_positive": top_positive,
        "top_negative": top_negative,
    }
