/**
 * Cloudflare Workers AI Endpoint for LogoStudio.si
 * 
 * Deployment:
 * 1. npx wrangler init logostudio-ai-worker
 * 2. In wrangler.jsonc or wrangler.toml:
 *    [ai]
 *    binding = "AI"
 * 3. npx wrangler deploy
 */

export interface Env {
  AI: any; // Cloudflare Workers AI binding
  LOGOSTUDIO_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Authentication check (optional)
    const authHeader = request.headers.get('Authorization');
    if (env.LOGOSTUDIO_KEY && (!authHeader || authHeader !== `Bearer ${env.LOGOSTUDIO_KEY}`)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Endpoint 1: Cloudflare AI selects 10 icons for the domain
      if (url.pathname === '/api/select-icons' && request.method === 'POST') {
        const body = (await request.json()) as { domain: string };
        const domain = (body.domain || 'adstock.org').toLowerCase();

        const prompt = `You are an expert brand identity director. Analyze this domain name: "${domain}".
Select 10 vector icon names strictly from the Lucide React icon set (such as Mountain, Shield, Cpu, Lock, Car, Sparkles, Flame, Coins, Heart, Globe, Terminal, Briefcase, Camera, ArrowRight, Activity, Search, Compass, Zap).
Return a JSON object with:
{
  "niche": "Short 3-5 word industry niche description",
  "core": ["Icon1", "Icon2", "Icon3", "Icon4"], // 4 icons representing whole concept (core[0] is primary)
  "word1": { "label": "First root word", "icons": ["Icon5", "Icon6", "Icon7"] },
  "word2": { "label": "Second root word or extension", "icons": ["Icon8", "Icon9", "Icon10"] },
  "paletteIdx": 0, // Integer 0-13 for color palette
  "reasoning": "1-2 sentences explaining the semantic connection"
}
Output only raw valid JSON without markdown wrapping.`;

        let aiResult: any = null;
        if (env.AI) {
          aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
          });
        }

        const rawText = aiResult?.response || '';
        let parsed = null;
        try {
          parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
        } catch {
          parsed = {
            niche: 'Digital Technology & Enterprise Venture',
            core: ['Layers', 'Sparkles', 'Shield', 'Globe'],
            word1: { label: 'Primary', icons: ['Target', 'Activity', 'Award'] },
            word2: { label: 'Secondary', icons: ['Zap', 'Compass', 'TrendingUp'] },
            paletteIdx: 1,
            reasoning: `Selected based on high semantic alignment with domain ${domain}.`,
          };
        }

        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Endpoint 2: Cloudflare AI synthesizes custom SVG from scratch
      if (url.pathname === '/api/synthesize-svg' && request.method === 'POST') {
        const body = (await request.json()) as {
          domain: string;
          word1: string;
          word2: string;
          niche: string;
          activeIcons: string[];
          style?: string;
        };

        const prompt = `You are a geometric vector logo designer.
Create a single SVG path (M... L... C... Z) for a vector logo mark on a 100x100 coordinate viewBox.
Domain: ${body.domain}
Roots: ${body.word1} and ${body.word2}
Niche: ${body.niche}
Style: ${body.style || 'geometric fusion'}

Return a JSON object with:
{
  "svgPath": "M50 10 L88 32 V76 L50 98 L12 76 V32 Z", // exact valid SVG path string for 100x100
  "title": "Creative Mark Name",
  "description": "Short explanation of the geometric symbol"
}
Output only raw valid JSON.`;

        let aiResult: any = null;
        if (env.AI) {
          aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          });
        }

        const rawText = aiResult?.response || '';
        let parsed = null;
        try {
          parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
        } catch {
          parsed = {
            svgPath: 'M50 10 L88 32 V76 L50 98 L12 76 V32 L50 10 Z M50 26 L26 40 V68 L50 82 L74 68 V40 L50 26 Z',
            title: `${body.word1} Hexagonal Hybrid Mark`,
            description: 'Volumetric geometric hexagon intersecting an isometric data conduit.',
          };
        }

        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ status: 'LogoStudio Cloudflare AI Worker Active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Worker Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
