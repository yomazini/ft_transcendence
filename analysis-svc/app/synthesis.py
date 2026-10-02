def synthesize_swot(sentiment_summary: dict, scored_comments: list[dict]) -> dict:
    sorted_by_score = sorted(scored_comments, key=lambda c: c["compound"])
    top_negative = sorted_by_score[:3]
    top_positive = sorted_by_score[-3:]

    strengths = []
    weaknesses = []
    opportunities = []
    threats = []

    for c in top_positive:
        if c["compound"] >= 0.05:
            tag = c.get("subjectivity_label", "opinion").upper()
            snippet = f"{c['text'][:80]}..." if len(c["text"]) > 80 else c["text"]
            strengths.append(f"[{tag}] \"{snippet}\" (sentiment: {c['compound']:.2f})")

    for c in top_negative:
        if c["compound"] <= -0.05:
            tag = c.get("subjectivity_label", "opinion").upper()
            snippet = f"{c['text'][:80]}..." if len(c["text"]) > 80 else c["text"]
            weaknesses.append(f"[{tag}] \"{snippet}\" (sentiment: {c['compound']:.2f})")

    if sentiment_summary["negative_ratio"] > 0.3:
        opportunities.append(
            "High negative sentiment indicates room to differentiate through better UX/support."
        )
    if sentiment_summary["neutral_ratio"] > 0.2:
        opportunities.append(
            "Significant neutral feedback suggests undecided users who could be converted."
        )
    opportunities.append(
        "Community engagement on Reddit indicates an active user base open to dialogue."
    )

    if sentiment_summary["negative_ratio"] > 0.2:
        threats.append(
            f"Negative sentiment at {sentiment_summary['negative_ratio']:.0%} — risk of churn."
        )
    threats.append(
        "Open-source alternatives mentioned — price competition is real."
    )

    return {
        "strengths": strengths or ["No strong positive signals detected."],
        "weaknesses": weaknesses or ["No major complaints detected."],
        "opportunities": opportunities,
        "threats": threats,
        "subjectivity_breakdown": {
            "avg_subjectivity": sentiment_summary.get("avg_subjectivity", 0.0),
            "fact_count": sentiment_summary.get("fact_count", 0),
            "opinion_count": sentiment_summary.get("opinion_count", 0),
        },
    }


def synthesize_blue_ocean(sentiment_summary: dict, scored_comments: list[dict]) -> dict:
    factors = {
        "price": {"importance": 0, "satisfaction": 0},
        "support": {"importance": 0, "satisfaction": 0},
        "features": {"importance": 0, "satisfaction": 0},
        "reliability": {"importance": 0, "satisfaction": 0},
        "privacy": {"importance": 0, "satisfaction": 0},
        "ux_design": {"importance": 0, "satisfaction": 0},
    }

    keywords = {
        "price": ["price", "pricing", "cost", "expensive", "free", "budget", "pay"],
        "support": ["support", "help", "respond", "customer service", "fix"],
        "features": ["feature", "tool", "import", "export", "api", "webhook"],
        "reliability": ["crash", "bug", "issue", "broken", "slow", "sync"],
        "privacy": ["privacy", "data", "security", "server", "transparency"],
        "ux_design": ["dark mode", "keyboard", "ui", "ux", "design", "interface"],
    }

    for comment in scored_comments:
        text_lower = comment["text"].lower()
        for factor, kws in keywords.items():
            if any(kw in text_lower for kw in kws):
                factors[factor]["importance"] += 1
                factors[factor]["satisfaction"] += comment["compound"]

    for factor in factors:
        count = factors[factor]["importance"]
        if count > 0:
            factors[factor]["satisfaction"] = round(
                factors[factor]["satisfaction"] / count, 2
            )

    eliminate = []
    reduce = []
    raise_factors = []
    create = []

    for factor, data in factors.items():
        if data["importance"] > 0 and data["satisfaction"] < -0.2:
            raise_factors.append(f"Improve {factor} (satisfaction: {data['satisfaction']})")
        elif data["importance"] == 0:
            create.append(f"Explore {factor} — not mentioned, potential white space")
        elif data["satisfaction"] > 0.5:
            reduce.append(f"Consider {factor} — already strong, reallocate resources")

    return {
        "factors": factors,
        "strategy": {
            "eliminate": eliminate or ["No factors identified for elimination."],
            "reduce": reduce or ["No over-served factors detected."],
            "raise": raise_factors or ["No under-served critical factors detected."],
            "create": create or ["All factors are being addressed."],
        },
    }


def generate_conclusion(sentiment_summary: dict, swot: dict) -> str:
    pos = sentiment_summary["positive_ratio"]
    neg = sentiment_summary["negative_ratio"]
    avg = sentiment_summary["avg_compound"]
    avg_subj = sentiment_summary.get("avg_subjectivity", 0.0)

    tone = "positive" if avg > 0.1 else "negative" if avg < -0.1 else "mixed"
    total = (
        sentiment_summary.get("positive_count", 0)
        + sentiment_summary.get("negative_count", 0)
        + sentiment_summary.get("neutral_count", 0)
    )

    return (
        f"Analysis of community feedback reveals a {tone} overall sentiment "
        f"(avg compound: {avg}, avg subjectivity: {avg_subj}). "
        f"{sentiment_summary.get('positive_count', 0)} out of {total} "
        f"comments were positive ({pos:.0%}), while {sentiment_summary.get('negative_count', 0)} "
        f"were negative ({neg:.0%}). "
        f"Key strengths include {swot['strengths'][0][:60] if swot['strengths'] else 'N/A'}. "
        f"Primary concerns center around {swot['weaknesses'][0][:60] if swot['weaknesses'] else 'N/A'}."
    )
