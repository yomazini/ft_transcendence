# Scraper Service

## Description

TODO

## Instructions

> [!NOTE]
> This service requires Redis to be running on port `6379`.

The worker reads its AppRole credentials and Reddit sessions from Vault.

Mount the login folder read-only:

```yaml
volumes:
  - "./vault/creds/scraper-svc:/run/vault:ro"
```

It reads `/run/vault/login.json`, logs in to Vault, then reads `secret/data/scraper-svc` and `secret/data/database`.

To run locally with the Vault file path:

```bash
VAULT_LOGIN_FILE=/path/to/login.json uv run --active scraper-svc
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
