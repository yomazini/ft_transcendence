-- ============================================================
-- 1. USER
-- ============================================================

INSERT INTO "User" (
    id,
    email,
    password,
    created_at
) VALUES (
    '01111111-1111-7111-8111-111111111111',
    'test@acme.com',
    'test-password',
    NOW()
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. ORGANIZATION
-- ============================================================

INSERT INTO "Organization" (
    id,
    name,
    description,
    created_at
) VALUES (
    '018f2d90-3b41-7e2a-9f12-111122223333',
    'Acme Corp',
    'Test organization for reporting',
    NOW()
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 3. USER <-> ORGANIZATION
-- ============================================================

INSERT INTO "role_and_organization" (
    id,
    user_id,
    org_id,
    role
) VALUES (
    '029f3e01-4c52-8f3b-af23-222233334444',
    '01111111-1111-7111-8111-111111111111',
    '018f2d90-3b41-7e2a-9f12-111122223333',
    'Admin'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 4. JOB
-- ============================================================

INSERT INTO "Job" (
    id,
    org_id,
    created_by,
    target,
    mode,
    status,
    customer_persona,
    created_at
) VALUES (
    'a18f2d90-3b41-4e2a-9f12-987654321abc',
    '018f2d90-3b41-7e2a-9f12-111122223333',
    '01111111-1111-7111-8111-111111111111',
    'r/freelance',
    'Subreddit',
    'Done',
    '{
        "price_sensitivity": "budget",
        "top_priority": "cost_saving"
    }'::jsonb,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Job" (
    id,
    org_id,
    created_by,
    target,
    mode,
    status,
    customer_persona,
    created_at
) VALUES (
    'a18f2d90-3b41-4e2a-9f12-987654331abc',
    '018f2d90-3b41-7e2a-9f12-111122223333',
    '01111111-1111-7111-8111-111111111111',
    'r/freelance',
    'Subreddit',
    'Done',
    '{
        "price_sensitivity": "budget",
        "top_priority": "cost_saving"
    }'::jsonb,
    NOW()
)
ON CONFLICT (id) DO NOTHING;


INSERT INTO "Job" (
    id,
    org_id,
    created_by,
    target,
    mode,
    status,
    customer_persona,
    created_at
) VALUES (
    'a18f2d90-3b41-4e2a-9f12-987654341abc',
    '018f2d90-3b41-7e2a-9f12-111122223333',
    '01111111-1111-7111-8111-111111111111',
    'r/freelance',
    'Subreddit',
    'Done',
    '{
        "price_sensitivity": "budget",
        "top_priority": "cost_saving"
    }'::jsonb,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. COMMENTS
-- ============================================================

INSERT INTO "Comments" (
    id,
    job_id,
    text,
    author,
    upvotes,
    sentiment_score,
    created_at
) VALUES
(
    'f1111111-1111-1111-1111-111111111111',
    'a18f2d90-3b41-4e2a-9f12-987654321abc',
    'Love the fast sync!',
    'user123',
    89,
    0.85,
    NOW()
),
(
    'f2222222-2222-2222-2222-222222222222',
    'a18f2d90-3b41-4e2a-9f12-987654321abc',
    'Mobile app feels bloated.',
    'user456',
    52,
    -0.65,
    NOW()
)
ON CONFLICT (id) DO NOTHING;







-- ============================================================
-- 6. REPORT
-- ============================================================

INSERT INTO "Report" (
    id,
    job_id,
    swot,
    blue_ocean,
    conclusion,
    created_at
) VALUES (
    'c39e4a81-9b12-4f3e-8c3d-123456789abc',
    'a18f2d90-3b41-4e2a-9f12-987654321abc',

    '{
        "strengths": [
            "Fast capture speed",
            "Reliable offline access"
        ],
        "weaknesses": [
            "Mobile app feels bloated"
        ],
        "opportunities": [
            "Automated topic auto-organization"
        ],
        "threats": [
            "Users switching to markdown tools"
        ]
    }'::jsonb,

    '{
        "eliminate": [
            "Complex database schemas"
        ],
        "reduce": [
            "Plugin configurations"
        ],
        "raise": [
            "Cross-device sync speed"
        ],
        "create": [
            "AI-driven topic tagging"
        ]
    }'::jsonb,

    'Users value fast synchronization and offline access, while the mobile experience and complexity remain areas for improvement.',

    NOW()
)
ON CONFLICT (id) DO NOTHING;



INSERT INTO "Report" (
    id,
    job_id,
    swot,
    blue_ocean,
    conclusion,
    created_at
) VALUES (
    'c39e4a81-9b12-4f3e-8c3d-123456889abc',
    'a18f2d90-3b41-4e2a-9f12-987654331abc',

    '{
        "strengths": [
            "Fast capture speed",
            "Reliable offline access"
        ],
        "weaknesses": [
            "Mobile app feels bloated"
        ],
        "opportunities": [
            "Automated topic auto-organization"
        ],
        "threats": [
            "Users switching to markdown tools"
        ]
    }'::jsonb,

    '{
        "eliminate": [
            "Complex database schemas"
        ],
        "reduce": [
            "Plugin configurations"
        ],
        "raise": [
            "Cross-device sync speed"
        ],
        "create": [
            "AI-driven topic tagging"
        ]
    }'::jsonb,

    'Users value fast synchronization and offline access, while the mobile experience and complexity remain areas for improvement.',

    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Report" (
    id,
    job_id,
    swot,
    blue_ocean,
    conclusion,
    created_at
) VALUES (
    'c39e4a81-9b12-4f3e-8c3d-123456780abc',
    'a18f2d90-3b41-4e2a-9f12-987654341abc',

    '{
        "strengths": [
            "Fast capture speed",
            "Reliable offline access"
        ],
        "weaknesses": [
            "Mobile app feels bloated"
        ],
        "opportunities": [
            "Automated topic auto-organization"
        ],
        "threats": [
            "Users switching to markdown tools"
        ]
    }'::jsonb,

    '{
        "eliminate": [
            "Complex database schemas"
        ],
        "reduce": [
            "Plugin configurations"
        ],
        "raise": [
            "Cross-device sync speed"
        ],
        "create": [
            "AI-driven topic tagging"
        ]
    }'::jsonb,

    'Users value fast synchronization and offline access, while the mobile experience and complexity remain areas for improvement.',

    NOW()
)
ON CONFLICT (id) DO NOTHING;



-- ============================================================
-- 7. MESSAGE
-- ============================================================

INSERT INTO "Messages" (
    id,
    user_id,
    org_id,
    response,
    text,
    read_status,
    created_at
) VALUES (
    '039f4e12-5d63-9f4c-b034-333344445555',
    '01111111-1111-7111-8111-111111111111',
    '018f2d90-3b41-7e2a-9f12-111122223333',
    'Your reporting job has completed successfully.',
    'Reporting job completed',
    false,
    NOW()
)
ON CONFLICT (id) DO NOTHING;