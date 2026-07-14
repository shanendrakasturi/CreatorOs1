import os
import time
from typing import List, Generator, Dict, Any
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.default_model = os.getenv("GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
        else:
            self.client = None

    def _get_client(self) -> Groq:
        if not self.client:
            # Try to fetch fresh environment key
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable is not configured.")
            self.client = Groq(api_key=api_key)
        return self.client

    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.", model: str = None, stream: bool = False, temperature: float = 0.7) -> Any:
        model = model or self.default_model
        client = self._get_client()
        
        max_retries = 3
        retry_delay = 2.0
        
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    stream=stream,
                    temperature=temperature,
                )
                return response
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                time.sleep(retry_delay * (2 ** attempt))


    def _get_tone_templates(self, tone: str) -> List[Dict[str, str]]:
        """Return a list of structurally unique caption templates for the given tone."""
        templates_by_tone = {
            'Professional': [
                {
                    "template": "Looking to level up your approach to {topic}? Here's the framework that's been driving real results on {platform}. {emoji1} Save this for later. #strategy #business #{platform_lower}",
                    "hook": "Authority-driven guide positioning the creator as an expert."
                },
                {
                    "template": "The biggest mistake people make with {topic}? Skipping the fundamentals. {emoji1} Here's what I do differently — and why it works on {platform}. #growthhack #professional",
                    "hook": "Leads with a common mistake to spark curiosity."
                },
                {
                    "template": "After months of research into {topic}, here are the 3 non-obvious insights that changed everything. {emoji1} Which one surprises you most? Comment below! #{platform_lower} #insights",
                    "hook": "Numbered insights with a comment CTA for community engagement."
                },
                {
                    "template": "If you're serious about {topic} on {platform}, this is the one post you can't afford to miss. {emoji1} Bookmark it now, thank me later. #leadership #productivity",
                    "hook": "Creates urgency and FOMO to drive saves."
                },
                {
                    "template": "We need to talk about {topic}. {emoji1} The industry is shifting and here's how to stay ahead on {platform}. Drop your questions below! #futureofwork #business",
                    "hook": "Opens a conversation around a trending shift."
                },
                {
                    "template": "Data doesn't lie. {emoji1} Here's what the numbers say about {topic} and what every {platform} creator should know right now. #analytics #datadriven",
                    "hook": "Data-backed authority hook for credibility."
                },
            ],
            'Casual & Fun': [
                {
                    "template": "POV: You finally try {topic} and it's not what you expected at all {emoji1} Drop a 🙋 if you can relate! #relatable #creatorlife #{platform_lower}",
                    "hook": "POV-style hook that invites audience participation."
                },
                {
                    "template": "Hot take: {topic} is actually underrated and no one talks about it enough. {emoji1} Here's my honest experience on {platform}. Agree or disagree? {emoji2} #honestreview",
                    "hook": "Controversial opinion style that drives debate in comments."
                },
                {
                    "template": "Nobody told me {topic} would be this fun! {emoji1} If you're sleeping on this, wake up. Details in bio {emoji2} #{platform_lower} #mustknow",
                    "hook": "Excitement-driven hook that creates FOMO."
                },
                {
                    "template": "Rating {topic} out of 10: {emoji1} Spoiler — it slaps harder than I expected. Full breakdown on my {platform}. #review #honest",
                    "hook": "Rating format creates curiosity about the score."
                },
                {
                    "template": "Things I wish I knew before trying {topic}: {emoji1} A thread for everyone who's about to make the same mistakes I did. #tips #lessons #{platform_lower}",
                    "hook": "Relatable lessons format driving shares."
                },
                {
                    "template": "The best part about {topic}? It's way simpler than everyone makes it seem. {emoji1} Here's the no-fluff version for {platform}. Tag someone who needs this! {emoji2}",
                    "hook": "Simplification angle that encourages tagging."
                },
            ],
            'Inspirational': [
                {
                    "template": "One year ago I knew nothing about {topic}. Today it's changed my entire game on {platform}. {emoji1} If I can do it, so can you. #journey #growth",
                    "hook": "Personal transformation story that inspires the audience."
                },
                {
                    "template": "The best investment you'll make this year isn't financial — it's learning {topic}. {emoji1} Your future self will thank you. Start today. #mindset #success",
                    "hook": "Reframes learning as a form of investment."
                },
                {
                    "template": "Hard truth about {topic}: the people who thrive aren't luckier — they just started earlier. {emoji1} Your turn. #{platform_lower} #consistency",
                    "hook": "Challenge-style motivation that removes excuses."
                },
                {
                    "template": "You don't need to be perfect at {topic}. {emoji1} You just need to be consistent on {platform}. Small steps, big results. #progress #growthmindset",
                    "hook": "Removes perfection paralysis and encourages starting."
                },
                {
                    "template": "That moment when {topic} finally clicks and you realise you've been overthinking it. {emoji1} Share this with someone who needs to hear it today. #aha #breakthroughs",
                    "hook": "Relatable breakthrough moment that drives shares."
                },
                {
                    "template": "Stop waiting for the 'right time' to start {topic}. {emoji1} The right time is now. Build something great on {platform} this week. #action #motivation",
                    "hook": "Direct call-to-action combating procrastination."
                },
            ],
            'Educational': [
                {
                    "template": "Everything you need to know about {topic} in under 60 seconds. {emoji1} Save this for reference! #{platform_lower} #quicklearn #tutorial",
                    "hook": "Time-boxed learning hook encouraging saves."
                },
                {
                    "template": "5 things I learned about {topic} that took me way too long to figure out. {emoji1} Don't make the same mistakes. #lessons #tips #education",
                    "hook": "Number-list format with a mistake-avoidance angle."
                },
                {
                    "template": "Beginner's guide to {topic} — no fluff, just the stuff that actually works. {emoji1} {platform} creators, this one's for you. #howto #guide",
                    "hook": "Beginner-friendly label broadens reach to new audiences."
                },
                {
                    "template": "Why most people get {topic} completely wrong on {platform}: {emoji1} Here's the correct approach backed by real results. #mythbusting #facts",
                    "hook": "Myth-busting framing drives high curiosity clicks."
                },
                {
                    "template": "The science behind {topic} explained simply. {emoji1} Once you understand this, everything changes. Repost to help your followers! #{platform_lower} #knowledge",
                    "hook": "Science-backed angle builds trust and shareability."
                },
                {
                    "template": "I tested 10 different approaches to {topic} so you don't have to. {emoji1} Here's what actually works on {platform}. #experiment #bestpractice",
                    "hook": "Testing-based content signals credibility."
                },
            ],
            'Hype / Energetic': [
                {
                    "template": "THIS IS YOUR SIGN to finally go all-in on {topic}! {emoji1} The {platform} grind is REAL and this is how we WIN! {emoji2} #letsgo #hustle",
                    "hook": "Permission-giving hype that creates urgency."
                },
                {
                    "template": "Nobody is talking about how insane {topic} really is right now! {emoji1} Get in before everyone else catches on! #{platform_lower} #earlybird #viral",
                    "hook": "Insider knowledge style creating FOMO."
                },
                {
                    "template": "WARNING: {topic} is about to change EVERYTHING on {platform}. {emoji1} Are you ready? Because we are! {emoji2} #gamechanging #ready",
                    "hook": "Warning format creates pattern interrupt."
                },
                {
                    "template": "Just dropped the most FIRE content on {topic} you'll see on {platform} today! {emoji1} Go watch it NOW and tell me I'm wrong! {emoji2} #fire #trending",
                    "hook": "Bold challenge drives comments and clicks."
                },
                {
                    "template": "The CHEAT CODE for {topic} that nobody wants to share: {emoji1} You're welcome. Drop a 🔥 in the comments if this helped! #{platform_lower}",
                    "hook": "Cheat code framing implies exclusive insider knowledge."
                },
                {
                    "template": "We hit a new milestone with {topic} and I'm not done yet! {emoji1} Join me on {platform} as we push even further — NOTHING can stop us! {emoji2} #unstoppable",
                    "hook": "Milestone celebration hooks fans emotionally."
                },
            ],
        }

        default_templates = [
            {
                "template": "Have you tried {topic} yet? {emoji1} Here's why it's trending on {platform} right now. #trending #mustknow",
                "hook": "Curiosity-driven question hook."
            },
            {
                "template": "My honest take on {topic}: {emoji1} It's more powerful than I thought. Watch the full breakdown on {platform}. #review #honest",
                "hook": "Honest opinion style builds trust."
            },
            {
                "template": "The ultimate guide to {topic} is finally here! {emoji1} Everything you need in one place for {platform}. Save this! #guide #allinone",
                "hook": "Comprehensive guide angle drives saves."
            },
        ]

        return templates_by_tone.get(tone, default_templates)

    def _render_template(self, t_info: Dict[str, str], topic: str, platform: str, tone: str) -> Dict[str, str]:
        """Render a template dict into a caption dict with random emojis."""
        import random
        emojis_by_tone = {
            'Professional': ['📊', '📈', '💡', '🔍', '🤝', '💼', '🎯', '🏆', '🧩'],
            'Casual & Fun': ['😎', '✨', '🔥', '🤷', '🍿', '🎉', '👀', '😂', '🙌'],
            'Inspirational': ['🌟', '💪', '🚀', '🌱', '🙏', '🌈', '⚡', '🎯', '🏅'],
            'Educational': ['📚', '🧠', '💡', '🛠️', '📝', '🔬', '🎓', '📖', '💻'],
            'Hype / Energetic': ['💥', '🔥', '⚡', '🚀', '🥳', '📣', '🏆', '🎯', '💪'],
        }
        default_emojis = ['✨', '🔥', '💡', '🚀', '🎯']
        tone_emojis = emojis_by_tone.get(tone, default_emojis)

        e1 = random.choice(tone_emojis)
        remaining = [e for e in tone_emojis if e != e1]
        e2 = random.choice(remaining if remaining else tone_emojis)

        caption = t_info["template"].format(
            topic=topic,
            platform=platform,
            platform_lower=platform.lower(),
            emoji1=e1,
            emoji2=e2
        )
        return {"caption": caption, "hook": t_info["hook"]}

    def _generate_fallback_caption(self, topic: str, platform: str, tone: str, existing_captions: List[str] = None, used_template_indices: List[int] = None) -> Dict[str, str]:
        """Pick a fallback caption using a template not yet used in this batch."""
        import random

        templates = self._get_tone_templates(tone)
        existing_captions = existing_captions or []
        used_template_indices = used_template_indices or []

        # First priority: pick a template not yet used in this batch
        available_indices = [i for i in range(len(templates)) if i not in used_template_indices]
        if not available_indices:
            available_indices = list(range(len(templates)))  # All used, allow reuse

        random.shuffle(available_indices)

        for idx in available_indices:
            t_info = templates[idx]
            rendered = self._render_template(t_info, topic, platform, tone)
            # Verify the caption text is not already in the existing set
            if not any(rendered["caption"].strip() == c.strip() for c in existing_captions):
                rendered["_template_idx"] = idx  # piggyback so caller can track
                return rendered

        # Absolute last resort
        idx = available_indices[0]
        rendered = self._render_template(templates[idx], topic, platform, tone)
        rendered["caption"] += f" ✦"
        rendered["_template_idx"] = idx
        return rendered

    def generate_captions(self, topic: str, platform: str, tone: str, model: str = None) -> List[Dict[str, str]]:
        prompt = f"""
        Generate exactly 3 high-engaging, COMPLETELY DIFFERENT caption options for a content creator.
        Topic/Description: {topic}
        Platform: {platform}
        Tone: {tone}

        CRITICAL REQUIREMENTS:
        - Each caption MUST use a DIFFERENT creative angle/approach. For example:
          Variant 1: Storytelling / personal experience angle
          Variant 2: Question or controversy angle (drives comments)
          Variant 3: Tips / educational or list-based angle
        - NO two captions should start with the same word or follow the same sentence structure.
        - Each caption should have unique hashtags relevant to the topic.
        - Include emojis appropriate for the tone.

        Output format — a JSON array of exactly 3 objects, each with:
        1. "caption": The caption text including hashtags and emojis.
        2. "hook": A 1-sentence explanation of why THIS caption specifically hooks the audience.

        Return ONLY the raw JSON array. No markdown, no code fences, no explanations.
        """

        system_prompt = (
            "You are an expert social media manager and copywriter for top content creators. "
            "Your job is to write 3 captions that are strikingly different from each other in structure, "
            "tone execution, and hook style — even when they share the same topic."
        )

        try:
            response = self.generate_text(prompt, system_prompt, model, temperature=0.95)
            content = response.choices[0].message.content.strip()
            # Clean possible markdown JSON wrappers if LLM returns it
            if content.startswith("```"):
                content = content.split("```json")[-1].split("```")[0].strip()

            import json
            parsed = json.loads(content)
            if isinstance(parsed, list) and len(parsed) == 3:
                return parsed
            # If we somehow got something else, fall through to fallback
            raise ValueError("Unexpected AI response structure")
        except Exception:
            # Fallback: guarantee each variant uses a DIFFERENT template
            results = []
            existing_captions: List[str] = []
            used_template_indices: List[int] = []

            for _ in range(3):
                cap_obj = self._generate_fallback_caption(
                    topic, platform, tone, existing_captions, used_template_indices
                )
                used_idx = cap_obj.pop("_template_idx", None)
                if used_idx is not None:
                    used_template_indices.append(used_idx)
                results.append(cap_obj)
                existing_captions.append(cap_obj["caption"])

            return results

    def regenerate_single_caption(self, topic: str, platform: str, tone: str, regenerate_index: int, existing_captions: List[str], model: str = None) -> Dict[str, str]:
        avoid_clause = ""
        if existing_captions:
            avoid_clause = "\nAvoid generating any of the following existing captions:\n" + "\n".join(f"- {c}" for c in existing_captions)

        prompt = f"""
        Generate 1 high-engaging caption option for a content creator.
        Topic/Description: {topic}
        Platform: {platform}
        Tone: {tone}
        {avoid_clause}

        Provide the output in structured JSON format. It must include:
        1. "caption": The caption text including appropriate hashtags and emojis.
        2. "hook": A 1-sentence explanation of why this caption hooks the audience.

        Format your entire output exactly as a single JSON object. Do not write markdown, code blocks, or explanations outside the JSON.
        """
        system_prompt = "You are an expert social media manager and copywriter for top content creators."

        try:
            response = self.generate_text(prompt, system_prompt, model)
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```json")[-1].split("```")[0].strip()
            
            import json
            return json.loads(content)
        except Exception as e:
            # Fallback randomized mock data
            return self._generate_fallback_caption(topic, platform, tone, existing_captions)

    def generate_insight_cards(self, analytics_summary: str, model: str = None) -> List[Dict[str, Any]]:
        prompt = f"""
        Analyze these creator statistics and generate 3 actionable growth insight cards:
        {analytics_summary}

        Provide output in structured JSON format exactly as an array. Each card should have:
        1. "title": Short title (3-5 words)
        2. "metric": Highlighted stat or platform (e.g. "+12.4% YouTube")
        3. "description": 1-2 sentence actionable advice.
        4. "impact": "High", "Medium", or "Low"

        Return ONLY the raw JSON array.
        """
        system_prompt = "You are a professional growth analyst for multi-channel digital influencers."
        
        try:
            response = self.generate_text(prompt, system_prompt, model)
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```json")[-1].split("```")[0].strip()
            import json
            return json.loads(content)
        except Exception:
            return [
                {
                    "title": "Short-Form Engagement Surge",
                    "metric": "8.1% TikTok",
                    "description": "Short-form video engagement is outperforming long-form. Focus on publishing 3 Reels/TikToks weekly from main video cuts.",
                    "impact": "High"
                },
                {
                    "title": "Optimal Posting Window",
                    "metric": "6:00 PM EST",
                    "description": "Historical view peaks occur after 6 PM. Schedule your upcoming YouTube and Instagram posts to hit feed at 5:30 PM.",
                    "impact": "Medium"
                }
            ]

    def generate_email_draft(self, brand: str, value: float, stage: str, details: str, model: str = None) -> str:
        prompt = f"""
        Write a professional email draft for negotiating a brand deal with {brand}.
        Deal Value: ${value}
        Current stage of discussion: {stage}
        Campaign Details: {details}

        Make sure it is professional, highlights the creator's value, is concise, and concludes with a clear call-to-action (CTA).
        """
        system_prompt = "You are a talent manager negotiating sponsorship deals for digital creators."
        
        try:
            response = self.generate_text(prompt, system_prompt, model)
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Hi Team at {brand},\n\nThank you for reaching out! I would love to discuss integrating your brand into our upcoming content schedule for the ROG series. With over 850k active subscribers in productivity tech, we are positioned to drive high engagement for this launch. Let me know if you would be open to a quick call to align on rate card and deliverables.\n\nBest,\nAlex Rivera"

    def suggest_ideas(self, niche: str, recent_performance: str, model: str = None) -> List[Dict[str, Any]]:
        prompt = f"""
        Based on my creator niche: "{niche}" and recent analytics: "{recent_performance}",
        suggest 3 hot content ideas that have high potential to trend.
        
        Output format as a JSON array where each item has:
        - "title": Video/post title
        - "platform": Platform target (e.g. YouTube, Instagram, TikTok)
        - "difficulty": "Easy", "Medium", "Hard"
        - "reason": Why it is likely to perform well.
        
        Return ONLY the raw JSON array.
        """
        system_prompt = "You are a content strategist specializing in digital media curation and viral trends."
        
        try:
            response = self.generate_text(prompt, system_prompt, model)
            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.split("```json")[-1].split("```")[0].strip()
            import json
            return json.loads(content)
        except Exception:
            return [
                {
                    "title": "Next.js 15: The Good, The Bad, & The Ugly",
                    "platform": "YouTube",
                    "difficulty": "Medium",
                    "reason": "Next.js 15 is highly topical and search traffic is peaking."
                },
                {
                    "title": "My 3 Desk Accessories Under $50",
                    "platform": "Instagram",
                    "difficulty": "Easy",
                    "reason": "Desk setups drive massive saves and shares."
                }
            ]

    def enrich_idea(self, content: str, idea_type: str, model: str = None) -> Dict[str, Any]:
        """AI-enrich a raw idea: generate title, summary, and tags."""
        prompt = f"""
        A creator captured this {idea_type} idea: "{content}"
        
        Analyze it and return ONLY a JSON object:
        {{"title": "short punchy title (max 8 words)", "summary": "1-2 sentence summary", "tags": ["tag1", "tag2", "tag3"]}}
        """
        system_prompt = "You are a creative director helping content creators organize and articulate their ideas."

        try:
            response = self.generate_text(prompt, system_prompt, model)
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```json")[-1].split("```")[0].strip()
            import json
            return json.loads(raw)
        except Exception:
            words = content.strip().split()[:6]
            title = " ".join(words).capitalize()
            return {
                "title": title,
                "summary": content[:120],
                "tags": ["idea", idea_type, "creator"]
            }

    def search_ideas_by_relevance(self, query: str, ideas: List[Dict[str, Any]], model: str = None) -> List[Dict[str, Any]]:
        """Natural-language search over a list of ideas."""
        if not ideas:
            return []
        ideas_text = "\n".join([
            f"ID: {i.get('id', idx)} | Title: {i.get('aiTitle', '')} | Summary: {i.get('aiSummary', '')} | Tags: {', '.join(i.get('tags', []))}"
            for idx, i in enumerate(ideas)
        ])
        prompt = f"""
        Query: "{query}"
        
        Ideas:
        {ideas_text}
        
        Return a JSON array of idea IDs (strings) ranked by relevance to the query, most relevant first.
        Return ONLY the JSON array of ID strings, e.g. ["idea001", "idea003"].
        """
        system_prompt = "You are a semantic search engine for a creator's idea database."
        try:
            response = self.generate_text(prompt, system_prompt, model)
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```json")[-1].split("```")[0].strip()
            import json
            ranked_ids = json.loads(raw)
            id_order = {id_: rank for rank, id_ in enumerate(ranked_ids)}
            return sorted(ideas, key=lambda i: id_order.get(i.get('id', ''), 999))
        except Exception:
            q = query.lower()
            return [i for i in ideas if q in (i.get('aiTitle', '') + i.get('aiSummary', '')).lower()]

    def resurface_ideas(self, ideas: List[Dict[str, Any]], model: str = None) -> List[Dict[str, Any]]:
        """Pick 2-3 old ideas and explain why they are relevant now."""
        if not ideas:
            return []
        import json
        ideas_text = json.dumps([
            {"id": i.get("id"), "title": i.get("aiTitle"), "summary": i.get("aiSummary"), "tags": i.get("tags", []), "createdAt": i.get("createdAt")}
            for i in ideas
        ])
        prompt = f"""
        A content creator has these ideas in their vault:
        {ideas_text}
        
        Pick the 2 most timely/relevant ideas to resurface today.
        Return ONLY a JSON array:
        [{{"id": "idea_id", "resurfaceReason": "1 sentence: why this matters now"}}]
        """
        system_prompt = "You are a creative strategist who resurfaces forgotten ideas at the right moment."
        try:
            response = self.generate_text(prompt, system_prompt, model)
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```json")[-1].split("```")[0].strip()
            ranked = json.loads(raw)
            id_to_reason = {r["id"]: r["resurfaceReason"] for r in ranked}
            result = []
            for idea in ideas:
                if idea.get("id") in id_to_reason:
                    result.append({**idea, "resurfaceReason": id_to_reason[idea["id"]]})
            return result
        except Exception:
            from datetime import datetime, timezone
            sorted_ideas = sorted(ideas, key=lambda i: i.get("createdAt", ""))
            return [
                {**i, "resurfaceReason": "This idea aligns with your current content momentum — a great time to revisit."}
                for i in sorted_ideas[:2]
            ]

    def _generate_fallback_opportunities(self, niche: str) -> List[Dict[str, Any]]:
        n = niche.lower()
        if "game" in n or "gaming" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "GTA 6, Valorant & Minecraft Modding Surge",
                    "description": "Massive search traffic spike detected for GTA 6 modding tutorials and Valorant competitive guides.",
                    "relevanceScore": 95,
                    "source": "via YouTube Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "Razer & Logitech G Creator Sponsorships",
                    "description": "Active campaign for hardware reviews. They are looking for creators to review their latest gaming mice and keyboards.",
                    "relevanceScore": 90,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "No-Hit Challenge Runs & Speedruns",
                    "description": "Short-form clips of no-hit bosses or ultra-fast speedruns are hitting the algorithms and gaining millions of views.",
                    "relevanceScore": 85,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Discord & NVIDIA Partnership Campaign",
                    "description": "Discord is sponsoring server integrations, and NVIDIA is looking for RTX showcase videos. Paid campaigns start at $5,000.",
                    "relevanceScore": 92,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "TwitchCon 2026 & Gamescom Creators Meetup",
                    "description": "Networking hubs for game publishers and creators. High demand for live coverage and vlogs.",
                    "relevanceScore": 80,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "Best GTA 6 Graphics Settings for PC",
                    "description": "High search volume but very few optimized performance-guide videos. High CTR potential for early guides.",
                    "relevanceScore": 89,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "tech" in n or "technology" in n or "software" in n or "code" in n or "coding" in n or "developer" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "Next-Gen AI Tools & Arc Browser Customizations",
                    "description": "Search volume for new local AI agents and Arc browser settings is up 250% this month.",
                    "relevanceScore": 97,
                    "source": "via Google Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "Notion & Adobe Integration Campaign",
                    "description": "Adobe and Notion are paying tech and development creators for workflow organization tutorials.",
                    "relevanceScore": 94,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "\"Build an App in 10 Minutes with AI\" Shorts",
                    "description": "Fast-paced build tutorials utilizing Claude and ChatGPT are going viral on Reels and TikTok.",
                    "relevanceScore": 88,
                    "source": "via Reels Algorithmic Push"
                },
                {
                    "type": "sponsorship",
                    "title": "Microsoft Azure & GitHub Copilot Creator Program",
                    "description": "GitHub is actively sponsoring developers to showcase Copilot Workspace features in their daily workflow.",
                    "relevanceScore": 91,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "CES 2026 & Google I/O Creator Summit",
                    "description": "Top tech events hosting exclusive creator demo zones. Great opportunity for vlog coverage and first-impressions.",
                    "relevanceScore": 84,
                    "source": "via Industry Press Releases"
                },
                {
                    "type": "content_gap",
                    "title": "AI Productivity Apps for Solopreneurs",
                    "description": "Search volume for 'AI apps for solopreneurs' has spiked, but current videos are outdated. High potential for a top list.",
                    "relevanceScore": 90,
                    "source": "via Competitor Analysis"
                }
            ]
        elif "lifestyle" in n or "minimal" in n or "productivity" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "Morning Routine & Clean Aesthetics",
                    "description": "Vibrant search interest in slow morning routines, aesthetic tea/coffee making, and daily planning.",
                    "relevanceScore": 93,
                    "source": "via Pinterest Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "IKEA & Samsung Home Workspace Makeover",
                    "description": "IKEA is actively sending furniture and accessories to creators who showcase home office redesigns.",
                    "relevanceScore": 89,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "\"Day in the life of a Solopreneur\" Voiceover",
                    "description": "Aesthetic, high-contrast b-roll reels with calming voiceovers are trending heavily in lifestyle feeds.",
                    "relevanceScore": 91,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Skillshare & Squarespace Education Integration",
                    "description": "Skillshare is offering flat fee sponsorships plus higher-tier affiliate codes for productivity courses.",
                    "relevanceScore": 88,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "Aesthetic Design Expo & Clean Space Summit",
                    "description": "Designers and architects showcase premium workspace elements. Excellent source for inspiration and b-roll content.",
                    "relevanceScore": 76,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "Minimalist Workspace Setup for Small Rooms",
                    "description": "High search query volume for 'small room minimalist setup' with low-quality existing videos.",
                    "relevanceScore": 86,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "fashion" in n or "beauty" in n or "style" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "90s Retro Style Revivals & Quiet Luxury",
                    "description": "Search volume for 'retro aesthetic fashion' and 'quiet luxury outfit ideas' is up 180%.",
                    "relevanceScore": 94,
                    "source": "via Instagram Explorer"
                },
                {
                    "type": "brand_collab",
                    "title": "Sephora & Zara Seasonal Lookbook Collabs",
                    "description": "Sephora is launching a creator squad for makeup tutorials, and Zara is doing PR package gifting.",
                    "relevanceScore": 92,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "\"GRWM\" (Get Ready With Me) Transition Reels",
                    "description": "Seamless transition videos from pajamas to aesthetic outfits are generating millions of loop views.",
                    "relevanceScore": 95,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Dyson & L'Oreal Hair/Skincare Campaign",
                    "description": "Paid integration campaigns for Dyson Airwrap styling guides and Skincare routine videos.",
                    "relevanceScore": 89,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "New York Fashion Week 2026 & Beautycon",
                    "description": "Main seasonal meetups for fashion vloggers. Exclusive passes available for creators above 100k followers.",
                    "relevanceScore": 83,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "Affordable Quiet Luxury Wardrobe Essentials",
                    "description": "High search volume but mostly luxury-brand videos. A budget quiet luxury guide is highly requested.",
                    "relevanceScore": 87,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "finance" in n or "business" in n or "money" in n or "invest" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "Side Hustles for 2026 & Passive Income Streams",
                    "description": "Huge search volume for secondary income sources, retail arbitrage, and AI digital downloads.",
                    "relevanceScore": 96,
                    "source": "via YouTube Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "Notion Business Templates & Wise Integration",
                    "description": "Notion and Wise are paying creators to demonstrate invoicing, bookkeeping, and global finances.",
                    "relevanceScore": 91,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "Real Estate Investing Myths Debunked",
                    "description": "Short, rapid-fire comparison clips showing rent vs buy calculators are trending heavily.",
                    "relevanceScore": 87,
                    "source": "via Reels Algorithmic Push"
                },
                {
                    "type": "sponsorship",
                    "title": "Shopify & Webflow Business Starter Campaigns",
                    "description": "Shopify is sponsoring videos showing how to build an e-commerce brand from scratch. Rates starting at $7,000.",
                    "relevanceScore": 93,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "FinCon 2026 & E-commerce Success Expo",
                    "description": "Premier business creator events. Great for panel networking and securing brand deals.",
                    "relevanceScore": 85,
                    "source": "via Industry Press Releases"
                },
                {
                    "type": "content_gap",
                    "title": "Tax Deductions for Creators & Influencers",
                    "description": "High search volume in Q1/Q2 but very few easy-to-understand guides from certified professionals.",
                    "relevanceScore": 89,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "travel" in n or "explore" in n or "adventure" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "Solo Travel Destinations & Hidden Gems in Asia",
                    "description": "Massive search growth for 'affordable solo travel' and 'undiscovered spots in Vietnam/Bali'.",
                    "relevanceScore": 92,
                    "source": "via Google Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "Airbnb & GoPro Adventure Equipment PR Pack",
                    "description": "Airbnb is looking for creators to review unique stays, and GoPro is offering the latest camera units.",
                    "relevanceScore": 90,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "Seamless Location Transition Reels",
                    "description": "Fast camera transitions linking hotel room keys directly to beautiful beaches are going viral.",
                    "relevanceScore": 94,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Klook & NordVPN Secure Travel Sponsorships",
                    "description": "NordVPN is paying travel vloggers to emphasize cybersecurity on public airport Wi-Fi.",
                    "relevanceScore": 88,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "World Travel Market 2026 & Travel Creator Summit",
                    "description": "Meet tourism boards looking for content creators. Many sponsored press trip opportunities.",
                    "relevanceScore": 82,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "Complete Bali Travel Guide on a Budget",
                    "description": "Most guides are high-end. Budget travel itineraries for Bali are experiencing a search gap.",
                    "relevanceScore": 85,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "fitness" in n or "gym" in n or "health" in n or "workout" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "Calisthenics & Home Workouts",
                    "description": "Search volume for 'bodyweight strength routines' and 'minimalist home gyms' is up 210%.",
                    "relevanceScore": 91,
                    "source": "via YouTube Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "Gymshark & MyProtein Creator Ambassador Program",
                    "description": "Gymshark is actively recruiting mid-tier creators for product placement and affiliate codes.",
                    "relevanceScore": 89,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "10-Minute High-Intensity Tabata Challenges",
                    "description": "Short-form workout challenge clips are gaining millions of views on Instagram and TikTok.",
                    "relevanceScore": 93,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Athletic Greens (AG1) & Whoop Tracker Campaigns",
                    "description": "Whoop is sponsoring creators to display fitness tracker metrics and recover data during workouts.",
                    "relevanceScore": 92,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "Arnold Sports Festival 2026 & Fitness Expo",
                    "description": "The largest fitness gathering. Great opportunity for networking and finding new supplement brands.",
                    "relevanceScore": 84,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "Calisthenics Progressions for Absolute Beginners",
                    "description": "Search volume is high, but most content starts too advanced. A simplified step-by-step gap exists.",
                    "relevanceScore": 86,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "cook" in n or "food" in n or "recipe" in n or "kitchen" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "15-Minute Healthy Air Fryer Meals",
                    "description": "Air fryer recipe tutorials are dominating search volumes, particularly for high-protein meals.",
                    "relevanceScore": 95,
                    "source": "via Pinterest Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "HelloFresh & HexClad Premium Cookware Gifting",
                    "description": "HexClad is seeking food creators for aesthetic cooking videos featuring their non-stick hybrid pans.",
                    "relevanceScore": 90,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "\"ASMR Cooking\" & Sound-first Recipes",
                    "description": "Cooking videos focused on the sizzle, chop, and crunch without talk or background music are trending.",
                    "relevanceScore": 96,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Our Place & Blue Apron Subscription Partnerships",
                    "description": "Blue Apron is sponsoring recipe integrations. High flat-rates plus commissions per signup.",
                    "relevanceScore": 87,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "National Food & Beverage Expo 2026",
                    "description": "Connect with local ingredient brands and kitchenware manufacturers seeking creators.",
                    "relevanceScore": 79,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "High-Protein Meals Under $5 (Weekly Prep)",
                    "description": "High demand for inflation-friendly cooking videos with low prep time. High CTR search query detected.",
                    "relevanceScore": 92,
                    "source": "via Search Gap Analysis"
                }
            ]
        elif "music" in n or "song" in n or "audio" in n or "guitar" in n or "piano" in n:
            return [
                {
                    "type": "trending_topic",
                    "title": "Lo-Fi Beats Production & Synth Wave Design",
                    "description": "Growing interest in lo-fi production breakdowns and designing custom synth patches.",
                    "relevanceScore": 90,
                    "source": "via Spotify Trends"
                },
                {
                    "type": "brand_collab",
                    "title": "Fender & Roland Creator Gear Review Packs",
                    "description": "Fender is actively looking for guitarists to review their new player series instruments.",
                    "relevanceScore": 88,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": "Song Re-creation in 60 Seconds",
                    "description": "Deconstructing famous tracks and rebuilding them using MIDI instruments in short-form videos is trending.",
                    "relevanceScore": 93,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": "Splice & DistroKid Distribution Deals",
                    "description": "DistroKid is sponsoring tutorials explaining how independent artists can distribute their music to Spotify.",
                    "relevanceScore": 92,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": "NAMM Show 2026 & Music Production Summit",
                    "description": "The largest music product event. Highly recommended for vlog coverage and networking with plugin brands.",
                    "relevanceScore": 86,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": "How to Mix Vocals for Beginners (FL Studio)",
                    "description": "High search volume but existing tutorials are over-complicated. A simplified beginner workflow is needed.",
                    "relevanceScore": 87,
                    "source": "via Search Gap Analysis"
                }
            ]
        else:
            # Smart generic fallback that uses the niche name dynamically
            return [
                {
                    "type": "trending_topic",
                    "title": f"Viral Trends in {niche} for 2026",
                    "description": f"Emerging formats showing up to 300% search growth this quarter for {niche}-related content.",
                    "relevanceScore": 91,
                    "source": "via Google Trends"
                },
                {
                    "type": "brand_collab",
                    "title": f"{niche} Brand Ambassador Campaigns",
                    "description": f"Aesthetic and industry-leading brands in the {niche} space are launching creator outreach campaigns.",
                    "relevanceScore": 88,
                    "source": "via Brand Radar"
                },
                {
                    "type": "viral_trend",
                    "title": f"POV: Explaining {niche} to a Beginner",
                    "description": "Sleek transitions and quick-witted explanations are driving view duration in this category.",
                    "relevanceScore": 85,
                    "source": "via TikTok Trending"
                },
                {
                    "type": "sponsorship",
                    "title": f"{niche} Software & Tools Promotion",
                    "description": f"New tools in the {niche} sector are funding creator integrations starting at $3,500.",
                    "relevanceScore": 89,
                    "source": "via Brand Outreach Intel"
                },
                {
                    "type": "event",
                    "title": f"{niche} Creators & Professionals Summit 2026",
                    "description": f"The biggest seasonal networking event for {niche} enthusiasts and creators.",
                    "relevanceScore": 82,
                    "source": "via Event Calendars"
                },
                {
                    "type": "content_gap",
                    "title": f"No Comprehensive {niche} Tutorial for 2026",
                    "description": f"Search gap identified: High monthly search volume for beginner tutorials in {niche} but most guides are outdated.",
                    "relevanceScore": 87,
                    "source": "via Search Gap Analysis"
                }
            ]

    def scan_opportunities(self, niche: str, model: str = None) -> List[Dict[str, Any]]:
        """AI-generated opportunity scan for a given creator niche."""
        prompt = f"""
        You are an opportunity scout for a content creator in the "{niche}" niche.
        Generate exactly 6 diverse, realistic opportunities they should act on right now.
        
        CRITICAL REQUIREMENT:
        You must generate EXACTLY ONE opportunity for each of the following types:
        - "trending_topic" (Trending Topics)
        - "brand_collab" (Brand Collaborations)
        - "viral_trend" (Viral Trends)
        - "sponsorship" (Sponsorships)
        - "event" (Events)
        - "content_gap" (Content Gaps)

        Provide the output in structured JSON format as an array containing exactly 6 objects. Each object should include:
        1. "type": the exact type name from the list above.
        2. "title": a short punchy title (3-6 words).
        3. "description": 1-2 sentences of actionable advice.
        4. "relevanceScore": a number from 70 to 99.
        5. "source": a short source description (e.g. "via YouTube Trends").

        Format your entire output exactly as a JSON array. Do not write markdown, code blocks, or explanations outside the JSON array.
        """
        system_prompt = "You are a market intelligence analyst specializing in the creator economy."
        try:
            response = self.generate_text(prompt, system_prompt, model)
            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```json")[-1].split("```")[0].strip()
            import json
            return json.loads(raw)
        except Exception:
            import random
            opps = self._generate_fallback_opportunities(niche)
            for o in opps:
                o["relevanceScore"] = min(99, max(70, o["relevanceScore"] + random.randint(-3, 3)))
            return opps
