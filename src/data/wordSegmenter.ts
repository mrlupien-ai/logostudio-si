// Deterministic dictionary-based dynamic programming word segmenter for lowercase SLD strings
// (e.g. "brightharbor" -> ["Bright", "Harbor"], "cloudpulse" -> ["Cloud", "Pulse"]).

// Ordered by frequency/brand utility; scores favor clean 2-word and 3-word compound brand splits.
const BRAND_ROOT_WORDS: string[] = [
  // Nature, Maritime, Sky & Geography
  'bright', 'harbor', 'harbour', 'port', 'bay', 'cove', 'anchor', 'marine', 'ocean', 'sea',
  'wave', 'waves', 'tide', 'reef', 'coast', 'shore', 'island', 'beacon', 'compass', 'sail',
  'ship', 'fleet', 'dock', 'pier', 'nautical', 'pacific', 'atlantic', 'nordic', 'alpine',
  'summit', 'peak', 'ridge', 'valley', 'canyon', 'river', 'stream', 'brook', 'creek', 'lake',
  'forest', 'grove', 'wood', 'woods', 'pine', 'oak', 'cedar', 'maple', 'fern', 'moss',
  'meadow', 'field', 'terra', 'earth', 'stone', 'rock', 'slate', 'quartz', 'granite', 'amber',
  'jade', 'emerald', 'ruby', 'coral', 'pearl', 'opal', 'onyx', 'obsidian', 'cobalt', 'crimson',
  'golden', 'silver', 'copper', 'bronze', 'iron', 'steel', 'titan', 'solar', 'lunar', 'astro',
  'star', 'stellar', 'nova', 'cosmos', 'cosmic', 'orbit', 'eclipse', 'horizon', 'zenith', 'aurora',
  'sky', 'cloud', 'storm', 'thunder', 'wind', 'breeze', 'frost', 'glacier', 'polar', 'arctic',
  'flame', 'fire', 'spark', 'ember', 'blaze', 'glow', 'shine', 'ray', 'beam', 'light',

  // Tech, AI, Data & Engineering
  'code', 'coder', 'coding', 'dev', 'stack', 'tech', 'cyber', 'data', 'byte', 'bit',
  'pixel', 'vector', 'raster', 'matrix', 'grid', 'node', 'mesh', 'net', 'network', 'web',
  'link', 'sync', 'cloud', 'edge', 'core', 'kernel', 'logic', 'neural', 'neuro', 'synapse',
  'brain', 'mind', 'cogni', 'smart', 'auto', 'bot', 'robot', 'agent', 'prompt', 'token',
  'model', 'compute', 'quantum', 'silicon', 'chip', 'micro', 'nano', 'omni', 'hyper', 'meta',
  'ultra', 'infra', 'scale', 'flux', 'pulse', 'signal', 'wave', 'stream', 'flow', 'pipe',
  'pipeline', 'forge', 'foundry', 'craft', 'works', 'lab', 'labs', 'studio', 'studios', 'hub',
  'base', 'vault', 'safe', 'lock', 'key', 'shield', 'guard', 'sentry', 'watch', 'radar',
  'sonar', 'scope', 'lens', 'vision', 'sight', 'focus', 'opti', 'optic', 'scan', 'scanner',
  'trace', 'track', 'tracker', 'metric', 'metrics', 'index', 'chart', 'graph', 'stat', 'stats',
  'count', 'counter', 'calc', 'relay', 'switch', 'router', 'bridge', 'gate', 'portal', 'dock',

  // Finance, Commerce & Enterprise
  'ad', 'ads', 'stock', 'stocks', 'trade', 'trader', 'market', 'markets', 'mart', 'shop',
  'store', 'cart', 'buy', 'sell', 'deal', 'deals', 'bid', 'offer', 'coupon', 'price',
  'worth', 'value', 'wealth', 'fund', 'funds', 'capital', 'venture', 'asset', 'assets', 'equity',
  'bond', 'yield', 'alpha', 'beta', 'delta', 'sigma', 'omega', 'prime', 'apex', 'vertex',
  'crest', 'crown', 'royal', 'noble', 'elite', 'vanguard', 'pioneer', 'frontier', 'atlas', 'titan',
  'fintech', 'pay', 'cash', 'coin', 'mint', 'bank', 'ledger', 'audit', 'tax', 'folio',
  'wallet', 'vault', 'trust', 'credit', 'loan', 'hedge', 'forex', 'crypto', 'chain', 'block',

  // Media, Typography, Writing & Design
  'font', 'fonts', 'type', 'typo', 'italic', 'bold', 'serif', 'sans', 'glyph', 'ink',
  'pen', 'paper', 'page', 'book', 'books', 'read', 'reader', 'write', 'writer', 'text',
  'word', 'words', 'story', 'stories', 'blog', 'post', 'news', 'press', 'media', 'radio',
  'audio', 'sound', 'voice', 'vocal', 'music', 'song', 'beat', 'rhythm', 'tone', 'tune',
  'video', 'film', 'cinema', 'movie', 'clip', 'frame', 'stage', 'canvas', 'palette', 'color',
  'icon', 'icons', 'symbol', 'symbols', 'logo', 'logos', 'brand', 'brands', 'mark', 'badge',
  'emblem', 'crest', 'avatar', 'photo', 'image', 'camera', 'snap', 'shot', 'draw', 'sketch',

  // Modifiers, Adjectives & Common Brand Prefixes/Suffixes
  'true', 'pure', 'clear', 'clean', 'fresh', 'vivid', 'sharp', 'swift', 'fast', 'quick',
  'rapid', 'instant', 'easy', 'simple', 'wise', 'clever', 'bold', 'brave', 'calm', 'zen',
  'vital', 'life', 'live', 'living', 'health', 'care', 'med', 'bio', 'eco', 'green',
  'blue', 'red', 'black', 'white', 'dark', 'deep', 'high', 'top', 'best', 'good',
  'great', 'grand', 'next', 'new', 'modern', 'future', 'open', 'free', 'fair', 'real',
  'solid', 'prime', 'first', 'one', 'uni', 'multi', 'poly', 'all', 'every', 'any',
  'my', 'our', 'your', 'pro', 'plus', 'max', 'box', 'kit', 'set', 'pack',
  'pad', 'desk', 'room', 'house', 'home', 'nest', 'hive', 'den', 'club', 'spot',
  'zone', 'area', 'space', 'place', 'point', 'dot', 'line', 'path', 'way', 'road',
  'lane', 'street', 'square', 'circle', 'loop', 'ring', 'sphere', 'globe', 'world', 'planet',
  'city', 'town', 'village', 'nation', 'state', 'land', 'realm', 'domain', 'site', 'page',
  'host', 'server', 'mail', 'send', 'chat', 'talk', 'call', 'meet', 'team', 'crew',
  'guild', 'tribe', 'squad', 'group', 'corp', 'inc', 'co', 'org', 'app', 'apps',
  'tool', 'tools', 'ware', 'soft', 'sys', 'system', 'systems', 'work', 'worker', 'job',
  'jobs', 'hire', 'talent', 'career', 'cv', 'resume', 'learn', 'edu', 'course', 'class',
  'school', 'academy', 'tutor', 'exam', 'test', 'quiz', 'prep', 'guide', 'help', 'desk',
  'food', 'chef', 'cook', 'kitchen', 'table', 'plate', 'taste', 'flavor', 'spice', 'sweet',
  'bread', 'bake', 'coffee', 'tea', 'wine', 'brew', 'bar', 'club', 'pet', 'pets',
  'dog', 'puppy', 'cat', 'fox', 'wolf', 'bear', 'hawk', 'eagle', 'falcon', 'owl',
  'lion', 'tiger', 'horse', 'stag', 'swan', 'dove', 'bee', 'ant', 'fin', 'wing',
  'car', 'cars', 'auto', 'drive', 'ride', 'fleet', 'moto', 'gear', 'wheel', 'ev',
  'jet', 'air', 'fly', 'flight', 'wing', 'aero', 'trip', 'tour', 'travel', 'stay',
];

const WORD_COST_MAP: Map<string, number> = new Map();
BRAND_ROOT_WORDS.forEach((word, index) => {
  // Lower cost = preferred. Longer words get a slight bonus to prevent over-fragmenting into tiny 2-letter tokens.
  const rankCost = Math.log(index + 10);
  const lengthBonus = word.length >= 4 ? 0.65 : word.length === 3 ? 0.9 : 1.3;
  if (!WORD_COST_MAP.has(word)) {
    WORD_COST_MAP.set(word, rankCost * lengthBonus);
  }
});

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/**
 * Splits a lowercase SLD string into `[word1, word2]` (or `[word1, '']` if single word)
 * using dynamic programming over `BRAND_ROOT_WORDS`.
 */
export function segmentDomainSld(rawSld: string): [string, string] {
  const s = rawSld.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!s || s.length < 4) {
    return [cap(s), ''];
  }

  // If the entire string is an exact single root word (e.g., "harbor", "compass"), keep it as 1 word.
  if (WORD_COST_MAP.has(s)) {
    return [cap(s), ''];
  }

  // First check clean 2-word split where both parts are in the dictionary (most common for brandable domains)
  let bestTwoSplit: [string, string] | null = null;
  let bestTwoScore = Infinity;

  for (let i = 2; i <= s.length - 2; i++) {
    const left = s.slice(0, i);
    const right = s.slice(i);
    const leftCost = WORD_COST_MAP.get(left);
    const rightCost = WORD_COST_MAP.get(right);

    if (leftCost !== undefined && rightCost !== undefined) {
      const score = leftCost + rightCost;
      if (score < bestTwoScore) {
        bestTwoScore = score;
        bestTwoSplit = [cap(left), cap(right)];
      }
    }
  }

  if (bestTwoSplit) {
    return bestTwoSplit;
  }

  // Next check if either prefix or suffix (>= 4 chars) is a known root word and the remainder is >= 3 chars
  for (let i = s.length - 3; i >= 3; i--) {
    const left = s.slice(0, i);
    const right = s.slice(i);
    if (left.length >= 4 && WORD_COST_MAP.has(left) && right.length >= 3) {
      return [cap(left), cap(right)];
    }
    if (right.length >= 4 && WORD_COST_MAP.has(right) && left.length >= 3) {
      return [cap(left), cap(right)];
    }
  }

  // General DP for 3+ words (collapse tokens after the first into Word 2 in PascalCase)
  const n = s.length;
  const dp: number[] = new Array(n + 1).fill(Infinity);
  const back: number[] = new Array(n + 1).fill(-1);
  dp[0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - 12); j < i; j++) {
      const sub = s.slice(j, i);
      const knownCost = WORD_COST_MAP.get(sub);
      const stepCost =
        knownCost !== undefined
          ? knownCost
          : sub.length >= 4
          ? 12 + sub.length * 1.8
          : 22 + sub.length * 3;
      if (dp[j] + stepCost < dp[i]) {
        dp[i] = dp[j] + stepCost;
        back[i] = j;
      }
    }
  }

  const tokens: string[] = [];
  let curr = n;
  while (curr > 0 && back[curr] >= 0) {
    tokens.unshift(s.slice(back[curr], curr));
    curr = back[curr];
  }

  if (tokens.length >= 2) {
    return [cap(tokens[0]), tokens.slice(1).map(cap).join('')];
  }

  return [cap(s), ''];
}
