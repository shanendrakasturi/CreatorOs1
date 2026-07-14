import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

// Initialize client only if real credentials are provided
export const supabase =
  isValidSupabaseUrl(supabaseUrl) && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;


// Local Mock Database for guest mode or missing env variables
export class MockDatabase {
  static getStorage(key: string, defaultVal: any) {
    if (typeof window === 'undefined') return defaultVal;
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  }

  static setStorage(key: string, data: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Get initial values from seed structure
  static getDeals() {
    return this.getStorage('creatoros_deals', [
      { id: 'd1000001', brand_name: 'Nike', logo_url: 'https://logo.clearbit.com/nike.com', brandLogoUrl: 'https://logo.clearbit.com/nike.com', deal_value: 8500, stage: 'Paid', deadline: '2026-06-15', description: 'Air Max Campaign integration', deliverables: ['1x YouTube Video Integration', '1x Instagram Reel'] },
      { id: 'd1000002', brand_name: 'Spotify', logo_url: 'https://logo.clearbit.com/spotify.com', brandLogoUrl: 'https://logo.clearbit.com/spotify.com', deal_value: 12000, stage: 'Active', deadline: '2026-07-25', description: 'Podcast Sponsorship - 4 Episodes.', deliverables: ['4x 60s Mid-roll placements'] },
      { id: 'd1000003', brand_name: 'Adobe', logo_url: 'https://logo.clearbit.com/adobe.com', brandLogoUrl: 'https://logo.clearbit.com/adobe.com', deal_value: 15000, stage: 'Contract Sent', deadline: '2026-08-10', description: 'Creative Cloud Express review', deliverables: ['1x Dedicated YouTube Video', '2x TikToks'] },
      { id: 'd1000004', brand_name: 'Squarespace', logo_url: 'https://logo.clearbit.com/squarespace.com', brandLogoUrl: 'https://logo.clearbit.com/squarespace.com', deal_value: 9500, stage: 'Negotiating', deadline: '2026-08-30', description: 'Portfolio building guide sponsorship.', deliverables: ['1x YouTube Video Integration'] },
      { id: 'd1000005', brand_name: 'ASUS', logo_url: 'https://logo.clearbit.com/asus.com', brandLogoUrl: 'https://logo.clearbit.com/asus.com', deal_value: 25000, stage: 'Lead', deadline: '2026-09-15', description: 'ROG Strix laptop launch review.', deliverables: ['1x Dedicated YouTube Video', '1x Instagram Carousel'] }
    ]);
  }

  static saveDeals(deals: any) {
    this.setStorage('creatoros_deals', deals);
  }

  static getInvoices() {
    return this.getStorage('creatoros_invoices', [
      { id: 'i2000001', deal_id: 'd1000001', invoice_number: 'INV-2026-001', brand_name: 'Nike', amount: 8500, status: 'Paid', due_date: '2026-06-30' },
      { id: 'i2000002', deal_id: 'd1000002', invoice_number: 'INV-2026-002', brand_name: 'Spotify', amount: 6000, status: 'Sent', due_date: '2026-07-31' },
      { id: 'i2000003', deal_id: 'd1000003', invoice_number: 'INV-2026-003', brand_name: 'Adobe', amount: 15000, status: 'Draft', due_date: '2026-08-25' },
      { id: 'i2000004', deal_id: null, invoice_number: 'INV-2026-004', brand_name: 'Independent Brand', amount: 3500, status: 'Overdue', due_date: '2026-07-05' }
    ]);
  }

  static saveInvoices(invoices: any) {
    this.setStorage('creatoros_invoices', invoices);
  }

  static getCalendar() {
    return this.getStorage('creatoros_calendar', [
      { id: 'cc000001', deal_id: 'd1000002', title: 'My 2026 Developer Desk Setup', description: 'Detailed tour of desk accessories & Spotify integration.', platform: 'YouTube', status: 'Published', schedule_date: '2026-07-05T15:00:00.000Z', cover_image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
      { id: 'cc000002', deal_id: 'd1000002', title: 'Why I Use Monospaced Fonts for Coding', description: 'Explaining the legibility of monospaced fonts and IDE setups.', platform: 'Instagram', status: 'Scheduled', schedule_date: '2026-07-15T18:00:00.000Z', cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400' },
      { id: 'cc000003', deal_id: 'd1000003', title: 'Next.js 15 App Router Tutorial', description: 'Full guide to Server Actions and dynamic routing.', platform: 'YouTube', status: 'In Progress', schedule_date: '2026-07-20T16:00:00.000Z', cover_image_url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=400' },
      { id: 'cc000004', deal_id: null, title: 'A Day in the Life of a Solopreneur', description: 'Sleek b-roll and voiceover of creator workflow.', platform: 'TikTok', status: 'Idea', schedule_date: '2026-07-28T12:00:00.000Z', cover_image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' }
    ]);
  }

  static saveCalendar(posts: any) {
    this.setStorage('creatoros_calendar', posts);
  }

  static getAssets() {
    return this.getStorage('creatoros_assets', [
      { id: 'a4000001', name: 'desk_setup_final.mp4', file_url: '#', file_type: 'video/mp4', size_bytes: 145000000, folder: 'Videos', thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=150' },
      { id: 'a4000002', name: 'workspace_nike_collab.png', file_url: '#', file_type: 'image/png', size_bytes: 4200000, folder: 'Images', thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=150' },
      { id: 'a4000003', name: 'brand_media_kit_v2.pdf', file_url: '#', file_type: 'application/pdf', size_bytes: 1200000, folder: 'Documents', thumbnail_url: null }
    ]);
  }

  static saveAssets(assets: any) {
    this.setStorage('creatoros_assets', assets);
  }

  static getRevenueRecords() {
    return [
      { month: 'Aug 25', YouTube: 3200, Sponsorship: 6500, Affiliate: 400 },
      { month: 'Sep 25', YouTube: 3400, Sponsorship: 8000, Affiliate: 500 },
      { month: 'Oct 25', YouTube: 3100, Sponsorship: 5000, Affiliate: 600 },
      { month: 'Nov 25', YouTube: 4500, Sponsorship: 12000, Affiliate: 800 },
      { month: 'Dec 25', YouTube: 5200, Sponsorship: 15000, Affiliate: 1200 },
      { month: 'Jan 26', YouTube: 3800, Sponsorship: 4000, Affiliate: 900 },
      { month: 'Feb 26', YouTube: 4000, Sponsorship: 9000, Affiliate: 700 },
      { month: 'Mar 26', YouTube: 4200, Sponsorship: 10500, Affiliate: 1100 },
      { month: 'Apr 26', YouTube: 4100, Sponsorship: 8000, Affiliate: 950 },
      { month: 'May 26', YouTube: 4600, Sponsorship: 11500, Affiliate: 1500 },
      { month: 'Jun 26', YouTube: 4900, Sponsorship: 12400, Affiliate: 2100 }
    ];
  }

  static getNotifications() {
    return this.getStorage('creatoros_notifications', [
      { id: 'n1', title: 'New Deal Lead', message: 'ASUS sent a lead request for ROG laptop review.', type: 'deal', is_read: false, date: '2 hours ago' },
      { id: 'n2', title: 'Contract Signed', message: 'Spotify signed the Podcast SOW contract.', type: 'deal', is_read: true, date: '1 day ago' },
      { id: 'n3', title: 'Invoice Overdue', message: 'Invoice INV-2026-004 for $3,500 is overdue by 6 days.', type: 'invoice', is_read: false, date: '3 days ago' }
    ]);
  }

  static saveNotifications(notifications: any) {
    this.setStorage('creatoros_notifications', notifications);
  }

  static getProfile() {
    const profile = this.getStorage('creatoros_profile', {
      full_name: 'Alex Rivera',
      // null avatar → UserAvatar shows initial-letter fallback for guest mode
      avatar_url: null,
      niche: 'Tech & Digital Lifestyle',
      bio: 'Professional YouTuber & lifestyle creator focusing on software engineering, workspace setups, and productivity tech.',
      platforms: {
        youtube: { handle: '@alexriveratech', followers: 850000, engagement: 4.8 },
        instagram: { handle: '@alexrivera', followers: 420000, engagement: 5.2 },
        tiktok: { handle: '@alexrivera_tech', followers: 1200000, engagement: 8.1 }
      }
    });

    // Clean up old cached/seeded stock photo URL from previous sessions
    if (profile && typeof profile.avatar_url === 'string' && profile.avatar_url.includes('photo-1534528741775-53994a69daeb')) {
      profile.avatar_url = null;
      this.saveProfile(profile);
    }
    return profile;
  }

  static saveProfile(profile: any) {
    this.setStorage('creatoros_profile', profile);
  }

  static getIdeas() {
    return this.getStorage('creatoros_ideas', [
      {
        id: 'idea001',
        type: 'text',
        aiTitle: 'Morning Routine Productivity Stack',
        aiSummary: 'A video breaking down the exact tools and habits used every morning to stay focused as a creator.',
        tags: ['video idea', 'productivity', 'morning routine'],
        connectedIdeas: ['idea003'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        rawContent: 'That video idea about morning routines — apps I use, desk setup, Notion layout for the day'
      },
      {
        id: 'idea002',
        type: 'link',
        aiTitle: 'Viral YouTube Format: "I tried X for 30 days"',
        aiSummary: 'Trending format driving huge watch time. Could adapt to "30 days coding only on iPad" or similar.',
        tags: ['viral trend', 'YouTube format', 'content idea'],
        connectedIdeas: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        rawContent: 'https://youtube.com/trending'
      },
      {
        id: 'idea003',
        type: 'voice',
        aiTitle: 'Minimalist Creator Workspace Tour',
        aiSummary: 'Showcase a clean, dark-mode workspace built around the M3 MacBook Pro, with focus on cable management.',
        tags: ['desk setup', 'sponsorship', 'aesthetics'],
        connectedIdeas: ['idea001'],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        rawContent: 'Audio transcription: desk tour concept, dark mode setup, cable management tips'
      },
      {
        id: 'idea004',
        type: 'screenshot',
        aiTitle: 'AI Tools Comparison for Creators',
        aiSummary: 'Screenshot from a thread comparing Notion AI, ChatGPT and Claude for content workflows.',
        tags: ['AI tools', 'comparison', 'Q3'],
        connectedIdeas: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rawContent: 'Screenshot of Twitter/X thread on AI tools for creators'
      }
    ]);
  }

  static saveIdeas(ideas: any) {
    this.setStorage('creatoros_ideas', ideas);
  }

  static getOpportunities() {
    return this.getStorage('creatoros_opportunities', [
      {
        id: 'opp001',
        type: 'trending_topic',
        title: 'AI Video Editing Tools — Creator Explosion',
        description: 'Search volume for AI video editing tools up 340% this month. Perfect timing for a comparison video or sponsorship integration.',
        relevanceScore: 96,
        source: 'via YouTube Trends',
        niche: 'Tech Reviews',
        status: 'new',
        expiresAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'opp002',
        type: 'sponsorship',
        title: 'Notion — Creator Productivity Campaign Q3',
        description: 'Notion is actively sourcing tech creators for their Q3 "Work Smarter" campaign. Estimated rate: $8,000–$14,000 per integration.',
        relevanceScore: 92,
        source: 'via Brand Outreach Intel',
        niche: 'Tech Reviews',
        status: 'new',
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'opp003',
        type: 'viral_trend',
        title: '"Keyboard ASMR" Shorts Format — Trending Now',
        description: 'Short-form keyboard ASMR content is getting 2M–8M views consistently. Low production cost, high algorithmic push.',
        relevanceScore: 78,
        source: 'via TikTok Trending',
        niche: 'Tech Reviews',
        status: 'new',
        expiresAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'opp004',
        type: 'content_gap',
        title: 'No "Arc Browser vs Chrome 2026" Video Under 500K Views',
        description: 'Search gap detected: "Arc Browser review 2026" has 22K monthly searches but top results are 8+ months old and poorly optimized.',
        relevanceScore: 88,
        source: 'via Competitor Analysis',
        niche: 'Tech Reviews',
        status: 'new',
        expiresAt: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'opp005',
        type: 'brand_collab',
        title: 'Keychron — New K Series Launch Collab',
        description: 'Keychron is launching the K-Series Pro and is looking for authentic desk setup creators for review units + affiliate deal.',
        relevanceScore: 85,
        source: 'via Brand Radar',
        niche: 'Tech Reviews',
        status: 'saved',
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'opp006',
        type: 'event',
        title: 'VidCon 2026 — Creator Panel Applications Open',
        description: 'VidCon 2026 creator panel speaker applications are open until July 28. 3,500+ attendee audience, strong brand networking.',
        relevanceScore: 72,
        source: 'via Events Calendar',
        niche: 'Tech Reviews',
        status: 'new',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  }

  static saveOpportunities(opportunities: any) {
    this.setStorage('creatoros_opportunities', opportunities);
  }
}
