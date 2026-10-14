FIXTURE_COMMENT_IDS = [
    "d1111111-0001-4000-8000-000000000001",
    "d1111111-0001-4000-8000-000000000002",
    "d1111111-0001-4000-8000-000000000003",
    "d1111111-0001-4000-8000-000000000004",
    "d1111111-0001-4000-8000-000000000005",
    "d1111111-0001-4000-8000-000000000006",
    "d1111111-0001-4000-8000-000000000007",
    "d1111111-0001-4000-8000-000000000008",
    "d1111111-0001-4000-8000-000000000009",
    "d1111111-0001-4000-8000-000000000010",
]

FIXTURE_COMMENTS = [
    {
        "text": "Been using this for 3 months now. The sync speed is incredible, never had a single issue with file conflicts.",
        "author": "cloud_mike",
        "upvotes": 42,
    },
    {
        "text": "The pricing is absolutely insane for what you get. There are open-source alternatives that do 80% of this for free.",
        "author": "budget_dev",
        "upvotes": 128,
    },
    {
        "text": "Customer support responded within 10 minutes and fixed my export issue. That's rare for a company this size.",
        "author": "happyuser_22",
        "upvotes": 35,
    },
    {
        "text": "Mobile app crashes every time I try to upload a PDF. Has anyone else had this problem?",
        "author": "ios_frustrated",
        "upvotes": 67,
    },
    {
        "text": "Just migrated our entire team from Notion. The import tool worked flawlessly, saved us weeks of manual work.",
        "author": "pm_sarah",
        "upvotes": 89,
    },
    {
        "text": "The API documentation is terrible. Spent 2 days trying to figure out webhook authentication.",
        "author": "devops_jim",
        "upvotes": 156,
    },
    {
        "text": "Honestly it's fine. Does what it says. Nothing special but nothing broken either.",
        "author": "neutral_ned",
        "upvotes": 12,
    },
    {
        "text": "Love the dark mode and keyboard shortcuts. This is clearly built by people who actually use their own product.",
        "author": "ux_enthusiast",
        "upvotes": 73,
    },
    {
        "text": "Data privacy is a real concern. Where exactly are the servers located? No transparency page anywhere.",
        "author": "privacy_hawk",
        "upvotes": 201,
    },
    {
        "text": "The free tier is generous enough for solo freelancers. I only upgraded when I hired my second contractor.",
        "author": "freelance_life",
        "upvotes": 45,
    },
]


def get_fixture_comments() -> list[dict]:
    result = []
    for i, comment in enumerate(FIXTURE_COMMENTS):
        result.append({
            "id": FIXTURE_COMMENT_IDS[i],
            "text": comment["text"],
            "author": comment["author"],
            "upvotes": comment["upvotes"],
        })
    return result
