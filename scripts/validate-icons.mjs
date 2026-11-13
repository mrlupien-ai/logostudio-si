// Fails when an icon name used by the app is not a lucide-react icon, when a portfolio domain has no icon groups,
// or when a domain repeats an icon. Run: node scripts/validate-icons.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { icons } = require('lucide-react');
const valid = new Set(Object.keys(icons));
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const problems = [];

// 1. Portfolio icon groups
const groupsSrc = read('src/data/domainIconGroups.ts');
const entry = /^\s*"([^"]+)":\s*\{ niche: "[^"]*", core: (\[[^\]]*\]), word1: \{ label: "[^"]*", icons: (\[[^\]]*\]) \}, word2: \{ label: "[^"]*", icons: (\[[^\]]*\]) \} \},$/gm;
const grouped = new Map();
for (const m of groupsSrc.matchAll(entry)) {
  const list = [...JSON.parse(m[2]), ...JSON.parse(m[3]), ...JSON.parse(m[4])];
  grouped.set(m[1], list);
  if (list.length !== 10) problems.push(`${m[1]}: ${list.length} icons instead of 10`);
  const dup = list.filter((x, i) => list.indexOf(x) !== i);
  if (dup.length) problems.push(`${m[1]}: repeated ${dup.join(', ')}`);
  for (const n of list) if (!valid.has(n)) problems.push(`${m[1]}: "${n}" is not a lucide-react icon`);
}

// 2. Every portfolio domain has groups
const domainsSrc = read('src/data/domains.ts');
const listBlock = domainsSrc.match(/TLDWATCH_223_DOMAINS = \[([\s\S]*?)\];/);
const portfolio = listBlock ? [...listBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
for (const d of portfolio) if (!grouped.has(d)) problems.push(`${d}: missing from DOMAIN_ICON_GROUPS`);

// 3. Keyword rules and fallback for unknown domains
const semSrc = read('src/data/domainSemanticIcons.ts');
const rulesStart = semSrc.indexOf('SEMANTIC_KEYWORD_RULES');
const tail = rulesStart >= 0 ? semSrc.slice(rulesStart) : '';
for (const m of tail.matchAll(/icons:\s*\[([^\]]*)\]/g)) {
  for (const n of [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])) {
    if (!valid.has(n)) problems.push(`keyword rules / fallback: "${n}" is not a lucide-react icon`);
  }
}

console.log(`lucide-react icons: ${valid.size} · portfolio domains: ${portfolio.length} · grouped: ${grouped.size}`);
const unique = [...new Set(problems)];
if (unique.length) {
  console.error(`${unique.length} problem(s):\n- ${unique.join('\n- ')}`);
  process.exit(1);
}
console.log('OK: every icon name is valid and every portfolio domain has 10 distinct icons.');
