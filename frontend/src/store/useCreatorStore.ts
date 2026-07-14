import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { MockDatabase } from '@/lib/supabase';

interface CreatorStore {
  profile: any;
  deals: any[];
  invoices: any[];
  calendar: any[];
  assets: any[];
  notifications: any[];
  revenueRecords: any[];
  activeTab: string;
  searchQuery: string;
  
  // Actions
  fetchData: () => Promise<void>;
  setProfile: (profile: any) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Deals
  addDeal: (deal: any) => Promise<void>;
  updateDealStage: (dealId: string, newStage: string) => Promise<void>;
  deleteDeal: (dealId: string) => Promise<void>;
  
  // Calendar
  addPost: (post: any) => Promise<void>;
  updatePostStatus: (postId: string, newStatus: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // Invoices
  addInvoice: (invoice: any) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: string) => Promise<void>;
  
  // Assets
  addAsset: (asset: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  
  // Notifications
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

function formatRevenueRecords(records: any[]): any[] {
  const grouped: { [key: string]: { month: string; YouTube: number; Sponsorship: number; Affiliate: number } } = {};
  
  // Sort records by record_date ascending
  const sorted = [...records].sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime());
  
  sorted.forEach(rec => {
    const date = new Date(rec.record_date);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    if (!grouped[monthStr]) {
      grouped[monthStr] = { month: monthStr, YouTube: 0, Sponsorship: 0, Affiliate: 0 };
    }
    
    const amount = Number(rec.amount) || 0;
    const source = rec.source;
    if (source === 'YouTube' || source === 'AdSense') {
      grouped[monthStr].YouTube += amount;
    } else if (source === 'Sponsorship') {
      grouped[monthStr].Sponsorship += amount;
    } else {
      grouped[monthStr].Affiliate += amount;
    }
  });
  
  return Object.values(grouped);
}

export const useCreatorStore = create<CreatorStore>((set, get) => ({
  profile: null,
  deals: [],
  invoices: [],
  calendar: [],
  assets: [],
  notifications: [],
  revenueRecords: [],
  activeTab: 'Dashboard',
  searchQuery: '',

  fetchData: async () => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch profile
      let { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileErr || !profile) {
        // Create profile if not exists
        const { data: newProfile, error: insertErr } = await supabase
          .from('users')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Creator',
            niche: user.user_metadata?.niche || 'Gaming',
            // Use OAuth avatar if provided, otherwise null — never seed a stock photo
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: 'Welcome to your CreatorOS profile! Update your details to customize this bio.',
            platforms: {}
          })
          .select()
          .single();

        if (!insertErr && newProfile) {
          profile = newProfile;
        }
      } else if (user.id !== '00000000-0000-0000-0000-000000000000') {
        // Clean up old cached/seeded stock photo URL from the database for existing non-demo accounts
        if (profile.avatar_url && profile.avatar_url.includes('photo-1534528741775-53994a69daeb')) {
          profile.avatar_url = null;
          supabase.from('users').update({ avatar_url: null }).eq('id', user.id).then();
        }
      }

      // 2. Fetch other tables
      const [dealsRes, invoicesRes, calendarRes, assetsRes, notificationsRes, revenueRes] = await Promise.all([
        supabase.from('brand_deals').select('*').eq('user_id', user.id),
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('content_calendar').select('*').eq('user_id', user.id),
        supabase.from('assets').select('*').eq('user_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('revenue_records').select('*').eq('user_id', user.id)
      ]);

      set({
        profile: profile || null,
        deals: dealsRes.data || [],
        invoices: invoicesRes.data || [],
        calendar: calendarRes.data || [],
        assets: assetsRes.data || [],
        notifications: notificationsRes.data || [],
        revenueRecords: formatRevenueRecords(revenueRes.data || [])
      });
    } else {
      // Fallback to MockDatabase in local guest mode
      set({
        profile: MockDatabase.getProfile(),
        deals: MockDatabase.getDeals(),
        invoices: MockDatabase.getInvoices(),
        calendar: MockDatabase.getCalendar(),
        assets: MockDatabase.getAssets(),
        notifications: MockDatabase.getNotifications(),
        revenueRecords: MockDatabase.getRevenueRecords()
      });
    }
  },

  setProfile: async (profile) => {
    set({ profile });
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({
          full_name: profile.full_name,
          niche: profile.niche,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          platforms: profile.platforms,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      }
    } else {
      MockDatabase.saveProfile(profile);
    }
  },
  
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Deals
  addDeal: async (deal) => {
    let newDeal = { ...deal };
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('brand_deals').insert({
          user_id: user.id,
          brand_name: deal.brand_name,
          logo_url: deal.logo_url || `https://logo.clearbit.com/${deal.brand_name.toLowerCase().replace(/\s+/g, '')}.com`,
          deal_value: Number(deal.deal_value) || 0,
          stage: deal.stage || 'Lead',
          deadline: deal.deadline || null,
          description: deal.description || '',
          deliverables: deal.deliverables || []
        }).select().single();
        
        if (!error && data) {
          newDeal = data;
        }
      }
    } else {
      newDeal.id = `d_${Date.now()}`;
      const updated = [...get().deals, newDeal];
      MockDatabase.saveDeals(updated);
    }
    set({ deals: [...get().deals, newDeal] });
  },

  updateDealStage: async (dealId, newStage) => {
    const updated = get().deals.map(d => d.id === dealId ? { ...d, stage: newStage, updated_at: new Date().toISOString() } : d);
    set({ deals: updated });

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('brand_deals').update({
          stage: newStage,
          updated_at: new Date().toISOString()
        }).eq('id', dealId);
        
        const deal = updated.find(d => d.id === dealId);
        if (deal) {
          const { data: newNotif } = await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Deal Updated',
            message: `Campaign for ${deal.brand_name} moved to stage: ${newStage}.`,
            type: 'deal',
            is_read: false
          }).select().single();
          
          if (newNotif) {
            set({ notifications: [newNotif, ...get().notifications] });
          }
        }
      }
    } else {
      MockDatabase.saveDeals(updated);
      
      const deal = updated.find(d => d.id === dealId);
      if (deal) {
        const newNotification = {
          id: `n_${Date.now()}`,
          title: 'Deal Updated',
          message: `Campaign for ${deal.brand_name} moved to stage: ${newStage}.`,
          type: 'deal',
          is_read: false,
          date: 'Just now'
        };
        const updatedNotifs = [newNotification, ...get().notifications];
        MockDatabase.saveNotifications(updatedNotifs);
        set({ notifications: updatedNotifs });
      }
    }
  },

  deleteDeal: async (dealId) => {
    const updated = get().deals.filter(d => d.id !== dealId);
    set({ deals: updated });

    if (supabase) {
      await supabase.from('brand_deals').delete().eq('id', dealId);
    } else {
      MockDatabase.saveDeals(updated);
    }
  },

  // Calendar
  addPost: async (post) => {
    let newPost = { ...post };
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('content_calendar').insert({
          user_id: user.id,
          deal_id: post.deal_id || null,
          title: post.title,
          description: post.description || '',
          platform: post.platform || 'Other',
          status: post.status || 'Idea',
          schedule_date: post.schedule_date || new Date().toISOString(),
          cover_image_url: post.cover_image_url || null
        }).select().single();
        
        if (!error && data) {
          newPost = data;
        }
      }
    } else {
      newPost.id = `cc_${Date.now()}`;
      const updated = [...get().calendar, newPost];
      MockDatabase.saveCalendar(updated);
    }
    set({ calendar: [...get().calendar, newPost] });
  },

  updatePostStatus: async (postId, newStatus) => {
    const updated = get().calendar.map(p => p.id === postId ? { ...p, status: newStatus } : p);
    set({ calendar: updated });

    if (supabase) {
      await supabase.from('content_calendar').update({
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', postId);
    } else {
      MockDatabase.saveCalendar(updated);
    }
  },

  deletePost: async (postId) => {
    const updated = get().calendar.filter(p => p.id !== postId);
    set({ calendar: updated });

    if (supabase) {
      await supabase.from('content_calendar').delete().eq('id', postId);
    } else {
      MockDatabase.saveCalendar(updated);
    }
  },

  // Invoices
  addInvoice: async (invoice) => {
    let newInvoice = { ...invoice };
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('invoices').insert({
          user_id: user.id,
          deal_id: invoice.deal_id || null,
          invoice_number: invoice.invoice_number,
          amount: Number(invoice.amount) || 0,
          status: invoice.status || 'Draft',
          due_date: invoice.due_date || new Date().toISOString().split('T')[0],
          sent_at: invoice.status === 'Sent' ? new Date().toISOString() : null,
          paid_at: invoice.status === 'Paid' ? new Date().toISOString() : null
        }).select().single();
        
        if (!error && data) {
          newInvoice = data;
        }
        
        const { data: newNotif } = await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Invoice Created',
          message: `Invoice ${invoice.invoice_number} for ${invoice.brand_name || 'Campaign'} has been generated.`,
          type: 'invoice',
          is_read: false
        }).select().single();
        
        if (newNotif) {
          set({ notifications: [newNotif, ...get().notifications] });
        }
      }
    } else {
      newInvoice.id = `i_${Date.now()}`;
      const updated = [...get().invoices, newInvoice];
      MockDatabase.saveInvoices(updated);
      
      const newNotification = {
        id: `n_${Date.now()}`,
        title: 'Invoice Created',
        message: `Invoice ${invoice.invoice_number} for ${invoice.brand_name} has been generated.`,
        type: 'invoice',
        is_read: false,
        date: 'Just now'
      };
      const updatedNotifs = [newNotification, ...get().notifications];
      MockDatabase.saveNotifications(updatedNotifs);
      set({ notifications: updatedNotifs });
    }
    set({ invoices: [...get().invoices, newInvoice] });
  },

  updateInvoiceStatus: async (invoiceId, status) => {
    const updated = get().invoices.map(i => i.id === invoiceId ? { ...i, status } : i);
    set({ invoices: updated });

    if (supabase) {
      await supabase.from('invoices').update({
        status,
        updated_at: new Date().toISOString(),
        paid_at: status === 'Paid' ? new Date().toISOString() : null,
        sent_at: status === 'Sent' ? new Date().toISOString() : null
      }).eq('id', invoiceId);
    } else {
      MockDatabase.saveInvoices(updated);
    }
  },

  // Assets
  addAsset: async (asset) => {
    let newAsset = { ...asset };
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('assets').insert({
          user_id: user.id,
          name: asset.name,
          file_url: asset.file_url || '#',
          file_type: asset.file_type || 'application/octet-stream',
          size_bytes: Number(asset.size_bytes) || 0,
          folder: asset.folder || 'root',
          thumbnail_url: asset.thumbnail_url || null
        }).select().single();
        
        if (!error && data) {
          newAsset = data;
        }
      }
    } else {
      newAsset.id = `a_${Date.now()}`;
      const updated = [...get().assets, newAsset];
      MockDatabase.saveAssets(updated);
    }
    set({ assets: [...get().assets, newAsset] });
  },

  deleteAsset: async (assetId) => {
    const updated = get().assets.filter(a => a.id !== assetId);
    set({ assets: updated });

    if (supabase) {
      await supabase.from('assets').delete().eq('id', assetId);
    } else {
      MockDatabase.saveAssets(updated);
    }
  },

  // Notifications
  markAllNotificationsRead: async () => {
    const updated = get().notifications.map(n => ({ ...n, is_read: true }));
    set({ notifications: updated });

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      }
    } else {
      MockDatabase.saveNotifications(updated);
    }
  },

  markNotificationRead: async (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    set({ notifications: updated });

    if (supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } else {
      MockDatabase.saveNotifications(updated);
    }
  },

  deleteNotification: async (id) => {
    const updated = get().notifications.filter(n => n.id !== id);
    set({ notifications: updated });

    if (supabase) {
      await supabase.from('notifications').delete().eq('id', id);
    } else {
      MockDatabase.saveNotifications(updated);
    }
  }
}));
