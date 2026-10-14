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


def rerank_for_rag(
    retrieved_comments: list[dict],
    top_k: int = 5,
) -> list[dict]:
    if not retrieved_comments:
        return []

    max_upvotes = max(max(0, int(c.get("upvotes", 0))) for c in retrieved_comments)
    norm_denom = math.log1p(max(max_upvotes, 10))

    enriched = []
    for c in retrieved_comments:
        item = dict(c)
        similarity = max(0.0, min(1.0, float(item.get("similarity", 0.0))))
        upvotes = max(0, int(item.get("upvotes", 0)))
        norm_upvotes = math.log1p(upvotes) / norm_denom

        item["final_score"] = round((0.7 * similarity) + (0.3 * norm_upvotes), 4)
        enriched.append(item)

    return sorted(enriched, key=lambda x: x["final_score"], reverse=True)[:top_k]
