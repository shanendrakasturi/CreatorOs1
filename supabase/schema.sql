-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Creator Profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Maps directly to auth.users.id
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    niche TEXT,
    bio TEXT,
    platforms JSONB DEFAULT '{}'::jsonb, -- e.g., {"youtube": {"handle": "@alex", "followers": 850000}, "instagram": {...}}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
CREATE POLICY "Users can read all profiles" ON public.users 
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users 
    FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users 
    FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 2. Brand Deals (Kanban Pipeline)
CREATE TABLE IF NOT EXISTS public.brand_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    logo_url TEXT,
    deal_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stage TEXT NOT NULL CHECK (stage IN ('Lead', 'Negotiating', 'Contract Sent', 'Active', 'Paid')),
    deadline DATE,
    description TEXT,
    deliverables TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.brand_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own brand deals" ON public.brand_deals;
CREATE POLICY "Users can manage their own brand deals" ON public.brand_deals 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.brand_deals(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue')),
    due_date DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own invoices" ON public.invoices;
CREATE POLICY "Users can manage their own invoices" ON public.invoices 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.brand_deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    file_url TEXT,
    sign_status TEXT NOT NULL CHECK (sign_status IN ('Draft', 'Pending Signatures', 'Signed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own contracts" ON public.contracts;
CREATE POLICY "Users can manage their own contracts" ON public.contracts 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Content Calendar
CREATE TABLE IF NOT EXISTS public.content_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.brand_deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('YouTube', 'Instagram', 'TikTok', 'Twitter', 'Twitch', 'Other')),
    status TEXT NOT NULL CHECK (status IN ('Idea', 'In Progress', 'Scheduled', 'Published')),
    schedule_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own calendar" ON public.content_calendar;
CREATE POLICY "Users can manage their own calendar" ON public.content_calendar 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 6. Asset Management
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- e.g., 'image/png', 'video/mp4', 'application/pdf'
    size_bytes INTEGER NOT NULL,
    folder TEXT NOT NULL DEFAULT 'root', -- e.g., 'Images', 'Videos', 'Documents'
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own assets" ON public.assets;
CREATE POLICY "Users can manage their own assets" ON public.assets 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 7. Revenue Records
CREATE TABLE IF NOT EXISTS public.revenue_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL, -- e.g., 'AdSense', 'Sponsorship', 'Affiliate', 'Merch'
    platform TEXT NOT NULL, -- e.g., 'YouTube', 'Instagram', 'TikTok', 'Direct'
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    record_date DATE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own revenue records" ON public.revenue_records;
CREATE POLICY "Users can manage their own revenue records" ON public.revenue_records 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 8. AI Generations History
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- e.g., 'caption', 'ideas', 'email', 'insights'
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI logs" ON public.ai_generations;
CREATE POLICY "Users can manage their own AI logs" ON public.ai_generations 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 9. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type TEXT NOT NULL, -- e.g., 'deal', 'invoice', 'calendar', 'alert'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications" ON public.notifications 
    FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_deals_user_stage ON public.brand_deals(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_user_date ON public.content_calendar(user_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_revenue_records_user_date ON public.revenue_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_assets_user_folder ON public.assets(user_id, folder);
