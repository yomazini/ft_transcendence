from typing import Any
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()


def score_comments(comments: list[dict]) -> list[dict]:
    for comment in comments:
        scores = _analyzer.polarity_scores(comment["text"])
        blob_sentiment: Any = TextBlob(comment["text"]).sentiment
        subj = round(float(blob_sentiment.subjectivity), 4)
        comment["compound"] = scores["compound"]
        comment["pos"] = scores["pos"]
        comment["neg"] = scores["neg"]
        comment["neu"] = scores["neu"]
        comment["subjectivity"] = subj
        comment["subjectivity_label"] = "fact" if subj < 0.35 else "opinion"
    return comments


def compute_sentiment_summary(scored_comments: list[dict]) -> dict:
    if not scored_comments:
        return {
            "positive_ratio": 0,
            "neutral_ratio": 0,
            "negative_ratio": 0,
            "avg_compound": 0,
            "avg_subjectivity": 0,
            "fact_count": 0,
            "opinion_count": 0,
        }

    total = len(scored_comments)
    positive = sum(1 for c in scored_comments if c["compound"] >= 0.05)
    negative = sum(1 for c in scored_comments if c["compound"] <= -0.05)
    neutral = total - positive - negative
    avg_compound = sum(c["compound"] for c in scored_comments) / total
    avg_subj = sum(c.get("subjectivity", 0.0) for c in scored_comments) / total
    fact_count = sum(
        1 for c in scored_comments if c.get("subjectivity_label") == "fact"
    )
    opinion_count = total - fact_count

    return {
        "positive_count": positive,
        "negative_count": negative,
        "neutral_count": neutral,
        "positive_ratio": round(positive / total, 2),
        "neutral_ratio": round(neutral / total, 2),
        "negative_ratio": round(negative / total, 2),
        "avg_compound": round(avg_compound, 4),
        "avg_subjectivity": round(avg_subj, 4),
        "fact_count": fact_count,
        "opinion_count": opinion_count,
    }
