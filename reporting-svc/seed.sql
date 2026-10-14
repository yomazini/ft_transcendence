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

INSERT INTO "Comments" (
    id,
    job_id,
    text,
    author,
    upvotes,
    sentiment_score,
    created_at
) VALUES
('d0000001-0000-0000-0000-000000000001', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Onboarding checklist is super helpful for new users.', 'newbie_ali', 44, 0.70, '2026-10-09 09:12:00'),
('d0000002-0000-0000-0000-000000000002', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Login fails randomly on Safari.', 'safari_sam', 71, -0.72, '2026-10-10 13:40:00'),
('d0000003-0000-0000-0000-000000000003', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'The weekly report email is a nice touch.', 'report_fan', 26, 0.55, '2026-10-11 08:05:00'),
('d0000004-0000-0000-0000-000000000004', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Too many clicks to reach the settings page.', 'ux_hassan', 38, -0.40, '2026-10-12 17:22:00'),
('d0000005-0000-0000-0000-000000000005', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Does what it says. Nothing more, nothing less.', 'plain_pete', 9, 0.02, '2026-10-13 12:00:00'),
('d0000006-0000-0000-0000-000000000006', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Integration with Slack saved our team hours.', 'team_lead_zina', 102, 0.92, '2026-10-14 10:18:00'),
('d0000007-0000-0000-0000-000000000007', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Lost my data after the last update. Unacceptable.', 'angry_karim', 120, -0.95, '2026-10-15 21:47:00'),
('d0000008-0000-0000-0000-000000000008', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Interface is clean and easy on the eyes.', 'design_lina', 57, 0.68, '2026-10-16 09:30:00'),
('d0000009-0000-0000-0000-000000000009', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Loading times got much better this week.', 'speedy_reda', 48, 0.62, '2026-10-17 15:05:00'),
('d0000010-0000-0000-0000-000000000010', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'The mobile layout breaks on small screens.', 'phone_user_14', 33, -0.58, '2026-10-18 19:35:00'),
('d0000011-0000-0000-0000-000000000011', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Would be great to have a calendar view.', 'planner_nour', 19, 0.15, '2026-10-19 11:10:00'),
('d0000012-0000-0000-0000-000000000012', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Documentation is outdated and missing examples.', 'doc_reader', 45, -0.50, '2026-10-20 14:28:00'),
('d0000013-0000-0000-0000-000000000013', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Best tool we have adopted this year!', 'ceo_youssef', 134, 0.96, '2026-10-21 08:45:00'),
('d0000014-0000-0000-0000-000000000014', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'API rate limits are too strict for small teams.', 'api_dev_ilyas', 52, -0.47, '2026-10-22 16:12:00'),
('d0000015-0000-0000-0000-000000000015', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Fine for basic use, I guess.', 'meh_mouna', 7, 0.00, '2026-10-23 10:55:00'),
('d0000016-0000-0000-0000-000000000016', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Love the keyboard shortcuts, so productive.', 'keys_amine', 61, 0.80, '2026-10-24 09:20:00'),
('d0000017-0000-0000-0000-000000000017', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Export to PDF produces a broken layout.', 'export_sara', 36, -0.62, '2026-10-25 18:03:00'),
('d0000018-0000-0000-0000-000000000018', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Great community, people answer questions fast.', 'forum_hamza', 49, 0.74, '2026-10-26 13:15:00'),
('d0000019-0000-0000-0000-000000000019', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Billing charged me twice this month.', 'billing_issue', 88, -0.85, '2026-10-27 20:40:00'),
('d0000020-0000-0000-0000-000000000020', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'The new filters make finding things effortless.', 'filter_fan', 54, 0.77, '2026-10-28 11:32:00'),
('d0000021-0000-0000-0000-000000000021', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Still waiting for offline mode.', 'offline_omar', 31, -0.25, '2026-10-29 15:48:00'),
('d0000022-0000-0000-0000-000000000022', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Solid update. Stable and noticeably faster.', 'stable_soufiane', 66, 0.83, '2026-10-30 09:00:00'),
('d0000023-0000-0000-0000-000000000023', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-08 17:25:00'),
('d0000023-0000-0000-0000-000000000024', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-07 17:25:00'),
('d0000023-0000-0000-0000-000000000025', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-06 17:25:00'),
('d0000023-0000-0000-0000-000000000026', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-05 17:25:00'),
('d0000023-0000-0000-0000-000000000027', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-04 17:25:00'),
('d0000023-0000-0000-0000-000000000028', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-03 17:25:00'),
('d0000023-0000-0000-0000-000000000029', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, -1, '2026-10-02 17:25:00'),
('d0000023-0000-0000-0000-000000000030', 'a18f2d90-3b41-4e2a-9f12-987654321abc', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-01 17:25:00')
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