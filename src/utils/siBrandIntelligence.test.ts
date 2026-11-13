import { describe, expect, it } from 'vitest';
import { evaluateDomainBrandability } from './siBrandIntelligence';
import { getClosestPantone, getWcagContrast, rgbToCmyk } from './color';
import { segmentDomainSld } from '../data/wordSegmenter';
import { parseDomainOrBrand } from '../data/domains';

describe('siBrandIntelligence & color science utilities', () => {
  it('evaluateDomainBrandability is deterministic and computes distinct scores for different domains', () => {
    const r1 = evaluateDomainBrandability(
      'adstock.org',
      'Ad',
      'Stock',
      '.org',
      'Adstock & Advertising Carryover Analytics'
    );
    const r2 = evaluateDomainBrandability(
      'adstock.org',
      'Ad',
      'Stock',
      '.org',
      'Adstock & Advertising Carryover Analytics'
    );
    expect(r1).toEqual(r2);
    expect(r1.archetypeTaglines).toHaveLength(5);
    expect(r1.salesPitch).toHaveLength(2);
    expect(r1.tldAuthority.score).toBe(9.1);

    const rCom = evaluateDomainBrandability(
      'adstock.com',
      'Ad',
      'Stock',
      '.com',
      'Adstock & Advertising Carryover Analytics'
    );
    expect(rCom.tldAuthority.score).toBe(9.8);
    expect(rCom.brandIndex).toBeGreaterThan(r1.brandIndex);

    const rLong = evaluateDomainBrandability(
      'internationalanalyticsplatform.xyz',
      'International',
      'Analyticsplatform',
      '.xyz',
      'Analytics'
    );
    expect(rLong.brandIndex).toBeLessThan(r1.brandIndex);
  });

  it('rgbToCmyk converts pure colors and neutrals accurately', () => {
    expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
    const emerald = rgbToCmyk(0, 168, 120);
    expect(emerald.c).toBeGreaterThan(80);
    expect(emerald.y).toBeGreaterThan(20);
  });

  it('getWcagContrast computes WCAG 2.1 contrast ratios and levels', () => {
    const bw = getWcagContrast('#000000', '#FFFFFF');
    expect(bw.ratio).toBe(21);
    expect(bw.aaaNormal).toBe(true);
    expect(bw.levelLabel).toBe('AAA');

    const low = getWcagContrast('#94A3B8', '#FFFFFF');
    expect(low.aaNormal).toBe(false);
  });

  it('getClosestPantone returns a valid Pantone Solid Coated approximation via CIEDE2000', () => {
    const p = getClosestPantone('#00A878');
    expect(p.code).toContain('PMS');
    expect(p.deltaE).toBeGreaterThanOrEqual(0);
    expect(p.deltaE).toBeLessThan(20);
  });

  it('segmentDomainSld and parseDomainOrBrand segment 2-word and 3-word domains accurately', () => {
    expect(segmentDomainSld('brightharbor')).toEqual(['Bright', 'Harbor', '']);
    expect(segmentDomainSld('cloudpulse')).toEqual(['Cloud', 'Pulse', '']);
    expect(segmentDomainSld('allfancyfont')).toEqual(['All', 'Fancy', 'Font']);

    const pFancy = parseDomainOrBrand('allfancyfont.com');
    expect([pFancy.word1, pFancy.word2, pFancy.word3]).toEqual(['All', 'Fancy', 'Font']);

    const pPet = parseDomainOrBrand('apetshopz.com');
    expect([pPet.word1, pPet.word2, pPet.word3]).toEqual(['A', 'Pet', 'Shopz']);

    const pNova = parseDomainOrBrand('novapetstore.com');
    expect([pNova.word1, pNova.word2, pNova.word3]).toEqual(['Nova', 'Pet', 'Store']);

    const pQr = parseDomainOrBrand('onlineqrcodegenerator.com');
    expect([pQr.word1, pQr.word2, pQr.word3]).toEqual(['Online', 'QRCode', 'Generator']);
  });
});
