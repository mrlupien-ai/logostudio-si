import { describe, it, expect } from 'vitest';
import {
  ALL_CONSTRUCTION_FAMILIES,
  constructionsForDomain,
  instantiateFamily,
  renderConstruction,
  validateConstructionSpec,
  describeConstruction,
} from './constructionEngine';
import { buildEmblemSvgMarkup, buildEmblemInnerMarkup, emblemConfigFromState, generateFullLogoSvg } from './svgBuilder';
import { computeLockupLayout } from './lockupLayout';
import { COLOR_PALETTES, parseDomainOrBrand, TLDWATCH_223_DOMAINS } from '../data/domains';
import { wcagContrastRatio } from './color';
import { LogoState } from '../types/logo';

const TEST_DOMAINS = [
  'adstock.org',
  'paybank.io',
  'cloudnova.ai',
  'petcare.co',
  'legalshield.com',
  'fitpulse.app',
  'greenleaf.org',
  'codeforge.dev',
  'bookworm.club',
  'cargojet.net',
  'pixelcraft.studio',
  'medivault.health',
] as const;

const DUMMY_RENDER_ICON = (x: number, y: number, size: number, color: string) =>
  `<g data-icon="true" transform="translate(${x},${y})" data-size="${size}" stroke="${color}"><circle cx="12" cy="12" r="10"/></g>`;

describe('Per-Domain Emblem Construction Engine', () => {
  it('1. Determinism: constructionsForDomain("adstock.org", 0) called twice returns deepEqual specs and byte-identical SVG strings', () => {
    const first = constructionsForDomain('adstock.org', 0);
    const second = constructionsForDomain('adstock.org', 0);

    expect(first).toEqual(second);
    expect(first.length).toBe(10);

    for (let i = 0; i < first.length; i++) {
      const svg1 = renderConstruction(first[i], {
        c1: '#0B132B',
        c2: '#00A878',
        c3: '#F59E0B',
        initChar: 'A',
        fontFamily: 'Plus Jakarta Sans',
        renderIcon: DUMMY_RENDER_ICON,
      });
      const svg2 = renderConstruction(second[i], {
        c1: '#0B132B',
        c2: '#00A878',
        c3: '#F59E0B',
        initChar: 'A',
        fontFamily: 'Plus Jakarta Sans',
        renderIcon: DUMMY_RENDER_ICON,
      });
      expect(svg1).toBe(svg2);
    }
  });

  it('2. Uniqueness inside a batch: for any domain, the 10 specs have 10 different family values and 10 different ids', () => {
    for (const dom of TEST_DOMAINS) {
      const specs = constructionsForDomain(dom, 0, 10);
      expect(specs.length).toBe(10);

      const families = new Set(specs.map((s) => s.family));
      const ids = new Set(specs.map((s) => s.id));
      expect(families.size).toBe(10);
      expect(ids.size).toBe(10);
    }
  });

  it('3. Uniqueness across 12 domains: no two domains get the same ordered list of families, and no two share > 3 exact ConstructionSpec.ids', () => {
    const domainSpecs = TEST_DOMAINS.map((dom) => ({
      domain: dom,
      specs: constructionsForDomain(dom, 0, 10),
    }));

    for (let i = 0; i < domainSpecs.length; i++) {
      for (let j = i + 1; j < domainSpecs.length; j++) {
        const a = domainSpecs[i];
        const b = domainSpecs[j];

        const orderA = a.specs.map((s) => s.family).join(',');
        const orderB = b.specs.map((s) => s.family).join(',');
        expect(orderA).not.toBe(orderB);

        const idsA = new Set(a.specs.map((s) => s.id));
        const sharedIds = b.specs.filter((s) => idsA.has(s.id));
        expect(sharedIds.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it('4. All 36 families (including non-square/non-circle silhouettes): render each family with 50 random seeds, assert valid XML and all 5 geometric checks pass', () => {
    expect(ALL_CONSTRUCTION_FAMILIES.length).toBe(36);

    // Also verify that for every test domain, at least 8 of the 10 generated constructions are non-card silhouettes
    const cardSet = new Set([
      'cornerCut',
      'splitPanel',
      'gridBlocks',
      'offsetShadow',
      'foldedCorner',
      'halfTone',
      'windowQuad',
      'tiltCard',
    ]);
    for (const dom of TEST_DOMAINS) {
      const specs = constructionsForDomain(dom, 0, 10);
      const nonCardCount = specs.filter((s) => !cardSet.has(s.family)).length;
      expect(nonCardCount).toBeGreaterThanOrEqual(8);
    }

    for (const family of ALL_CONSTRUCTION_FAMILIES) {
      for (let s = 1; s <= 50; s++) {
        const seed = (s * 2654435761) >>> 0;
        const spec = instantiateFamily(family, seed, 0);

        // Geometric checks
        const check = validateConstructionSpec(spec, {
          c1: '#0B132B',
          c2: '#00A878',
          c3: '#F59E0B',
        });
        expect(check.valid).toBe(true);
        expect(check.reasons).toEqual([]);
        expect(check.iconSize).toBeGreaterThanOrEqual(84);
        expect(check.iconSize).toBeLessThanOrEqual(124);
        expect(check.contrastRatio).toBeGreaterThanOrEqual(3.0);

        // Render SVG inner markup
        const inner = renderConstruction(spec, {
          c1: '#0B132B',
          c2: '#00A878',
          c3: '#F59E0B',
          initChar: 'A',
          fontFamily: 'Plus Jakarta Sans',
          renderIcon: DUMMY_RENDER_ICON,
        });
        const fullSvg = `<svg viewBox="0 0 200 200">${inner}</svg>`;

        expect(fullSvg).not.toContain('NaN');
        expect(fullSvg).not.toContain('undefined');
        expect(fullSvg).toContain('data-icon="true"');

        // Verify balanced XML tags
        const openTags = (fullSvg.match(/<[a-zA-Z0-9]+(?:\s[^>]*)?(?<!\/)>/g) || []).length;
        const closeTags = (fullSvg.match(/<\/[a-zA-Z0-9]+>/g) || []).length;
        expect(openTags).toBe(closeTags);

        // Verify describeConstruction returns non-empty description
        expect(describeConstruction(spec).length).toBeGreaterThan(15);
      }
    }
  });

  it('5. Legacy compatibility: cutoutCorner with no construction produces the exact same SVG as before the change', () => {
    const legacyEmblem = buildEmblemSvgMarkup(
      {
        containerStyle: 'cutoutCorner',
        activeIcon: 'ChartSpline',
        primary: '#0B132B',
        secondary: '#00A878',
        accent: '#F59E0B',
        fontFamily: 'Plus Jakarta Sans',
        word1: 'Ad',
        iconStrokeWidth: 2.2,
        iconRotation: 0,
        iconFlipH: false,
        iconFlipV: false,
      },
      200
    );

    const expectedLegacySnapshot =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">\n' +
      '        <rect x="20" y="24" width="146" height="150" rx="38" fill="#0B132B"/>\n' +
      '        <path d="M20 64 C20 42 38 24 60 24 H124 C146 24 166 42 166 64 V92 H20 Z" fill="#00A878" opacity="0.25"/>\n' +
      '        <circle cx="150" cy="50" r="34" fill="#FFFFFF"/>\n' +
      '        <circle cx="150" cy="50" r="24" fill="#00A878"/>\n' +
      '        <circle cx="150" cy="50" r="8" fill="#FFFFFF"/>\n' +
      '        \n' +
      '      <g transform="translate(87, 105) rotate(0) scale(1, 1) translate(-43, -43)">\n' +
      '        <g transform="scale(3.5833333333333335)" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">\n' +
      '          <path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7"></path>\n' +
      '        </g>\n' +
      '      </g>\n' +
      '    \n' +
      '      </svg>';

    expect(legacyEmblem).toBe(expectedLegacySnapshot);

    // Also verify generateFullLogoSvg works with legacy state
    const legacyState: LogoState = {
      domain: 'adstock.org',
      brandName: 'Ad Stock',
      word1: 'Ad',
      word2: 'Stock',
      ext: '.org',
      keepExt: false,
      extStyle: 'pill',
      tagline: '',
      showTagline: false,
      taglineFont: 'Plus Jakarta Sans',
      taglineTracking: 3.5,
      typoContrast: 'bold-bold',
      fontFamily: 'Plus Jakarta Sans',
      fontWeight1: '800',
      fontWeight2: '700',
      letterCase1: 'as-is',
      letterCase2: 'as-is',
      tracking: -1.5,
      tracking1Em: -0.02,
      tracking2Em: -0.01,
      wordmarkAccent: 'none',
      activeIcon: 'ChartSpline',
      secondaryIcon: 'TrendingUp',
      emblemFusion: 'single',
      motionPreset: 'none',
      containerStyle: 'cutoutCorner',
      iconStrokeWidth: 2.2,
      iconRotation: 0,
      iconFlipH: false,
      iconFlipV: false,
      emblemPadding: 24,
      emblemCornerRadius: 38,
      primary: '#0B132B',
      secondary: '#00A878',
      accent: '#F59E0B',
      backgroundColor: '#FFFFFF',
      bgMode: 'white',
      mainLayout: 'horizontal',
      masterScale: 1,
      iconScale: 1,
      gap: 26,
      baselineOffset: 0,
      nicheLabel: 'Finance',
      icons10: ['ChartSpline'],
      rasterMode: false,
      rasterDataUrl: null,
      variants10: [],
      activeVariantIndex: 0,
    };

    const fullLegacySvg = generateFullLogoSvg(legacyState, { width: 750, height: 450, background: 'white' });
    expect(fullLegacySvg).toContain('<rect x="20" y="24" width="146" height="150" rx="38" fill="#0B132B"/>');
    expect(fullLegacySvg).toContain('<circle cx="150" cy="50" r="34" fill="#FFFFFF"/>');
  });

  it('6. Remix: constructionsForDomain("adstock.org", 0) and constructionsForDomain("adstock.org", 1) share at most 3 ConstructionSpec.ids', () => {
    const seed0 = constructionsForDomain('adstock.org', 0, 10);
    const seed1 = constructionsForDomain('adstock.org', 1, 10);

    const ids0 = new Set(seed0.map((s) => s.id));
    const shared = seed1.filter((s) => ids0.has(s.id));
    expect(shared.length).toBeLessThanOrEqual(3);
  });

  it('7. Independent Fundal & Icon visibility: hiding either layer preserves the other cleanly and hiding both centers the wordmark inside the 80% safe crop', () => {
    const spec = instantiateFamily('notchTab', 12345, 0);
    const baseState: LogoState = {
      domain: 'adstock.org',
      brandName: 'Ad Stock',
      word1: 'Ad',
      word2: 'Stock',
      ext: '.org',
      keepExt: true,
      extStyle: 'inline',
      tagline: '',
      showTagline: false,
      taglineFont: 'Plus Jakarta Sans',
      taglineTracking: 3.5,
      typoContrast: 'bold-bold',
      fontFamily: 'Plus Jakarta Sans',
      fontWeight1: '800',
      fontWeight2: '700',
      letterCase1: 'as-is',
      letterCase2: 'as-is',
      tracking: -1.5,
      tracking1Em: -0.02,
      tracking2Em: -0.01,
      wordmarkAccent: 'none',
      activeIcon: 'ChartSpline',
      secondaryIcon: 'TrendingUp',
      emblemFusion: 'single',
      motionPreset: 'none',
      containerStyle: 'cutoutCorner',
      construction: spec,
      iconStrokeWidth: 2.2,
      iconRotation: 0,
      iconFlipH: false,
      iconFlipV: false,
      emblemPadding: 24,
      emblemCornerRadius: 38,
      primary: '#0B132B',
      secondary: '#00A878',
      accent: '#F59E0B',
      backgroundColor: '#FFFFFF',
      bgMode: 'white',
      mainLayout: 'horizontal',
      masterScale: 1,
      iconScale: 1,
      gap: 26,
      baselineOffset: 0,
      nicheLabel: 'Finance',
      icons10: ['ChartSpline'],
      rasterMode: false,
      rasterDataUrl: null,
      variants10: [],
      activeVariantIndex: 0,
    };

    // Hide background only -> icon stays visible with WCAG contrast against white (not #FFFFFF!)
    const iconOnly = buildEmblemInnerMarkup(
      emblemConfigFromState({ ...baseState, showEmblemBg: false, showEmblemIcon: true })
    );
    expect(iconOnly).toContain('<path');
    expect(iconOnly).not.toContain('fill="#0B132B"');
    expect(iconOnly).not.toContain('stroke="#FFFFFF"');

    // Hide icon only -> background stays visible, no Lucide icon paths
    const bgOnly = buildEmblemInnerMarkup(
      emblemConfigFromState({ ...baseState, showEmblemBg: true, showEmblemIcon: false })
    );
    expect(bgOnly).toContain('#0B132B');
    expect(bgOnly).not.toContain('M3 3v16');

    // Hide both -> empty emblem markup and lockup layout omits emblem and centers wordmark
    const hiddenBothState: LogoState = { ...baseState, showEmblemBg: false, showEmblemIcon: false };
    expect(buildEmblemInnerMarkup(emblemConfigFromState(hiddenBothState))).toBe('');

    const layout = computeLockupLayout(null, hiddenBothState, 750, 450, false);
    expect(layout.emblem.show).toBe(false);
    expect(layout.isCutByDefaultCrop).toBe(false);
    const center = layout.boundingBox.x + layout.boundingBox.width / 2;
    expect(Math.abs(center - 375)).toBeLessThan(2);
  });

  it('8. Independent colors, uniform scale (no distortion), and automatic viewBox bleed are deterministic', () => {
    const spec = instantiateFamily('slashBand', 99991, 0);
    const customState: LogoState = {
      domain: 'adstock.org',
      brandName: 'Ad Stock',
      word1: 'Ad',
      word2: 'Stock',
      ext: '.org',
      keepExt: true,
      extStyle: 'inline',
      tagline: '',
      showTagline: false,
      taglineFont: 'Plus Jakarta Sans',
      taglineTracking: 3.5,
      typoContrast: 'bold-bold',
      fontFamily: 'Plus Jakarta Sans',
      fontWeight1: '800',
      fontWeight2: '700',
      letterCase1: 'as-is',
      letterCase2: 'as-is',
      tracking: -1.5,
      tracking1Em: -0.02,
      tracking2Em: -0.01,
      wordmarkAccent: 'none',
      activeIcon: 'ChartSpline',
      secondaryIcon: 'TrendingUp',
      emblemFusion: 'single',
      motionPreset: 'none',
      containerStyle: 'cutoutCorner',
      construction: spec,
      iconStrokeWidth: 2.2,
      iconRotation: 0,
      iconFlipH: false,
      iconFlipV: false,
      showEmblemBg: true,
      showEmblemIcon: true,
      emblemBgColor: '#7C3AED',
      emblemBgAccentColor: '#EC4899',
      emblemIconColor: '#FEF08A',
      emblemBgScale: 1.25,
      emblemBgOffsetX: -18,
      emblemBgOffsetY: 12,
      emblemIconScale: 0.85,
      emblemIconOffsetX: 10,
      emblemIconOffsetY: -6,
      emblemPadding: 24,
      emblemCornerRadius: 38,
      primary: '#0F172A',
      secondary: '#059669',
      accent: '#10B981',
      backgroundColor: '#FFFFFF',
      bgMode: 'white',
      mainLayout: 'horizontal',
      masterScale: 1,
      iconScale: 1,
      gap: 26,
      baselineOffset: 0,
      nicheLabel: 'Finance',
      icons10: ['ChartSpline'],
      rasterMode: false,
      rasterDataUrl: null,
      variants10: [],
      activeVariantIndex: 0,
    };

    const svg1 = generateFullLogoSvg(customState, { width: 750, height: 450, background: 'white' });
    const svg2 = generateFullLogoSvg(customState, { width: 750, height: 450, background: 'white' });
    expect(svg1).toBe(svg2);

    // Custom emblem colors applied independently while wordmark keeps primary/secondary
    expect(svg1).toContain('#7C3AED');
    expect(svg1).toContain('#FEF08A');
    expect(svg1).toContain('fill="#0F172A"');
    expect(svg1).toContain('fill="#059669"');

    // Uniform scale transforms (single scalar scale(1.25) and scale(0.85))
    expect(svg1).toContain('scale(1.25)');
    expect(svg1).toContain('scale(0.85)');

    // Standalone emblem SVG adds symmetric negative viewBox bleed so scaled/offset shapes never clip
    const standalone = buildEmblemSvgMarkup(emblemConfigFromState(customState), 200);
    expect(standalone).toMatch(/viewBox="-\d+ -\d+ \d+ \d+"/);

    // Safe crop layout remains intact even with scaled/offset emblem
    const layout = computeLockupLayout(null, customState, 750, 450, false);
    expect(layout.isCutByDefaultCrop).toBe(false);
  });

  it('9. Curated Color Palettes: >= 100 unique palettes, valid hexes, WCAG-safe primary & secondary contrast on white, and broad portfolio distribution', () => {
    expect(COLOR_PALETTES.length).toBeGreaterThanOrEqual(100);

    const names = new Set<string>();
    const pairs = new Set<string>();
    const hexRegex = /^#[0-9A-F]{6}$/i;

    for (const p of COLOR_PALETTES) {
      expect(hexRegex.test(p.primary)).toBe(true);
      expect(hexRegex.test(p.secondary)).toBe(true);
      expect(hexRegex.test(p.accent)).toBe(true);

      expect(names.has(p.name)).toBe(false);
      names.add(p.name);

      const pairKey = `${p.primary.toLowerCase()}|${p.secondary.toLowerCase()}`;
      expect(pairs.has(pairKey)).toBe(false);
      pairs.add(pairKey);

      expect(wcagContrastRatio(p.primary, '#FFFFFF')).toBeGreaterThanOrEqual(7.0);
      expect(wcagContrastRatio(p.secondary, '#FFFFFF')).toBeGreaterThanOrEqual(3.0);
    }

    // Keep adstock.org on Institutional Emerald (#0)
    expect(parseDomainOrBrand('adstock.org').palette.name).toBe('Institutional Emerald');

    // Verify 223 portfolio domains span many distinct curated palettes (well above the previous 10)
    const usedPalettes = new Set(
      TLDWATCH_223_DOMAINS.map((dom) => parseDomainOrBrand(dom).palette.name)
    );
    expect(usedPalettes.size).toBeGreaterThanOrEqual(75);
  });
});
