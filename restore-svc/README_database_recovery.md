# Database Backup and Recovery

This guide explains how to create a PostgreSQL backup, clear the existing database data, and recover it using the recovery script in the main repository.

> **Warning:** Truncating tables deletes their current data. Make sure you have a valid backup before continuing. Run this procedure only on the database you intend to restore.

## Step 1 — Create a backup and upload it to MinIO

Normally, a scheduled **cron job** should create a PostgreSQL backup and upload it to the **MinIO** service automatically.

You can also trigger the backup manually by calling the reporting service endpoint (fist you shod do docker compose exec -it reporting-svc bash):

```bash
curl -X POST http://localhost:3003/backups/create
```

Before continuing, check that the backup request succeeded and confirm the backup file exists in your MinIO bucket.

## Step 2 — Clear the existing database data

To test the recovery process, you can remove the existing data while keeping the PostgreSQL tables themselves.

Connect to PostgreSQL (replace `postgres` with your actual container name if different):

```bash
docker exec -it postgres psql -U DB_USER_NAME -d DB_NAME
```

Then run:

```sql
TRUNCATE TABLE
    "Backups",
    "Comments",
    "Job",
    "Messages",
    "Organization",
    "Payment",
    "Report",
    "Subscription",
    "User"
RESTART IDENTITY CASCADE;
```

`RESTART IDENTITY` resets identity sequences. `CASCADE` can also truncate other tables that reference these tables through foreign keys.

> **Warning:** This step is destructive. Skip it when restoring a real database unless clearing the existing data is explicitly part of your recovery procedure. Avoid concurrent application writes during recovery.

## Step 3 — Recover the database

Return to the **main repository** and execute the database recovery script provided there.

```bash
cd /path/to/main/repository
# Run the repository's recovery script here:
# <recovery-script-command>
```

The exact command depends on the script's name, path, arguments, and how it selects the backup file in MinIO. Replace the placeholder with the actual command from your repository.

## Step 4 — Verify the recovered data

After the recovery script finishes, connect to PostgreSQL again and check that the expected records are present:

```sql
SELECT COUNT(*) FROM public."User";
SELECT COUNT(*) FROM public."Organization";
SELECT COUNT(*) FROM public."Report";
SELECT COUNT(*) FROM public."Backups";
```

Also verify that your application can read the restored data. A successful script exit alone does not guarantee that all data was recovered correctly.

## Summary

1. **Backup:** Let cron create and upload backups automatically, or call `POST /backups/create` manually.
2. **Clear data (for testing):** Truncate the existing tables.
3. **Recover:** Run the recovery script from the main repository.
4. **Verify:** Check the restored records and application behavior.
