import { createPrng, hashDomain } from './constructionEngine';

export interface VisualSymmetryBreakdown {
  score: number;
  symmetricRatio: number;
  ascenders: number;
  descenders: number;
  bowlCount: number;
  length: number;
}

export type CadenceLabel =
  | 'Crisp Trochaic'
  | 'Balanced Disyllabic'
  | 'Punchy Monosyllabic'
  | 'Polysyllabic Technical';

export interface PhoneticFlowBreakdown {
  score: number;
  syllables: number;
  alternationRatio: number;
  cadenceLabel: CadenceLabel;
}

export interface TldAuthorityBreakdown {
  score: number;
  ext: string;
  rationale: string;
}

export interface ArchetypeTagline {
  id: string;
  archetype:
    | 'Minimalist / Direct'
    | 'Enterprise / Authority'
    | 'Disruptive / Action'
    | 'Visionary / .SI Tech'
    | 'Editorial / Trust';
  tagline: string;
}

export type MarketTierLabel =
  | 'Tier-1 Flagship Brand'
  | 'Venture-Ready Identity'
  | 'Specialist Category Brand';

export interface DomainBrandabilityReport {
  domain: string;
  sld: string;
  visualSymmetry: VisualSymmetryBreakdown;
  phoneticFlow: PhoneticFlowBreakdown;
  tldAuthority: TldAuthorityBreakdown;
  brandIndex: number;
  marketTier: MarketTierLabel;
  archetypeTaglines: ArchetypeTagline[];
  salesPitch: [string, string];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const SYMMETRIC_LETTERS = new Set(['a', 'h', 'i', 'm', 'o', 't', 'u', 'v', 'w', 'x', 'y']);
const BOWL_LETTERS = new Set(['b', 'c', 'd', 'e', 'g', 'o', 'p', 'q', 's']);
const ASCENDER_LETTERS = new Set(['b', 'd', 'f', 'h', 'k', 'l', 't']);
const DESCENDER_LETTERS = new Set(['g', 'j', 'p', 'q', 'y']);
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

const ALLOWED_DIGRAPHS = [
  'str', 'sch', 'chr', 'phr', 'thr', 'shr',
  'st', 'ch', 'sh', 'th', 'ph', 'cr', 'tr', 'pr', 'br', 'gr', 'dr', 'fr',
  'cl', 'fl', 'gl', 'pl', 'sl', 'bl', 'sp', 'sk', 'sm', 'sn', 'sw', 'tw', 'qu',
];

function computeVisualSymmetry(sld: string): VisualSymmetryBreakdown {
  const clean = sld.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brand';
  const len = clean.length;
  let symmetricCount = 0;
  let bowlCount = 0;
  let ascenders = 0;
  let descenders = 0;

  for (const ch of clean) {
    if (SYMMETRIC_LETTERS.has(ch)) symmetricCount++;
    if (BOWL_LETTERS.has(ch)) bowlCount++;
    if (ASCENDER_LETTERS.has(ch)) ascenders++;
    if (DESCENDER_LETTERS.has(ch)) descenders++;
  }

  const symmetricRatio = len > 0 ? symmetricCount / len : 0;
  const balanceBonus = Math.abs(ascenders - descenders) <= 1 ? 0.8 : 0.2;
  const lengthBonus = len >= 4 && len <= 10 ? 0.7 : -0.3;
  const rawScore = 6.5 + symmetricRatio * 2.5 + balanceBonus + lengthBonus;
  const score = round1(clamp(rawScore, 4.0, 9.9));

  return {
    score,
    symmetricRatio: Math.round(symmetricRatio * 100),
    ascenders,
    descenders,
    bowlCount,
    length: len,
  };
}

function computePhoneticFlow(sld: string): PhoneticFlowBreakdown {
  const clean = sld.toLowerCase().replace(/[^a-z]/g, '') || 'brand';
  const len = clean.length;

  const vowelMatches = clean.match(/[aeiouy]+/gi);
  // Adjust silent trailing 'e' for words > 4 chars with 2+ vowel groups
  let syllables = vowelMatches ? vowelMatches.length : 1;
  if (clean.endsWith('e') && !clean.endsWith('le') && syllables > 1 && len > 4) {
    syllables = Math.max(1, syllables - 1);
  }

  // Consonant-vowel alternation ratio
  let transitions = 0;
  for (let i = 1; i < len; i++) {
    const prevVowel = VOWELS.has(clean[i - 1]);
    const currVowel = VOWELS.has(clean[i]);
    if (prevVowel !== currVowel) transitions++;
  }
  const alternationRatio = len > 1 ? transitions / (len - 1) : 0.5;

  // Penalize harsh consonant clusters of 3+ consecutive consonants not in allowed digraphs
  const consonantClusters = clean.match(/[^aeiouy]{3,}/g) || [];
  let clusterPenalty = 0;
  for (const cluster of consonantClusters) {
    const isSmooth = ALLOWED_DIGRAPHS.some(
      (dg) => cluster === dg || cluster.endsWith(dg) || cluster.startsWith(dg)
    );
    if (!isSmooth) {
      clusterPenalty += 0.5;
    }
  }

  const syllableBonus =
    syllables === 2 || syllables === 3 ? 1.2 : syllables === 1 || syllables === 4 ? 0.5 : -0.6;

  const rawScore = 6.2 + alternationRatio * 2.6 + syllableBonus - clusterPenalty;
  const score = round1(clamp(rawScore, 4.0, 9.9));

  let cadenceLabel: CadenceLabel = 'Balanced Disyllabic';
  if (syllables <= 1) {
    cadenceLabel = 'Punchy Monosyllabic';
  } else if (syllables === 2 && alternationRatio >= 0.58) {
    cadenceLabel = 'Crisp Trochaic';
  } else if (syllables <= 3) {
    cadenceLabel = 'Balanced Disyllabic';
  } else {
    cadenceLabel = 'Polysyllabic Technical';
  }

  return {
    score,
    syllables,
    alternationRatio: Math.round(alternationRatio * 100),
    cadenceLabel,
  };
}

function computeTldAuthority(rawExt: string): TldAuthorityBreakdown {
  const normalized = (rawExt || '.com').trim().toLowerCase();
  const ext = normalized.startsWith('.') ? normalized : `.${normalized}`;

  if (ext === '.com') {
    return { score: 9.8, ext, rationale: 'Universal global commercial standard' };
  }
  if (ext === '.ai') {
    return { score: 9.6, ext, rationale: 'High-demand AI & deep-tech vertical TLD' };
  }
  if (ext === '.io') {
    return { score: 9.3, ext, rationale: 'Developer, SaaS & infrastructure favorite' };
  }
  if (ext === '.si') {
    return { score: 9.2, ext, rationale: 'Superintelligence (.SI) & European tech hack' };
  }
  if (ext === '.org') {
    return { score: 9.1, ext, rationale: 'Institutional authority, protocol & open-ecosystem trust' };
  }
  if (ext === '.co') {
    return { score: 8.9, ext, rationale: 'Agile commercial & venture startup extension' };
  }
  if (['.dev', '.app', '.tech', '.codes', '.tools'].includes(ext)) {
    return { score: 8.8, ext, rationale: 'Specialized engineering & software vertical' };
  }
  if (ext === '.net') {
    return { score: 8.6, ext, rationale: 'Classic network & infrastructure backbone' };
  }
  if (['.studio', '.design', '.graphics', '.art'].includes(ext)) {
    return { score: 8.6, ext, rationale: 'Creative agency & visual craft vertical' };
  }
  if (['.markets', '.finance', '.fund', '.capital'].includes(ext)) {
    return { score: 8.5, ext, rationale: 'Financial markets & capital vertical' };
  }
  return { score: 8.1, ext, rationale: 'Semantic category & domain-hack extension' };
}

function cleanNichePhrase(nicheLabel: string): string {
  const cleaned = (nicheLabel || 'Modern Brand Identity')
    .replace(/&/g, 'and')
    .split(',')[0]
    .trim();
  return cleaned || 'Enterprise Craft';
}

export function evaluateDomainBrandability(
  domain: string,
  word1: string,
  word2: string,
  ext: string,
  nicheLabel: string
): DomainBrandabilityReport {
  const cleanedDomain = (domain || 'adstock.org').trim().toLowerCase();
  const sld = cleanedDomain.split('.')[0] || (word1 + word2).toLowerCase() || 'brand';
  const w1 = (word1 || sld).trim();
  const w2 = (word2 || '').trim();
  const focusNoun = w2 || cleanNichePhrase(nicheLabel).split(' ').slice(-1)[0] || 'Systems';
  const shortNiche = cleanNichePhrase(nicheLabel);

  const visualSymmetry = computeVisualSymmetry(sld);
  const phoneticFlow = computePhoneticFlow(sld);
  const tldAuthority = computeTldAuthority(ext || (cleanedDomain.includes('.') ? '.' + cleanedDomain.split('.').slice(1).join('.') : '.com'));

  const brandIndex = round1(
    visualSymmetry.score * 0.3 + phoneticFlow.score * 0.4 + tldAuthority.score * 0.3
  );

  const marketTier: MarketTierLabel =
    brandIndex >= 9.0
      ? 'Tier-1 Flagship Brand'
      : brandIndex >= 8.2
      ? 'Venture-Ready Identity'
      : 'Specialist Category Brand';

  const rng = createPrng(hashDomain(cleanedDomain));
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length) % arr.length];

  const compoundDisplay = w2 ? `${w1} ${w2}` : w1;

  const minimalistTemplates = [
    `${compoundDisplay}. Precision ${shortNiche.toLowerCase()}.`,
    `Pure ${w1.toLowerCase()} clarity for ${focusNoun.toLowerCase()} teams.`,
    `${compoundDisplay} — Built for decisive ${focusNoun.toLowerCase()}.`,
  ];

  const enterpriseTemplates = [
    `The Institutional Standard for ${shortNiche}.`,
    `Enterprise-Grade ${compoundDisplay} Infrastructure & Intelligence.`,
    `Trusted ${shortNiche} Architecture at Global Scale.`,
  ];

  const disruptiveTemplates = [
    `Turn ${w1} Into Measurable ${focusNoun} Advantage.`,
    `Outpace Legacy ${shortNiche} with ${compoundDisplay}.`,
    `Command Every ${focusNoun} Signal in Real Time.`,
  ];

  const visionaryTemplates = [
    `Autonomous ${shortNiche}, Engineered for Next-Gen Scale.`,
    `Algorithmic ${compoundDisplay} for the Post-Manual Era.`,
    `Deterministic ${shortNiche} Intelligence on ${tldAuthority.ext.toUpperCase()}.`,
  ];

  const editorialTemplates = [
    `Where ${w1} Craft Meets ${focusNoun} Permanence.`,
    `A Definitive Voice in Modern ${shortNiche}.`,
    `Clarity, Discipline, and Enduring ${compoundDisplay} Identity.`,
  ];

  const archetypeTaglines: ArchetypeTagline[] = [
    {
      id: 'minimalist',
      archetype: 'Minimalist / Direct',
      tagline: pick(minimalistTemplates),
    },
    {
      id: 'enterprise',
      archetype: 'Enterprise / Authority',
      tagline: pick(enterpriseTemplates),
    },
    {
      id: 'disruptive',
      archetype: 'Disruptive / Action',
      tagline: pick(disruptiveTemplates),
    },
    {
      id: 'visionary',
      archetype: 'Visionary / .SI Tech',
      tagline: pick(visionaryTemplates),
    },
    {
      id: 'editorial',
      archetype: 'Editorial / Trust',
      tagline: pick(editorialTemplates),
    },
  ];

  const paragraph1 = `${cleanedDomain} is a ${phoneticFlow.syllables}-syllable, ${visualSymmetry.length}-character ${
    w2 ? `two-word compound (${w1} + ${w2})` : `monolith wordmark (${w1})`
  } exhibiting a ${phoneticFlow.cadenceLabel.toLowerCase()} phonetic profile (${phoneticFlow.score}/10) and ${
    visualSymmetry.symmetricRatio
  }% axial glyph symmetry (${visualSymmetry.score}/10). Its balanced ascender-to-descender ratio (${
    visualSymmetry.ascenders
  }:${visualSymmetry.descenders}) produces a compact horizontal lockup that retains crisp counterforms from 16px browser favicons up to large-format architectural signage.`;

  const paragraph2 = `Positioned within the ${nicheLabel} vertical and anchored by the ${
    tldAuthority.ext
  } extension (${tldAuthority.score}/10 — ${tldAuthority.rationale.toLowerCase()}), ${cleanedDomain} achieves a composite .SI Brand Index of ${brandIndex}/10 (${marketTier}). The pairing of ${
    w2 ? `primary root "${w1}" with semantic specifier "${w2}"` : `distinctive root "${w1}" with ${tldAuthority.ext}`
  } establishes immediate category recall and institutional credibility without requiring explanatory sub-copy.`;

  return {
    domain: cleanedDomain,
    sld,
    visualSymmetry,
    phoneticFlow,
    tldAuthority,
    brandIndex,
    marketTier,
    archetypeTaglines,
    salesPitch: [paragraph1, paragraph2],
  };
}
