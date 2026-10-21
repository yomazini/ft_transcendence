-- ============================================================
-- 1. USER
-- ============================================================

INSERT INTO "User" (
    id,
    email,
    password,
    created_at
) VALUES (
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
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
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
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
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
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
    'f828cf9b-a853-40e7-bd4f-efed5070f41a',
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
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
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
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
    'a18f2d90-3b41-4e2a-9f12-98765431abc',
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
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
    'a18f2d90-3b41-4e2a-9f12-987654341ab4',
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
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
    'f1111111-1111-1111-1111-111111111181',
    'f828cf9b-a853-40e7-bd4f-efed5070f41a',
    'Love the fast sync!',
    'user123',
    89,
    0.85,
    NOW()
),
(
    'f2222222-2222-2222-2222-222222227222',
    'f828cf9b-a853-40e7-bd4f-efed5070f41a',
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
('d0000001-0000-0000-0000-000000000014', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Onboarding checklist is super helpful for new users.', 'newbie_ali', 44, 0.70, '2026-10-09 09:12:00'),
('d0000002-0000-0000-0000-000000000024', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Login fails randomly on Safari.', 'safari_sam', 71, -0.72, '2026-10-10 13:40:00'),
('d0000003-0000-0000-0000-000000000034', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'The weekly report email is a nice touch.', 'report_fan', 26, 0.55, '2026-10-11 08:05:00'),
('d0000004-0000-0000-0000-000000000044', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Too many clicks to reach the settings page.', 'ux_hassan', 38, -0.40, '2026-10-12 17:22:00'),
('d0000005-0000-0000-0000-000000000054', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Does what it says. Nothing more, nothing less.', 'plain_pete', 9, 0.02, '2026-10-13 12:00:00'),
('d0000006-0000-0000-0000-000000000064', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Integration with Slack saved our team hours.', 'team_lead_zina', 102, 0.92, '2026-10-14 10:18:00'),
('d0000007-0000-0000-0000-000000000074', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Lost my data after the last update. Unacceptable.', 'angry_karim', 120, -0.95, '2026-10-15 21:47:00'),
('d0000008-0000-0000-0000-000000000084', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Interface is clean and easy on the eyes.', 'design_lina', 57, 0.68, '2026-10-16 09:30:00'),
('d0000009-0000-0000-0000-000000000094', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Loading times got much better this week.', 'speedy_reda', 48, 0.62, '2026-10-17 15:05:00'),
('d0000010-0000-0000-0000-000000000104', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'The mobile layout breaks on small screens.', 'phone_user_14', 33, -0.58, '2026-10-18 19:35:00'),
('d0000011-0000-0000-0000-000000000114', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Would be great to have a calendar view.', 'planner_nour', 19, 0.15, '2026-10-19 11:10:00'),
('d0000012-0000-0000-0000-000000000124', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Documentation is outdated and missing examples.', 'doc_reader', 45, -0.50, '2026-10-20 14:28:00'),
('d0000013-0000-0000-0000-000000000134', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Best tool we have adopted this year!', 'ceo_youssef', 134, 0.96, '2026-10-21 08:45:00'),
('d0000014-0000-0000-0000-000000000144', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'API rate limits are too strict for small teams.', 'api_dev_ilyas', 52, -0.47, '2026-10-22 16:12:00'),
('d0000015-0000-0000-0000-000000000154', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Fine for basic use, I guess.', 'meh_mouna', 7, 0.00, '2026-10-23 10:55:00'),
('d0000016-0000-0000-0000-000000000164', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Love the keyboard shortcuts, so productive.', 'keys_amine', 61, 0.80, '2026-10-24 09:20:00'),
('d0000017-0000-0000-0000-000000000174', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Export to PDF produces a broken layout.', 'export_sara', 36, -0.62, '2026-10-25 18:03:00'),
('d0000018-0000-0000-0000-000000000184', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Great community, people answer questions fast.', 'forum_hamza', 49, 0.74, '2026-10-26 13:15:00'),
('d0000019-0000-0000-0000-000000000194', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Billing charged me twice this month.', 'billing_issue', 88, -0.85, '2026-10-27 20:40:00'),
('d0000020-0000-0000-0000-000000000204', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'The new filters make finding things effortless.', 'filter_fan', 54, 0.77, '2026-10-28 11:32:00'),
('d0000021-0000-0000-0000-000000000214', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Still waiting for offline mode.', 'offline_omar', 31, -0.25, '2026-10-29 15:48:00'),
('d0000022-0000-0000-0000-000000000224', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Solid update. Stable and noticeably faster.', 'stable_soufiane', 66, 0.83, '2026-10-30 09:00:00'),
('d0000023-0000-0000-0000-000000000234', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-08 17:25:00'),
('d0000023-0000-0000-0000-000000000244', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-07 17:25:00'),
('d0000023-0000-0000-0000-000000000254', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-06 17:25:00'),
('d0000023-0000-0000-0000-000000000264', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-05 17:25:00'),
('d0000023-0000-0000-0000-000000000274', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-04 17:25:00'),
('d0000023-0000-0000-0000-000000000284', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-03 17:25:00'),
('d0000023-0000-0000-0000-000000000294', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, -1, '2026-10-02 17:25:00'),
('d0000023-0000-0000-0000-000000000304', 'f828cf9b-a853-40e7-bd4f-efed5070f41a', 'Good month overall, looking forward to the next release.', 'loyal_user', 72, 0.65, '2026-10-01 17:25:00')
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
    'f828cf9b-a853-40e7-bd4f-efed5070f41a',

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
    '8fb9cb09-7825-4a43-abeb-c033dbbf74f9',
    'eac156d4-7551-4dc2-b869-bc8430a6f3a0',
    'Your reporting job has completed successfully.',
    'Reporting job completed',
    false,
    NOW()
)
ON CONFLICT (id) DO NOTHING;