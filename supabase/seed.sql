-- ============================================================
-- AUTHENTICATION NOTE
-- ============================================================
-- Supabase manages authentication credentials in `auth.users` (a private
-- schema managed by Supabase Auth). `public.users` holds only profile data.
--
-- To create the demo user account for testing, go to:
--   Supabase Dashboard → Authentication → Users → Add User
--   Email:    demo@creatoros.app
--   Password: demo1234
--
-- The UUID below ('00000000-0000-0000-0000-000000000000') should match
-- the ID Supabase assigns that auth user (or copy the auto-generated UUID
-- from the Users table after creating the account, then update here).
-- ============================================================

-- Ensure all app-specific columns exist on public.users
-- (Supabase may auto-create public.users with fewer columns via auth triggers)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Relax NOT NULL on email/password columns that may exist from a non-Supabase schema.
-- These are not used for auth in Supabase (auth is in auth.users).
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;

-- Demo user profile data (credentials live in auth.users, not here)
INSERT INTO public.users (id, name, email, full_name, avatar_url, niche, bio, platforms)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Alex Rivera',
    'demo@creatoros.app',
    'Alex Rivera',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'Tech & Digital Lifestyle',
    'Professional YouTuber & lifestyle creator focusing on software engineering, workspace setups, and productivity tech.',
    '{
        "youtube": {"handle": "@alexriveratech", "followers": 850000, "engagement": 4.8},
        "instagram": {"handle": "@alexrivera", "followers": 420000, "engagement": 5.2},
        "tiktok": {"handle": "@alexrivera_tech", "followers": 1200000, "engagement": 8.1}
    }'::jsonb
) ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, full_name = EXCLUDED.full_name, avatar_url = EXCLUDED.avatar_url, niche = EXCLUDED.niche, bio = EXCLUDED.bio, platforms = EXCLUDED.platforms;




-- Brand Deals
INSERT INTO public.brand_deals (id, user_id, brand_name, logo_url, deal_value, stage, deadline, description, deliverables)
VALUES
    ('d1000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Nike', 'https://logo.clearbit.com/nike.com', 8500.00, 'Paid', '2026-06-15', 'Air Max Campaign integration in Workspace Setup video.', ARRAY['1x YouTube Video Integration', '1x Instagram Reel']),
    ('d1000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Spotify', 'https://logo.clearbit.com/spotify.com', 12000.00, 'Active', '2026-07-25', 'Podcast Sponsorship - 4 Episodes.', ARRAY['4x 60s Mid-roll placements']),
    ('d1000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Adobe', 'https://logo.clearbit.com/adobe.com', 15000.00, 'Contract Sent', '2026-08-10', 'Creative Cloud Express review video and custom assets.', ARRAY['1x Dedicated YouTube Video', '2x TikToks']),
    ('d1000004-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Squarespace', 'https://logo.clearbit.com/squarespace.com', 9500.00, 'Negotiating', '2026-08-30', 'Portfolio building guide sponsorship.', ARRAY['1x YouTube Video Integration', '1x Newsletter slot']),
    ('d1000005-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'ASUS', 'https://logo.clearbit.com/asus.com', 25000.00, 'Lead', '2026-09-15', 'ROG Strix laptop launch review campaign.', ARRAY['1x Dedicated YouTube Video', '1x Instagram Carousel', '2x TikToks'])
ON CONFLICT (id) DO NOTHING;


-- Invoices
INSERT INTO public.invoices (id, user_id, deal_id, invoice_number, amount, status, due_date, sent_at, paid_at)
VALUES
    ('12000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000001-0000-0000-0000-000000000000', 'INV-2026-001', 8500.00, 'Paid', '2026-06-30', '2026-06-15 10:00:00+00', '2026-06-28 14:30:00+00'),
    ('12000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000002-0000-0000-0000-000000000000', 'INV-2026-002', 6000.00, 'Sent', '2026-07-31', '2026-07-01 09:15:00+00', NULL),
    ('12000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000003-0000-0000-0000-000000000000', 'INV-2026-003', 15000.00, 'Draft', '2026-08-25', NULL, NULL),
    ('12000004-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', NULL, 'INV-2026-004', 3500.00, 'Overdue', '2026-07-05', '2026-06-05 11:00:00+00', NULL)
ON CONFLICT (id) DO NOTHING;


-- Contracts
INSERT INTO public.contracts (id, user_id, deal_id, title, sign_status)
VALUES
    ('c3000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000001-0000-0000-0000-000000000000', 'Nike Workspace Setup Agreement.pdf', 'Signed'),
    ('c3000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000002-0000-0000-0000-000000000000', 'Spotify Podcast Partnership SOW.pdf', 'Signed'),
    ('c3000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000003-0000-0000-0000-000000000000', 'Adobe Creative Cloud Review Agreement.pdf', 'Pending Signatures')
ON CONFLICT (id) DO NOTHING;


-- Content Calendar
INSERT INTO public.content_calendar (id, user_id, deal_id, title, description, platform, status, schedule_date, cover_image_url)
VALUES
    ('cc000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000002-0000-0000-0000-000000000000', 'My 2026 Developer Desk Setup', 'Detailed tour of my desk accessories, productivity tools, and Spotify partnership shoutout.', 'YouTube', 'Published', '2026-07-05 15:00:00+00', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400'),
    ('cc000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000002-0000-0000-0000-000000000000', 'Why I Use Monospaced Fonts for Coding', 'Explaining the legibility of monospaced fonts and IDE setups.', 'Instagram', 'Scheduled', '2026-07-15 18:00:00+00', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400'),
    ('cc000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'd1000003-0000-0000-0000-000000000000', 'Next.js 15 App Router Tutorial', 'Full guide to Server Actions and dynamic routing in Next.js 15.', 'YouTube', 'In Progress', '2026-07-20 16:00:00+00', 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=400'),
    ('cc000004-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', NULL, 'A Day in the Life of a Solopreneur', 'Sleek b-roll and voiceover of my daily workflow as a creator.', 'TikTok', 'Idea', '2026-07-28 12:00:00+00', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400')
ON CONFLICT (id) DO NOTHING;


-- Assets
INSERT INTO public.assets (id, user_id, name, file_url, file_type, size_bytes, folder, thumbnail_url)
VALUES
    ('a4000001-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'desk_setup_final.mp4', 'https://example.com/files/desk_setup_final.mp4', 'video/mp4', 145000000, 'Videos', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150'),
    ('a4000002-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'workspace_nike_collab.png', 'https://example.com/files/workspace_nike_collab.png', 'image/png', 4200000, 'Images', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=150'),
    ('a4000003-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'brand_media_kit_v2.pdf', 'https://example.com/files/brand_media_kit_v2.pdf', 'application/pdf', 1200000, 'Documents', NULL)
ON CONFLICT (id) DO NOTHING;


-- Revenue Records (Monthly stats for trailing year 2025/2026)
INSERT INTO public.revenue_records (user_id, source, platform, amount, record_date, category)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 3200.00, '2025-08-31', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 6500.00, '2025-08-31', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 3400.00, '2025-09-30', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 8000.00, '2025-09-30', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 3100.00, '2025-10-31', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 5000.00, '2025-10-31', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 4500.00, '2025-11-30', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 12000.00, '2025-11-30', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 5200.00, '2025-12-31', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 15000.00, '2025-12-31', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'Affiliate', 'Instagram', 1200.00, '2025-12-31', 'Commissions'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 3800.00, '2026-01-31', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 4000.00, '2026-01-31', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 4000.00, '2026-02-28', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 9000.00, '2026-02-28', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 4200.00, '2026-03-31', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 10500.00, '2026-03-31', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 4100.00, '2026-04-30', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 8000.00, '2026-04-30', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 4600.00, '2026-05-31', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 11500.00, '2026-05-31', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'AdSense', 'YouTube', 4900.00, '2026-06-30', 'Ad Revenue'),
    ('00000000-0000-0000-0000-000000000000', 'Sponsorship', 'Direct', 12400.00, '2026-06-30', 'Brand Deals'),
    ('00000000-0000-0000-0000-000000000000', 'Affiliate', 'TikTok', 2100.00, '2026-06-30', 'Commissions');


-- AI Generations
INSERT INTO public.ai_generations (user_id, feature, prompt, response, model_used)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'caption', 'Topic: Desk Setup Tour, Platform: Instagram, Tone: Sleek/Inspiring', 'Minimalism meets productivity. ✨ Here is a sneak peek into the exact gear that keeps my engineering workflow smooth. Links in bio. #workspace #desksetup #developer #interiordesign', 'llama-3.3-70b-versatile'),
    ('00000000-0000-0000-0000-000000000000', 'insights', 'Generate performance evaluation based on Q2 2026 data.', 'Your short-form content (TikTok/Instagram Reels) is averaging 8.1% engagement compared to 4.8% on YouTube. Recommendation: Repurpose code tutorial highlights into vertical format.', 'llama-3.3-70b-versatile')
ON CONFLICT (id) DO NOTHING;


-- Notifications
INSERT INTO public.notifications (user_id, title, message, type)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'New Deal Lead', 'ASUS sent a lead request for ROG laptop review.', 'deal'),
    ('00000000-0000-0000-0000-000000000000', 'Contract Signed', 'Spotify signed the Podcast SOW contract.', 'deal'),
    ('00000000-0000-0000-0000-000000000000', 'Invoice Overdue', 'Invoice INV-2026-004 for $3,500 is overdue by 6 days.', 'invoice')
ON CONFLICT (id) DO NOTHING;
