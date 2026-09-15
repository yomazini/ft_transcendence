# Scraper Service

## Description

TODO

## Instructions

> [!NOTE]
> This service requires Redis to be running on port `6379`.

To run and test the scraping script, you need to add a `.env` file to this directory.

Add the `SESSION_IDS` environment variable to the `.env` file and set it to your Reddit session cookie.

To run the script, use:

```bash
uv run --active --env-file .env scrapper-svc
```

The scraper will listen to Redis for new jobs in the scrape-job queue.

To test it, you can use the following script:


```py
from bullmq import Queue
import asyncio

async def exec():
    queue = Queue('scrape-job')
    await queue.add("job", {
        "target": "https://www.reddit.com/r/learnprogramming/comments/1w6w78d/i_need_a_roadmap_for_c_programming_to_leasrn_real.json",
        "mode": "post"
        })
    await queue.close()

asyncio.run(exec())
```
To scrape a different post, change the target value. Make sure it points to a valid Reddit post.
