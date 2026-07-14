const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class CreatorAPI {
  static async request(path: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`API Connection to ${url} failed, using local fallback service.`, e);
      throw e; // Bubble up to allow local mock fallback logic
    }
  }

  static _getToneTemplates(tone: string): { template: string; hook: string }[] {
    const templatesByTone: Record<string, { template: string; hook: string }[]> = {
      'Professional': [
        {
          template: "Looking to level up your approach to {topic}? Here's the framework that's been driving real results on {platform}. {emoji1} Save this for later. #strategy #business #{platformLower}",
          hook: "Authority-driven guide positioning the creator as an expert."
        },
        {
          template: "The biggest mistake people make with {topic}? Skipping the fundamentals. {emoji1} Here's what I do differently — and why it works on {platform}. #growthhack #professional",
          hook: "Leads with a common mistake to spark curiosity."
        },
        {
          template: "After months of research into {topic}, here are the 3 non-obvious insights that changed everything. {emoji1} Which one surprises you most? Comment below! #{platformLower} #insights",
          hook: "Numbered insights with a comment CTA for community engagement."
        },
        {
          template: "If you're serious about {topic} on {platform}, this is the one post you can't afford to miss. {emoji1} Bookmark it now, thank me later. #leadership #productivity",
          hook: "Creates urgency and FOMO to drive saves."
        },
        {
          template: "We need to talk about {topic}. {emoji1} The industry is shifting and here's how to stay ahead on {platform}. Drop your questions below! #futureofwork #business",
          hook: "Opens a conversation around a trending shift."
        },
        {
          template: "Data doesn't lie. {emoji1} Here's what the numbers say about {topic} and what every {platform} creator should know right now. #analytics #datadriven",
          hook: "Data-backed authority hook for credibility."
        },
      ],
      'Casual & Fun': [
        {
          template: "POV: You finally try {topic} and it's not what you expected at all {emoji1} Drop a 🙋 if you can relate! #relatable #creatorlife #{platformLower}",
          hook: "POV-style hook that invites audience participation."
        },
        {
          template: "Hot take: {topic} is actually underrated and no one talks about it enough. {emoji1} Here's my honest experience on {platform}. Agree or disagree? {emoji2} #honestreview",
          hook: "Controversial opinion style that drives debate in comments."
        },
        {
          template: "Nobody told me {topic} would be this fun! {emoji1} If you're sleeping on this, wake up. Details in bio {emoji2} #{platformLower} #mustknow",
          hook: "Excitement-driven hook that creates FOMO."
        },
        {
          template: "Rating {topic} out of 10: {emoji1} Spoiler — it slaps harder than I expected. Full breakdown on my {platform}. #review #honest",
          hook: "Rating format creates curiosity about the score."
        },
        {
          template: "Things I wish I knew before trying {topic}: {emoji1} A thread for everyone who's about to make the same mistakes I did. #tips #lessons #{platformLower}",
          hook: "Relatable lessons format driving shares."
        },
        {
          template: "The best part about {topic}? It's way simpler than everyone makes it seem. {emoji1} Here's the no-fluff version for {platform}. Tag someone who needs this! {emoji2}",
          hook: "Simplification angle that encourages tagging."
        },
      ],
      'Inspirational': [
        {
          template: "One year ago I knew nothing about {topic}. Today it's changed my entire game on {platform}. {emoji1} If I can do it, so can you. #journey #growth",
          hook: "Personal transformation story that inspires the audience."
        },
        {
          template: "The best investment you'll make this year isn't financial — it's learning {topic}. {emoji1} Your future self will thank you. Start today. #mindset #success",
          hook: "Reframes learning as a form of investment."
        },
        {
          template: "Hard truth about {topic}: the people who thrive aren't luckier — they just started earlier. {emoji1} Your turn. #{platformLower} #consistency",
          hook: "Challenge-style motivation that removes excuses."
        },
        {
          template: "You don't need to be perfect at {topic}. {emoji1} You just need to be consistent on {platform}. Small steps, big results. #progress #growthmindset",
          hook: "Removes perfection paralysis and encourages starting."
        },
        {
          template: "That moment when {topic} finally clicks and you realise you've been overthinking it. {emoji1} Share this with someone who needs to hear it today. #aha #breakthroughs",
          hook: "Relatable breakthrough moment that drives shares."
        },
        {
          template: "Stop waiting for the 'right time' to start {topic}. {emoji1} The right time is now. Build something great on {platform} this week. #action #motivation",
          hook: "Direct call-to-action combating procrastination."
        },
      ],
      'Educational': [
        {
          template: "Everything you need to know about {topic} in under 60 seconds. {emoji1} Save this for reference! #{platformLower} #quicklearn #tutorial",
          hook: "Time-boxed learning hook encouraging saves."
        },
        {
          template: "5 things I learned about {topic} that took me way too long to figure out. {emoji1} Don't make the same mistakes. #lessons #tips #education",
          hook: "Number-list format with a mistake-avoidance angle."
        },
        {
          template: "Beginner's guide to {topic} — no fluff, just the stuff that actually works. {emoji1} {platform} creators, this one's for you. #howto #guide",
          hook: "Beginner-friendly label broadens reach to new audiences."
        },
        {
          template: "Why most people get {topic} completely wrong on {platform}: {emoji1} Here's the correct approach backed by real results. #mythbusting #facts",
          hook: "Myth-busting framing drives high curiosity clicks."
        },
        {
          template: "The science behind {topic} explained simply. {emoji1} Once you understand this, everything changes. Repost to help your followers! #{platformLower} #knowledge",
          hook: "Science-backed angle builds trust and shareability."
        },
        {
          template: "I tested 10 different approaches to {topic} so you don't have to. {emoji1} Here's what actually works on {platform}. #experiment #bestpractice",
          hook: "Testing-based content signals credibility."
        },
      ],
      'Hype / Energetic': [
        {
          template: "THIS IS YOUR SIGN to finally go all-in on {topic}! {emoji1} The {platform} grind is REAL and this is how we WIN! {emoji2} #letsgo #hustle",
          hook: "Permission-giving hype that creates urgency."
        },
        {
          template: "Nobody is talking about how insane {topic} really is right now! {emoji1} Get in before everyone else catches on! #{platformLower} #earlybird #viral",
          hook: "Insider knowledge style creating FOMO."
        },
        {
          template: "WARNING: {topic} is about to change EVERYTHING on {platform}. {emoji1} Are you ready? Because we are! {emoji2} #gamechanging #ready",
          hook: "Warning format creates pattern interrupt."
        },
        {
          template: "Just dropped the most FIRE content on {topic} you'll see on {platform} today! {emoji1} Go watch it NOW and tell me I'm wrong! {emoji2} #fire #trending",
          hook: "Bold challenge drives comments and clicks."
        },
        {
          template: "The CHEAT CODE for {topic} that nobody wants to share: {emoji1} You're welcome. Drop a 🔥 in the comments if this helped! #{platformLower}",
          hook: "Cheat code framing implies exclusive insider knowledge."
        },
        {
          template: "We hit a new milestone with {topic} and I'm not done yet! {emoji1} Join me on {platform} as we push even further — NOTHING can stop us! {emoji2} #unstoppable",
          hook: "Milestone celebration hooks fans emotionally."
        },
      ],
    };

    return templatesByTone[tone] || [
      { template: "Have you tried {topic} yet? {emoji1} Here's why it's trending on {platform} right now. #trending #mustknow", hook: "Curiosity-driven question hook." },
      { template: "My honest take on {topic}: {emoji1} It's more powerful than I thought. Check the full breakdown on {platform}. #review #honest", hook: "Honest opinion style builds trust." },
      { template: "The ultimate guide to {topic} is finally here! {emoji1} Everything you need in one place for {platform}. Save this! #guide #allinone", hook: "Comprehensive guide angle drives saves." },
    ];
  }

  static _renderTemplate(tInfo: { template: string; hook: string }, topic: string, platform: string, tone: string): { caption: string; hook: string } {
    const emojisByTone: Record<string, string[]> = {
      'Professional': ['📊', '📈', '💡', '🔍', '🤝', '💼', '🎯', '🏆', '🧩'],
      'Casual & Fun': ['😎', '✨', '🔥', '🤷', '🍿', '🎉', '👀', '😂', '🙌'],
      'Inspirational': ['🌟', '💪', '🚀', '🌱', '🙏', '🌈', '⚡', '🎯', '🏅'],
      'Educational': ['📚', '🧠', '💡', '🛠️', '📝', '🔬', '🎓', '📖', '💻'],
      'Hype / Energetic': ['💥', '🔥', '⚡', '🚀', '🥳', '📣', '🏆', '🎯', '💪'],
    };
    const toneEmojis = emojisByTone[tone] || ['✨', '🔥', '💡', '🚀'];
    const platformLower = platform.toLowerCase();

    const e1 = toneEmojis[Math.floor(Math.random() * toneEmojis.length)];
    const remaining = toneEmojis.filter(e => e !== e1);
    const e2 = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : toneEmojis[0];

    const caption = tInfo.template
      .replace(/{topic}/g, topic)
      .replace(/{platform}/g, platform)
      .replace(/{platformLower}/g, platformLower)
      .replace(/{emoji1}/g, e1)
      .replace(/{emoji2}/g, e2);

    return { caption, hook: tInfo.hook };
  }

  static _generateFrontendFallbackCaption(
    topic: string, platform: string, tone: string,
    existingCaptions: string[], usedTemplateIndices: number[] = []
  ): { caption: string; hook: string; _templateIdx: number } {
    const templates = this._getToneTemplates(tone);

    // Prefer unused template indices first
    let available = templates.map((_, i) => i).filter(i => !usedTemplateIndices.includes(i));
    if (available.length === 0) available = templates.map((_, i) => i);

    // Shuffle available indices
    available = [...available].sort(() => Math.random() - 0.5);

    for (const idx of available) {
      const rendered = this._renderTemplate(templates[idx], topic, platform, tone);
      if (!existingCaptions.includes(rendered.caption)) {
        return { ...rendered, _templateIdx: idx };
      }
    }

    // Last resort
    const idx = available[0];
    const rendered = this._renderTemplate(templates[idx], topic, platform, tone);
    return { caption: rendered.caption + ' ✦', hook: rendered.hook, _templateIdx: idx };
  }


  static async generateCaptions(
    topic: string,
    platform: string,
    tone: string,
    model?: string,
    regenerateIndex?: number,
    existingCaptions?: string[]
  ): Promise<any> {
    try {
      const res = await this.request('/api/captions', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          platform,
          tone,
          model,
          regenerate_index: regenerateIndex,
          existing_captions: existingCaptions
        }),
      });
      return res.data;
    } catch {
      // Frontend Local fallback if FastAPI backend is completely offline
      if (regenerateIndex !== undefined && existingCaptions) {
        // Regenerating a single caption offline — strip internal _templateIdx before returning
        const { _templateIdx, ...result } = this._generateFrontendFallbackCaption(
          topic, platform, tone, existingCaptions
        );
        return result;
      }

      // Initial 3 captions offline — track used template indices for diversity
      const results = [];
      const caps: string[] = [];
      const usedIndices: number[] = [];

      for (let i = 0; i < 3; i++) {
        const { _templateIdx, ...obj } = this._generateFrontendFallbackCaption(
          topic, platform, tone, caps, usedIndices
        );
        if (_templateIdx !== undefined) usedIndices.push(_templateIdx);
        results.push(obj);
        caps.push(obj.caption);
      }
      return results;
    }
  }

  static async generateInsights(analyticsSummary: string): Promise<any[]> {
    try {
      const res = await this.request('/api/insights', {
        method: 'POST',
        body: JSON.stringify({ analytics_summary: analyticsSummary }),
      });
      return res.data;
    } catch {
      // Local fallback
      return [
        {
          title: "Optimize Reels Length",
          metric: "+15.2% Reach",
          description: "Reels between 15-20 seconds are gaining 3x more views than longer clips. Trim intros to get straight to the code value.",
          impact: "High"
        },
        {
          title: "AdSense Peak Timing",
          metric: "December Spike",
          description: "Sponsorship values are projected to rise by 40% in Q4. Keep slots open for high CPM campaigns.",
          impact: "Medium"
        },
        {
          title: "Thumbnail Contrast Alert",
          metric: "CTR Boost",
          description: "Thumbnails using dark-grey backgrounds with high-contrast blue glows have a 6.2% CTR vs. 4% default. Keep this style consistent.",
          impact: "High"
        }
      ];
    }
  }

  static async suggestIdeas(niche: string, recentPerformance: string): Promise<any[]> {
    try {
      const res = await this.request('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ niche, recent_performance: recentPerformance }),
      });
      return res.data;
    } catch {
      return [
        {
          title: "Full Setup Tour 2026: Ergonomics & Code",
          platform: "YouTube",
          difficulty: "Hard",
          reason: "Desk setups are highly searchable and draw sponsorships easily."
        },
        {
          title: "Why I Quit Tailwind (And What I Use Now)",
          platform: "YouTube",
          difficulty: "Medium",
          reason: "Contrarian opinions drive high CTR and viewer discussion."
        },
        {
          title: "3 CSS Tips for Premium Looking Forms",
          platform: "TikTok",
          difficulty: "Easy",
          reason: "Quick hacks perform exceptionally well in short-form feeds."
        }
      ];
    }
  }

  static async draftEmail(brand: string, value: number, stage: string, details: string): Promise<string> {
    try {
      const res = await this.request('/api/email-draft', {
        method: 'POST',
        body: JSON.stringify({ brand, value, stage, details }),
      });
      return res.data.email;
    } catch {
      return `Hi Team at ${brand},\n\nHope this email finds you well!\n\nI'm writing to touch base regarding our upcoming sponsorship campaign. Currently we are at the "${stage}" stage, and I wanted to see if we could align on the rate card. Our current package value is estimated at $${value.toLocaleString()} based on our audience analytics of 850k active tech subscribers. \n\nLet me know if you would like me to send over our media kit PDF or jump on a call to finalize details.\n\nBest regards,\nAlex Rivera`;
    }
  }

  static async downloadInvoicePdf(invoice: any): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoice-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: invoice.invoice_number,
          brand_name: invoice.brand_name,
          amount: invoice.amount,
          status: invoice.status,
          due_date: invoice.due_date
        })
      });

      if (!res.ok) throw new Error("Backend PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn("Could not retrieve PDF from backend, simulating download.", e);
      alert(`Downloaded mockup PDF for Invoice ${invoice.invoice_number}`);
    }
  }

  static async downloadMediaKitPdf(profile: any): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mediakit-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          niche: profile.niche,
          bio: profile.bio
        })
      });

      if (!res.ok) throw new Error("Backend PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mediakit-${profile.full_name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn("Could not retrieve PDF from backend, simulating download.", e);
      alert(`Downloaded mockup PDF for Media Kit - ${profile.full_name}`);
    }
  }

  // ── Creator Brain ─────────────────────────────────────────────────────────

  static async enrichIdea(content: string, type: string): Promise<{ title: string; summary: string; tags: string[] }> {
    try {
      const res = await this.request('/api/brain/enrich', {
        method: 'POST',
        body: JSON.stringify({ content, type }),
      });
      return res.data;
    } catch {
      // Local fallback — generate a plausible title from content
      const words = content.trim().split(/\s+/).slice(0, 6).join(' ');
      return {
        title: words.charAt(0).toUpperCase() + words.slice(1),
        summary: content.trim().slice(0, 120),
        tags: ['idea', type, 'creator']
      };
    }
  }

  static async searchIdeas(query: string, allIdeas: any[]): Promise<any[]> {
    try {
      const res = await this.request(`/api/brain/search?q=${encodeURIComponent(query)}`, {
        method: 'POST',
        body: JSON.stringify({ ideas: allIdeas }),
      });
      return res.data;
    } catch {
      // Local fallback — simple substring search
      const q = query.toLowerCase();
      return allIdeas.filter(i =>
        i.aiTitle?.toLowerCase().includes(q) ||
        i.aiSummary?.toLowerCase().includes(q) ||
        i.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
        i.rawContent?.toLowerCase().includes(q)
      );
    }
  }

  static async getResurfacedIdeas(allIdeas: any[]): Promise<any[]> {
    try {
      const res = await this.request('/api/brain/resurface', {
        method: 'POST',
        body: JSON.stringify({ ideas: allIdeas }),
      });
      return res.data;
    } catch {
      // Local fallback — pick the 2 oldest ideas and add a generic reason
      const sorted = [...allIdeas].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return sorted.slice(0, 2).map(idea => ({
        ...idea,
        resurfaceReason: 'This idea aligns with your current content momentum — now is a great time to revisit it.'
      }));
    }
  }

  static async updateIdea(id: string, fields: {
    rawContent?: string;
    tags?: string[];
    type?: string;
    aiTitle?: string;
    aiSummary?: string;
  }): Promise<{ title?: string; summary?: string; tags?: string[]; rawContent?: string; aiTitle?: string; aiSummary?: string }> {
    try {
      const res = await this.request(`/api/brain/ideas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fields),
      });
      return res.idea;
    } catch {
      // Local fallback — if content changed, re-derive title from it
      const result: any = { ...fields };
      if (fields.rawContent) {
        const words = fields.rawContent.trim().split(/\s+/).slice(0, 8).join(' ');
        result.aiTitle = words.charAt(0).toUpperCase() + words.slice(1);
        result.aiSummary = fields.rawContent.trim().slice(0, 150);
      }
      return result;
    }
  }

  static async deleteIdea(id: string): Promise<void> {
    try {
      await this.request(`/api/brain/ideas/${id}`, { method: 'DELETE' });
    } catch {
      // Backend confirmation is optional — frontend already removed the card optimistically.
      // Silently succeed so we don't roll back a valid local delete.
      console.warn(`DELETE /api/brain/ideas/${id} failed — local state already cleaned up.`);
    }
  }

  static async updateProfile(fields: { niche?: string; full_name?: string; bio?: string; avatar_url?: string | null }): Promise<any> {
    try {
      const res = await this.request('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(fields),
      });
      return res.data;
    } catch (e) {
      console.warn("Failed to update profile via API, falling back locally", e);
      return fields;
    }
  }

  static _generateFrontendFallbackOpportunities(niche: string): any[] {
    const n = niche.toLowerCase();
    if (n.includes("game") || n.includes("gaming")) {
      return [
        {
          type: "trending_topic",
          title: "GTA 6, Valorant & Minecraft Modding Surge",
          description: "Massive search traffic spike detected for GTA 6 modding tutorials and Valorant competitive guides.",
          relevanceScore: 95,
          source: "via YouTube Trends"
        },
        {
          type: "brand_collab",
          title: "Razer & Logitech G Creator Sponsorships",
          description: "Active campaign for hardware reviews. They are looking for creators to review their latest gaming mice and keyboards.",
          relevanceScore: 90,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "No-Hit Challenge Runs & Speedruns",
          description: "Short-form clips of no-hit bosses or ultra-fast speedruns are hitting the algorithms and gaining millions of views.",
          relevanceScore: 85,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Discord & NVIDIA Partnership Campaign",
          description: "Discord is sponsoring server integrations, and NVIDIA is looking for RTX showcase videos. Paid campaigns start at $5,000.",
          relevanceScore: 92,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "TwitchCon 2026 & Gamescom Creators Meetup",
          description: "Networking hubs for game publishers and creators. High demand for live coverage and vlogs.",
          relevanceScore: 80,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "Best GTA 6 Graphics Settings for PC",
          description: "High search volume but very few optimized performance-guide videos. High CTR potential for early guides.",
          relevanceScore: 89,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("tech") || n.includes("technology") || n.includes("software") || n.includes("code") || n.includes("coding") || n.includes("developer")) {
      return [
        {
          type: "trending_topic",
          title: "Next-Gen AI Tools & Arc Browser Customizations",
          description: "Search volume for new local AI agents and Arc browser settings is up 250% this month.",
          relevanceScore: 97,
          source: "via Google Trends"
        },
        {
          type: "brand_collab",
          title: "Notion & Adobe Integration Campaign",
          description: "Adobe and Notion are paying tech and development creators for workflow organization tutorials.",
          relevanceScore: 94,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "\"Build an App in 10 Minutes with AI\" Shorts",
          description: "Fast-paced build tutorials utilizing Claude and ChatGPT are going viral on Reels and TikTok.",
          relevanceScore: 88,
          source: "via Reels Algorithmic Push"
        },
        {
          type: "sponsorship",
          title: "Microsoft Azure & GitHub Copilot Creator Program",
          description: "GitHub is actively sponsoring developers to showcase Copilot Workspace features in their daily workflow.",
          relevanceScore: 91,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "CES 2026 & Google I/O Creator Summit",
          description: "Top tech events hosting exclusive creator demo zones. Great opportunity for vlog coverage and first-impressions.",
          relevanceScore: 84,
          source: "via Industry Press Releases"
        },
        {
          type: "content_gap",
          title: "AI Productivity Apps for Solopreneurs",
          description: "Search volume for 'AI apps for solopreneurs' has spiked, but current videos are outdated. High potential for a top list.",
          relevanceScore: 90,
          source: "via Competitor Analysis"
        }
      ];
    } else if (n.includes("lifestyle") || n.includes("minimal") || n.includes("productivity")) {
      return [
        {
          type: "trending_topic",
          title: "Morning Routine & Clean Aesthetics",
          description: "Vibrant search interest in slow morning routines, aesthetic tea/coffee making, and daily planning.",
          relevanceScore: 93,
          source: "via Pinterest Trends"
        },
        {
          type: "brand_collab",
          title: "IKEA & Samsung Home Workspace Makeover",
          description: "IKEA is actively sending furniture and accessories to creators who showcase home office redesigns.",
          relevanceScore: 89,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "\"Day in the life of a Solopreneur\" Voiceover",
          description: "Aesthetic, high-contrast b-roll reels with calming voiceovers are trending heavily in lifestyle feeds.",
          relevanceScore: 91,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Skillshare & Squarespace Education Integration",
          description: "Skillshare is offering flat fee sponsorships plus higher-tier affiliate codes for productivity courses.",
          relevanceScore: 88,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "Aesthetic Design Expo & Clean Space Summit",
          description: "Designers and architects showcase premium workspace elements. Excellent source for inspiration and b-roll content.",
          relevanceScore: 76,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "Minimalist Workspace Setup for Small Rooms",
          description: "High search query volume for 'small room minimalist setup' with low-quality existing videos.",
          relevanceScore: 86,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("fashion") || n.includes("beauty") || n.includes("style")) {
      return [
        {
          type: "trending_topic",
          title: "90s Retro Style Revivals & Quiet Luxury",
          description: "Search volume for 'retro aesthetic fashion' and 'quiet luxury outfit ideas' is up 180%.",
          relevanceScore: 94,
          source: "via Instagram Explorer"
        },
        {
          type: "brand_collab",
          title: "Sephora & Zara Seasonal Lookbook Collabs",
          description: "Sephora is launching a creator squad for makeup tutorials, and Zara is doing PR package gifting.",
          relevanceScore: 92,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "\"GRWM\" (Get Ready With Me) Transition Reels",
          description: "Seamless transition videos from pajamas to aesthetic outfits are generating millions of loop views.",
          relevanceScore: 95,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Dyson & L'Oreal Hair/Skincare Campaign",
          description: "Paid integration campaigns for Dyson Airwrap styling guides and Skincare routine videos.",
          relevanceScore: 89,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "New York Fashion Week 2026 & Beautycon",
          description: "Main seasonal meetups for fashion vloggers. Exclusive passes available for creators above 100k followers.",
          relevanceScore: 83,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "Affordable Quiet Luxury Wardrobe Essentials",
          description: "High search volume but mostly luxury-brand videos. A budget quiet luxury guide is highly requested.",
          relevanceScore: 87,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("finance") || n.includes("business") || n.includes("money") || n.includes("invest")) {
      return [
        {
          type: "trending_topic",
          title: "Side Hustles for 2026 & Passive Income Streams",
          description: "Huge search volume for secondary income sources, retail arbitrage, and AI digital downloads.",
          relevanceScore: 96,
          source: "via YouTube Trends"
        },
        {
          type: "brand_collab",
          title: "Notion Business Templates & Wise Integration",
          description: "Notion and Wise are paying creators to demonstrate invoicing, bookkeeping, and global finances.",
          relevanceScore: 91,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "Real Estate Investing Myths Debunked",
          description: "Short, rapid-fire comparison clips showing rent vs buy calculators are trending heavily.",
          relevanceScore: 87,
          source: "via Reels Algorithmic Push"
        },
        {
          type: "sponsorship",
          title: "Shopify & Webflow Business Starter Campaigns",
          description: "Shopify is sponsoring videos showing how to build an e-commerce brand from scratch. Rates starting at $7,000.",
          relevanceScore: 93,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "FinCon 2026 & E-commerce Success Expo",
          description: "Premier business creator events. Great for panel networking and securing brand deals.",
          relevanceScore: 85,
          source: "via Industry Press Releases"
        },
        {
          type: "content_gap",
          title: "Tax Deductions for Creators & Influencers",
          description: "High search volume in Q1/Q2 but very few easy-to-understand guides from certified professionals.",
          relevanceScore: 89,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("travel") || n.includes("explore") || n.includes("adventure")) {
      return [
        {
          type: "trending_topic",
          title: "Solo Travel Destinations & Hidden Gems in Asia",
          description: "Massive search growth for 'affordable solo travel' and 'undiscovered spots in Vietnam/Bali'.",
          relevanceScore: 92,
          source: "via Google Trends"
        },
        {
          type: "brand_collab",
          title: "Airbnb & GoPro Adventure Equipment PR Pack",
          description: "Airbnb is looking for creators to review unique stays, and GoPro is offering the latest camera units.",
          relevanceScore: 90,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "Seamless Location Transition Reels",
          description: "Fast camera transitions linking hotel room keys directly to beautiful beaches are going viral.",
          relevanceScore: 94,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Klook & NordVPN Secure Travel Sponsorships",
          description: "NordVPN is paying travel vloggers to emphasize cybersecurity on public airport Wi-Fi.",
          relevanceScore: 88,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "World Travel Market 2026 & Travel Creator Summit",
          description: "Meet tourism boards looking for content creators. Many sponsored press trip opportunities.",
          relevanceScore: 82,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "Complete Bali Travel Guide on a Budget",
          description: "Most guides are high-end. Budget travel itineraries for Bali are experiencing a search gap.",
          relevanceScore: 85,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("fitness") || n.includes("gym") || n.includes("health") || n.includes("workout")) {
      return [
        {
          type: "trending_topic",
          title: "Calisthenics & Home Workouts",
          description: "Search volume for 'bodyweight strength routines' and 'minimalist home gyms' is up 210%.",
          relevanceScore: 91,
          source: "via YouTube Trends"
        },
        {
          type: "brand_collab",
          title: "Gymshark & MyProtein Creator Ambassador Program",
          description: "Gymshark is actively recruiting mid-tier creators for product placement and affiliate codes.",
          relevanceScore: 89,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "10-Minute High-Intensity Tabata Challenges",
          description: "Short-form workout challenge clips are gaining millions of views on Instagram and TikTok.",
          relevanceScore: 93,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Athletic Greens (AG1) & Whoop Tracker Campaigns",
          description: "Whoop is sponsoring creators to display fitness tracker metrics and recover data during workouts.",
          relevanceScore: 92,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "Arnold Sports Festival 2026 & Fitness Expo",
          description: "The largest fitness gathering. Great opportunity for networking and finding new supplement brands.",
          relevanceScore: 84,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "Calisthenics Progressions for Absolute Beginners",
          description: "Search volume is high, but most content starts too advanced. A simplified step-by-step gap exists.",
          relevanceScore: 86,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("cook") || n.includes("food") || n.includes("recipe") || n.includes("kitchen")) {
      return [
        {
          type: "trending_topic",
          title: "15-Minute Healthy Air Fryer Meals",
          description: "Air fryer recipe tutorials are dominating search volumes, particularly for high-protein meals.",
          relevanceScore: 95,
          source: "via Pinterest Trends"
        },
        {
          type: "brand_collab",
          title: "HelloFresh & HexClad Premium Cookware Gifting",
          description: "HexClad is seeking food creators for aesthetic cooking videos featuring their non-stick hybrid pans.",
          relevanceScore: 90,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "\"ASMR Cooking\" & Sound-first Recipes",
          description: "Cooking videos focused on the sizzle, chop, and crunch without talk or background music are trending.",
          relevanceScore: 96,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Our Place & Blue Apron Subscription Partnerships",
          description: "Blue Apron is sponsoring recipe integrations. High flat-rates plus commissions per signup.",
          relevanceScore: 87,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "National Food & Beverage Expo 2026",
          description: "Connect with local ingredient brands and kitchenware manufacturers seeking creators.",
          relevanceScore: 79,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "High-Protein Meals Under $5 (Weekly Prep)",
          description: "High demand for inflation-friendly cooking videos with low prep time. High CTR search query detected.",
          relevanceScore: 92,
          source: "via Search Gap Analysis"
        }
      ];
    } else if (n.includes("music") || n.includes("song") || n.includes("audio") || n.includes("guitar") || n.includes("piano")) {
      return [
        {
          type: "trending_topic",
          title: "Lo-Fi Beats Production & Synth Wave Design",
          description: "Growing interest in lo-fi production breakdowns and designing custom synth patches.",
          relevanceScore: 90,
          source: "via Spotify Trends"
        },
        {
          type: "brand_collab",
          title: "Fender & Roland Creator Gear Review Packs",
          description: "Fender is actively looking for guitarists to review their new player series instruments.",
          relevanceScore: 88,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: "Song Re-creation in 60 Seconds",
          description: "Deconstructing famous tracks and rebuilding them using MIDI instruments in short-form videos is trending.",
          relevanceScore: 93,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: "Splice & DistroKid Distribution Deals",
          description: "DistroKid is sponsoring tutorials explaining how independent artists can distribute their music to Spotify.",
          relevanceScore: 92,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: "NAMM Show 2026 & Music Production Summit",
          description: "The largest music product event. Highly recommended for vlog coverage and networking with plugin brands.",
          relevanceScore: 86,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: "How to Mix Vocals for Beginners (FL Studio)",
          description: "High search volume but existing tutorials are over-complicated. A simplified beginner workflow is needed.",
          relevanceScore: 87,
          source: "via Search Gap Analysis"
        }
      ];
    } else {
      // Smart generic fallback that uses the niche name dynamically
      return [
        {
          type: "trending_topic",
          title: `Viral Trends in ${niche} for 2026`,
          description: `Emerging formats showing up to 300% search growth this quarter for ${niche}-related content.`,
          relevanceScore: 91,
          source: "via Google Trends"
        },
        {
          type: "brand_collab",
          title: `${niche} Brand Ambassador Campaigns`,
          description: `Aesthetic and industry-leading brands in the ${niche} space are launching creator outreach campaigns.`,
          relevanceScore: 88,
          source: "via Brand Radar"
        },
        {
          type: "viral_trend",
          title: `POV: Explaining ${niche} to a Beginner`,
          description: "Sleek transitions and quick-witted explanations are driving view duration in this category.",
          relevanceScore: 85,
          source: "via TikTok Trending"
        },
        {
          type: "sponsorship",
          title: `${niche} Software & Tools Promotion`,
          description: `New tools in the ${niche} sector are funding creator integrations starting at $3,500.`,
          relevanceScore: 89,
          source: "via Brand Outreach Intel"
        },
        {
          type: "event",
          title: `${niche} Creators & Professionals Summit 2026`,
          description: `The biggest seasonal networking event for ${niche} enthusiasts and creators.`,
          relevanceScore: 82,
          source: "via Event Calendars"
        },
        {
          type: "content_gap",
          title: `No Comprehensive ${niche} Tutorial for 2026`,
          description: `Search gap identified: High monthly search volume for beginner tutorials in ${niche} but most guides are outdated.`,
          relevanceScore: 87,
          source: "via Search Gap Analysis"
        }
      ];
    }
  }

  static async scanOpportunities(niche: string, model?: string): Promise<any[]> {
    try {
      const res = await this.request('/api/opportunities/scan', {
        method: 'POST',
        body: JSON.stringify({ niche, model }),
      });
      return res.data;
    } catch {
      const opps = this._generateFrontendFallbackOpportunities(niche);
      return opps.map(o => ({
        ...o,
        relevanceScore: Math.min(99, Math.max(70, o.relevanceScore + Math.floor(Math.random() * 7) - 3))
      }));
    }
  }

  // ── Settings & Security ───────────────────────────────────────────────────

  static async updateSettings(settings: {
    theme?: string;
    accentColor?: string;
    compactMode?: boolean;
    twoFactorEnabled?: boolean;
  }): Promise<any> {
    try {
      return await this.request('/api/users/me/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      });
    } catch {
      return { success: true, settings };
    }
  }

  static async changePassword(passwords: any): Promise<any> {
    return await this.request('/api/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords)
    });
  }

  static async getActiveDevices(): Promise<any[]> {
    try {
      const res = await this.request('/api/users/me/devices');
      return res.devices || [];
    } catch {
      return [
        { id: "dev_1", device: "Chrome (Windows 11)", location: "New York, USA", lastActive: "Active now", isCurrent: true },
        { id: "dev_2", device: "Safari (iPhone 15)", location: "New York, USA", lastActive: "2 hours ago", isCurrent: false }
      ];
    }
  }

  static async logoutDevice(deviceId: string): Promise<any> {
    try {
      return await this.request(`/api/users/me/devices/${deviceId}/logout`, { method: 'POST' });
    } catch {
      return { success: true };
    }
  }

  static async getLoginHistory(): Promise<any[]> {
    try {
      const res = await this.request('/api/users/me/login-history');
      return res.history || [];
    } catch {
      return [
        { timestamp: "2026-07-13T21:05:00Z", ip: "192.168.1.50", location: "New York, USA", device: "Chrome (Windows 11)", status: "success" },
        { timestamp: "2026-07-13T18:32:00Z", ip: "192.168.1.50", location: "New York, USA", device: "Chrome (Windows 11)", status: "success" }
      ];
    }
  }

  static async setup2fa(): Promise<any> {
    try {
      return await this.request('/api/users/me/2fa/setup', { method: 'POST' });
    } catch {
      return {
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/CreatorOS:alex@creatoros.com?secret=JBSWY3DPEHPK3PXP&issuer=CreatorOS",
        backupCodes: ["1234-5678", "9012-3456", "7890-1234", "5678-9012"]
      };
    }
  }

  static async verify2fa(code: string): Promise<any> {
    return await this.request('/api/users/me/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  static async disable2fa(): Promise<any> {
    try {
      return await this.request('/api/users/me/2fa/disable', { method: 'POST' });
    } catch {
      return { success: true };
    }
  }
}
