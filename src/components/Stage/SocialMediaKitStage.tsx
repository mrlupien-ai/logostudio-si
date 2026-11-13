import React from 'react';
import JSZip from 'jszip';
import { Download, Code, Type, Globe, Tag, Share2 } from 'lucide-react';
import { LogoState } from '../../types/logo';
import {
  buildEmblemInnerMarkup,
  extractSvgInnerFromLucide,
  formatWordText,
  getTypographicWeights,
} from '../../utils/svgBuilder';
import {
  downloadSvgString,
  downloadSvgStringAsPng,
  renderSvgStringToPngDataUrl,
} from '../../utils/exporter';
import { ensureFontsLoaded } from '../../utils/fontLoader';

export type SocialArtDirection =
  | 'editorial-split'
  | 'pure-white'
  | 'brand-primary'
  | 'symbol-pattern'
  | 'midnight-glow';

export type SocialPlatform =
  | 'All'
  | 'Instagram'
  | 'X'
  | 'LinkedIn'
  | 'Facebook'
  | 'YouTube'
  | 'TikTok'
  | 'Pinterest'
  | 'Web';

interface SocialFormatSpec {
  id: string;
  title: string;
  width: number;
  height: number;
  ratioLabel: string;
  folder: 'profile' | 'posts' | 'stories' | 'covers' | 'web';
  section: 'feed' | 'stories' | 'covers';
  platforms: Exclude<SocialPlatform, 'All'>[];
  description: string;
  layoutKind: 'avatar' | 'stacked-card' | 'story' | 'wide-banner' | 'youtube-tv' | 'og-card';
}

const SOCIAL_FORMATS: SocialFormatSpec[] = [
  // Section 1: Profile Picture & Feed Posts (4)
  {
    id: 'profile-picture',
    title: 'Profile Picture',
    width: 1080,
    height: 1080,
    ratioLabel: '1080 × 1080 · 1:1',
    folder: 'profile',
    section: 'feed',
    platforms: ['Instagram', 'X', 'LinkedIn', 'Facebook', 'YouTube', 'TikTok', 'Pinterest'],
    description: 'Symbol centred inside the circular crop every platform applies to avatars.',
    layoutKind: 'avatar',
  },
  {
    id: 'square-feed-post',
    title: 'Square Feed Post',
    width: 1080,
    height: 1080,
    ratioLabel: '1080 × 1080 · 1:1',
    folder: 'posts',
    section: 'feed',
    platforms: ['Instagram', 'LinkedIn', 'Facebook', 'X'],
    description: 'Stacked logo, tagline and domain for announcement and launch posts.',
    layoutKind: 'stacked-card',
  },
  {
    id: 'portrait-feed-post',
    title: 'Portrait Feed Post',
    width: 1080,
    height: 1350,
    ratioLabel: '1080 × 1350 · 4:5',
    folder: 'posts',
    section: 'feed',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    description: 'The tallest feed format; the logo sits inside the 3:4 area shown on the profile grid.',
    layoutKind: 'stacked-card',
  },
  {
    id: 'profile-grid-post',
    title: 'Profile Grid Post',
    width: 1080,
    height: 1440,
    ratioLabel: '1080 × 1440 · 3:4',
    folder: 'posts',
    section: 'feed',
    platforms: ['Instagram'],
    description: 'Matches the 3:4 Instagram profile grid, so nothing is cropped on the profile page.',
    layoutKind: 'stacked-card',
  },

  // Section 2: Stories, Reels & Pins (2)
  {
    id: 'story-reel-cover',
    title: 'Story & Reel Cover',
    width: 1080,
    height: 1920,
    ratioLabel: '1080 × 1920 · 9:16',
    folder: 'stories',
    section: 'stories',
    platforms: ['Instagram', 'TikTok', 'Facebook', 'YouTube'],
    description: 'Full-screen vertical card; the logo stays clear of the top and bottom app controls.',
    layoutKind: 'story',
  },
  {
    id: 'pinterest-pin',
    title: 'Pinterest Pin',
    width: 1000,
    height: 1500,
    ratioLabel: '1000 × 1500 · 2:3',
    folder: 'posts',
    section: 'stories',
    platforms: ['Pinterest'],
    description: 'Standard 2:3 pin with the logo, tagline and domain.',
    layoutKind: 'stacked-card',
  },

  // Section 3: Covers, Banners & Link Preview (6)
  {
    id: 'x-header',
    title: 'X Header',
    width: 1500,
    height: 500,
    ratioLabel: '1500 × 500 · 3:1',
    folder: 'covers',
    section: 'covers',
    platforms: ['X'],
    description: 'Header banner; the profile picture overlaps the lower-left corner, so the logo sits to its right.',
    layoutKind: 'wide-banner',
  },
  {
    id: 'linkedin-profile-cover',
    title: 'LinkedIn Profile Cover',
    width: 1584,
    height: 396,
    ratioLabel: '1584 × 396 · 4:1',
    folder: 'covers',
    section: 'covers',
    platforms: ['LinkedIn'],
    description: 'Personal profile background; the photo overlaps the lower-left part of the banner.',
    layoutKind: 'wide-banner',
  },
  {
    id: 'linkedin-company-cover',
    title: 'LinkedIn Company Cover',
    width: 1128,
    height: 191,
    ratioLabel: '1128 × 191 · 5.9:1',
    folder: 'covers',
    section: 'covers',
    platforms: ['LinkedIn'],
    description: 'Company page cover; the page logo overlaps the lower-left edge.',
    layoutKind: 'wide-banner',
  },
  {
    id: 'facebook-page-cover',
    title: 'Facebook Page Cover',
    width: 1702,
    height: 630,
    ratioLabel: '1702 × 630 · 2.7:1 (851×315 @2x)',
    folder: 'covers',
    section: 'covers',
    platforms: ['Facebook'],
    description: 'Exported at 2× the 851×315 upload size for sharp screens; content stays in the centre area mobile keeps.',
    layoutKind: 'wide-banner',
  },
  {
    id: 'youtube-channel-banner',
    title: 'YouTube Channel Banner',
    width: 2560,
    height: 1440,
    ratioLabel: '2560 × 1440 · 16:9',
    folder: 'covers',
    section: 'covers',
    platforms: ['YouTube'],
    description: 'Full TV-size artwork; logo and text sit in the 1546×423 centre area shown on every device.',
    layoutKind: 'youtube-tv',
  },
  {
    id: 'link-preview-og',
    title: 'Link Preview (Open Graph)',
    width: 1200,
    height: 630,
    ratioLabel: '1200 × 630 · 1.91:1',
    folder: 'web',
    section: 'covers',
    platforms: ['Web', 'Facebook', 'LinkedIn', 'X'],
    description: 'Image shown when the site link is shared in chats, social posts and search previews.',
    layoutKind: 'og-card',
  },
];

const ART_DIRECTIONS: Array<{
  id: SocialArtDirection;
  title: string;
  isDefault?: boolean;
  description: string;
}> = [
  {
    id: 'editorial-split',
    title: 'Editorial Split & Accent',
    isDefault: true,
    description: 'Brand-colour panel with an accent wedge, logo on a clean white stage',
  },
  {
    id: 'pure-white',
    title: 'Pure White Studio',
    description: 'White canvas, fine accent rules and generous space',
  },
  {
    id: 'brand-primary',
    title: 'Brand Primary Contrast',
    description: 'Full brand-colour backdrop with a white wordmark',
  },
  {
    id: 'symbol-pattern',
    title: 'Symbol Pattern',
    description: 'Light brand tint with a tiled watermark of the symbol',
  },
  {
    id: 'midnight-glow',
    title: 'Midnight Glow',
    description: 'Deep navy backdrop with an accent glow, white wordmark',
  },
];

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSocialFormatSvg(
  state: LogoState,
  format: SocialFormatSpec,
  options: {
    artDirection: SocialArtDirection;
    showTagline: boolean;
    showDomain: boolean;
    showIndustry: boolean;
    includeSafeZones: boolean;
  }
): string {
  const { width: W, height: H } = format;
  const { artDirection, showTagline, showDomain, showIndustry, includeSafeZones } = options;

  const c1 = state.primary || '#0F172A';
  const c2 = state.secondary || '#059669';
  const c3 = state.accent || '#F59E0B';
  const font = state.fontFamily || 'Plus Jakarta Sans';

  const weights = getTypographicWeights(state.typoContrast);
  const w1Text = formatWordText(state.word1, state.letterCase1, weights.isUpper);
  const w2Text = formatWordText(state.word2, state.letterCase2, weights.isUpper);
  const extText = state.keepExt ? state.ext : '';

  const emblemInner = buildEmblemInnerMarkup({
    containerStyle: state.containerStyle,
    construction: state.construction,
    activeIcon: state.activeIcon,
    customSvgPath: state.customSvgPath,
    primary: c1,
    secondary: c2,
    accent: c3,
    fontFamily: font,
    word1: state.word1,
    iconStrokeWidth: state.iconStrokeWidth,
    iconRotation: state.iconRotation,
    iconFlipH: state.iconFlipH,
    iconFlipV: state.iconFlipV,
  });

  const patternIconInner = extractSvgInnerFromLucide(state.activeIcon, c1, 1.8);
  const isDarkStage = artDirection === 'brand-primary' || artDirection === 'midnight-glow';
  const word1Fill = isDarkStage ? '#FFFFFF' : c1;
  const word2Fill = isDarkStage ? c3 : c2;
  const industryFill = isDarkStage ? 'rgba(255,255,255,0.72)' : c2;
  const taglineFill = isDarkStage ? 'rgba(255,255,255,0.8)' : '#475569';
  const pillBg = isDarkStage ? 'rgba(255,255,255,0.14)' : c1;
  const pillText = '#FFFFFF';

  const uid = `${format.id}-${artDirection}`;
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;600;700;800;900&amp;display=swap`;

  // 1. AVATAR / PROFILE PICTURE (1080x1080)
  if (format.layoutKind === 'avatar') {
    const bgFill =
      artDirection === 'brand-primary'
        ? c1
        : artDirection === 'midnight-glow'
        ? '#070B14'
        : '#FFFFFF';
    const ringStroke = artDirection === 'pure-white' ? c2 : c3;
    const emblemSize = W * 0.56;
    const emblemX = (W - emblemSize) / 2;
    const emblemY = (H - emblemSize) / 2;

    const safeOverlay = includeSafeZones
      ? `<circle cx="${W / 2}" cy="${H / 2}" r="${W * 0.43}" fill="none" stroke="#10B981" stroke-width="5" stroke-dasharray="18 12" />`
      : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by LogoStudio.si -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow-${uid}" cx="70%" cy="25%" r="75%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${bgFill}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bgFill}" />
  ${artDirection === 'midnight-glow' ? `<rect width="${W}" height="${H}" fill="url(#glow-${uid})" />` : ''}
  <circle cx="${W / 2}" cy="${H / 2}" r="${W * 0.44}" fill="none" stroke="${ringStroke}" stroke-width="${W * 0.032}" opacity="0.9" />
  <g transform="translate(${emblemX}, ${emblemY}) scale(${emblemSize / 200})">
    ${emblemInner}
  </g>
  ${safeOverlay}
</svg>`;
  }

  // Build background stage according to Art Direction & orientation
  const isVertical = H >= W;
  let stageMarkup = '';

  if (artDirection === 'editorial-split') {
    if (isVertical) {
      const splitY1 = H * 0.36;
      const splitY2 = H * 0.31;
      stageMarkup = `
        <rect width="${W}" height="${H}" fill="#FFFFFF" />
        <polygon points="0,0 ${W},0 ${W},${splitY2} 0,${splitY1}" fill="${c1}" />
        <polygon points="0,${splitY1 - H * 0.018} ${W},${splitY2 - H * 0.008} ${W},${splitY2 + H * 0.018} 0,${splitY1 + H * 0.01}" fill="${c2}" />
      `;
    } else {
      const splitX1 = W * 0.34;
      const splitX2 = W * 0.27;
      stageMarkup = `
        <rect width="${W}" height="${H}" fill="#FFFFFF" />
        <polygon points="0,0 ${splitX1},0 ${splitX2},${H} 0,${H}" fill="${c1}" />
        <polygon points="${splitX1 - W * 0.012},0 ${splitX1 + W * 0.038},0 ${splitX2 + W * 0.025},${H} ${splitX2 - W * 0.01},${H}" fill="${c2}" />
      `;
    }
  } else if (artDirection === 'pure-white') {
    stageMarkup = `
      <rect width="${W}" height="${H}" fill="#FFFFFF" />
      <rect x="${W * 0.04}" y="${H * 0.04}" width="${W * 0.92}" height="${H * 0.92}" rx="20" fill="none" stroke="#E2E8F0" stroke-width="2" />
      <line x1="${W * 0.08}" y1="${H * 0.14}" x2="${W * 0.92}" y2="${H * 0.14}" stroke="${c2}" stroke-width="2" stroke-opacity="0.3" />
    `;
  } else if (artDirection === 'brand-primary') {
    stageMarkup = `
      <rect width="${W}" height="${H}" fill="${c1}" />
      <polygon points="${W * 0.72},0 ${W},0 ${W},${H} ${W * 0.56},${H}" fill="${c2}" opacity="0.22" />
      <line x1="${W * 0.08}" y1="${H * 0.86}" x2="${W * 0.92}" y2="${H * 0.86}" stroke="${c3}" stroke-width="3" stroke-opacity="0.45" />
    `;
  } else if (artDirection === 'symbol-pattern') {
    stageMarkup = `
      <defs>
        <pattern id="pat-${uid}" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
          <g transform="translate(36, 36) scale(2.0)" fill="none" stroke="${c1}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.06">
            ${patternIconInner}
          </g>
        </pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="#F8FAFC" />
      <rect width="${W}" height="${H}" fill="url(#pat-${uid})" />
    `;
  } else {
    // midnight-glow
    stageMarkup = `
      <defs>
        <radialGradient id="mg-${uid}" cx="78%" cy="22%" r="75%">
          <stop offset="0%" stop-color="${c2}" stop-opacity="0.52"/>
          <stop offset="50%" stop-color="${c3}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#050811" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="#050811" />
      <rect width="${W}" height="${H}" fill="url(#mg-${uid})" />
    `;
  }

  const industryUpper = escapeXml((state.nicheLabel || 'BRAND IDENTITY').toUpperCase());
  const domainClean = escapeXml(state.domain || 'domain.com');
  const taglineText = escapeXml(state.tagline || 'NEXT-GENERATION PLATFORM');

  // 2. STACKED CARD OR STORY (Vertical / Square formats)
  if (format.layoutKind === 'stacked-card' || format.layoutKind === 'story') {
    const centerY = format.layoutKind === 'story' ? H * 0.47 : H * 0.46;
    const emblemCardSize = Math.min(W, H) * 0.25;
    const emblemSize = emblemCardSize * 0.78;
    const emblemCardX = (W - emblemCardSize) / 2;
    const emblemCardY = centerY - emblemCardSize * 0.85;

    const fontSize = Math.round(W * 0.095);
    const wordY = emblemCardY + emblemCardSize + fontSize * 1.15;

    const topLabelColor =
      artDirection === 'editorial-split' || isDarkStage ? 'rgba(255,255,255,0.82)' : industryFill;
    const topLabelY = format.layoutKind === 'story' ? H * 0.21 : H * 0.1;

    const pillW = Math.max(220, domainClean.length * 22 + 64);
    const pillH = 52;
    const pillX = (W - pillW) / 2;
    const pillY = format.layoutKind === 'story' ? H * 0.74 : H * 0.83;

    let safeZoneMarkup = '';
    if (includeSafeZones) {
      if (format.id === 'portrait-feed-post') {
        const safeH = (W * 4) / 3;
        const safeY = (H - safeH) / 2;
        safeZoneMarkup = `<rect x="44" y="${safeY}" width="${W - 88}" height="${safeH}" rx="16" fill="none" stroke="#10B981" stroke-width="4" stroke-dasharray="16 12" />`;
      } else if (format.layoutKind === 'story') {
        const topCut = H * 0.14;
        const botCut = H * 0.18;
        safeZoneMarkup = `
          <rect x="0" y="0" width="${W}" height="${topCut}" fill="#EF4444" fill-opacity="0.14" />
          <line x1="0" y1="${topCut}" x2="${W}" y2="${topCut}" stroke="#EF4444" stroke-width="4" stroke-dasharray="14 10" />
          <rect x="0" y="${H - botCut}" width="${W}" height="${botCut}" fill="#EF4444" fill-opacity="0.14" />
          <line x1="0" y1="${H - botCut}" x2="${W}" y2="${H - botCut}" stroke="#EF4444" stroke-width="4" stroke-dasharray="14 10" />
        `;
      } else {
        safeZoneMarkup = `<rect x="${W * 0.07}" y="${H * 0.07}" width="${W * 0.86}" height="${H * 0.86}" rx="18" fill="none" stroke="#10B981" stroke-width="4" stroke-dasharray="16 12" />`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by LogoStudio.si -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <style>@import url('${fontUrl}');</style>
    <filter id="cardShadow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  ${stageMarkup}

  ${
    showIndustry
      ? `<text x="${W / 2}" y="${topLabelY}" font-family="'${font}', sans-serif" font-size="${Math.round(
          W * 0.02
        )}" font-weight="700" fill="${topLabelColor}" letter-spacing="5px" text-anchor="middle">${industryUpper}</text>`
      : ''
  }

  <!-- Emblem Card -->
  <rect x="${emblemCardX}" y="${emblemCardY}" width="${emblemCardSize}" height="${emblemCardSize}" rx="${
      emblemCardSize * 0.24
    }" fill="#FFFFFF" filter="url(#cardShadow-${uid})" />
  <g transform="translate(${emblemCardX + (emblemCardSize - emblemSize) / 2}, ${
      emblemCardY + (emblemCardSize - emblemSize) / 2
    }) scale(${emblemSize / 200})">
    ${emblemInner}
  </g>

  <!-- Wordmark -->
  <text x="${W / 2}" y="${wordY}" font-family="'${font}', sans-serif" font-size="${fontSize}" text-anchor="middle" letter-spacing="${
      state.tracking
    }px">
    <tspan font-weight="${weights.w1}" fill="${word1Fill}">${escapeXml(w1Text)}</tspan><tspan font-weight="${
      weights.w2
    }" fill="${word2Fill}">${escapeXml(w2Text)}</tspan>${
      extText
        ? `<tspan font-weight="700" font-size="${Math.round(fontSize * 0.45)}" fill="${c3}">${escapeXml(
            extText
          )}</tspan>`
        : ''
    }
  </text>

  <!-- Accent Rule under Wordmark -->
  <line x1="${W * 0.28}" y1="${wordY + 26}" x2="${W * 0.72}" y2="${wordY + 26}" stroke="${c2}" stroke-width="4" stroke-linecap="round" />

  ${
    showTagline
      ? `<text x="${W / 2}" y="${wordY + 72}" font-family="'${font}', sans-serif" font-size="${Math.round(
          W * 0.024
        )}" font-weight="600" fill="${taglineFill}" letter-spacing="3.5px" text-anchor="middle">${taglineText}</text>`
      : ''
  }

  ${
    showDomain
      ? `<g transform="translate(${pillX}, ${pillY})">
          <rect width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${pillBg}" />
          <text x="${pillW / 2}" y="${pillH * 0.64}" font-family="'${font}', sans-serif" font-size="22" font-weight="700" fill="${pillText}" text-anchor="middle">${domainClean}</text>
        </g>`
      : ''
  }

  ${safeZoneMarkup}
</svg>`;
  }

  // 3. YOUTUBE CHANNEL BANNER (2560 x 1440 — TV Safe Area 1546 x 423 in center)
  if (format.layoutKind === 'youtube-tv') {
    const safeW = 1546;
    const safeH = 423;
    const safeX = (W - safeW) / 2;
    const safeY = (H - safeH) / 2;

    const cardSize = 230;
    const cardX = safeX + 90;
    const cardY = (H - cardSize) / 2;
    const emblemSize = cardSize * 0.78;
    const textX = cardX + cardSize + 95;
    const fontSize = 112;

    const safeZoneMarkup = includeSafeZones
      ? `<rect x="${safeX}" y="${safeY}" width="${safeW}" height="${safeH}" rx="12" fill="none" stroke="#10B981" stroke-width="5" stroke-dasharray="20 14" />`
      : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by LogoStudio.si -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <style>@import url('${fontUrl}');</style>
    <filter id="ytShadow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="#0F172A" flood-opacity="0.22"/>
    </filter>
  </defs>
  ${stageMarkup}

  <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="48" fill="#FFFFFF" filter="url(#ytShadow-${uid})" />
  <g transform="translate(${cardX + (cardSize - emblemSize) / 2}, ${
      cardY + (cardSize - emblemSize) / 2
    }) scale(${emblemSize / 200})">
    ${emblemInner}
  </g>

  ${
    showIndustry
      ? `<text x="${textX}" y="${H / 2 - 64}" font-family="'${font}', sans-serif" font-size="22" font-weight="700" fill="${industryFill}" letter-spacing="4.5px">${industryUpper}</text>`
      : ''
  }

  <text x="${textX}" y="${H / 2 + 34}" font-family="'${font}', sans-serif" font-size="${fontSize}" letter-spacing="${
      state.tracking
    }px">
    <tspan font-weight="${weights.w1}" fill="${word1Fill}">${escapeXml(w1Text)}</tspan><tspan font-weight="${
      weights.w2
    }" fill="${word2Fill}">${escapeXml(w2Text)}</tspan>
  </text>

  <line x1="${textX}" y1="${H / 2 + 62}" x2="${textX + 540}" y2="${H / 2 + 62}" stroke="${c2}" stroke-width="4" />

  ${
    showTagline
      ? `<text x="${textX}" y="${H / 2 + 104}" font-family="'${font}', sans-serif" font-size="24" font-weight="600" fill="${taglineFill}" letter-spacing="3px">${taglineText}</text>`
      : ''
  }

  ${
    showDomain
      ? `<g transform="translate(${safeX + safeW - 260}, ${safeY + 34})">
          <rect width="220" height="46" rx="23" fill="${pillBg}" />
          <text x="110" y="30" font-family="'${font}', sans-serif" font-size="20" font-weight="700" fill="${pillText}" text-anchor="middle">${domainClean}</text>
        </g>`
      : ''
  }

  ${safeZoneMarkup}
</svg>`;
  }

  // 4. WIDE BANNERS & OPEN GRAPH CARD (X, LinkedIn, Facebook, OG)
  const cardSize = Math.min(H * 0.56, W * 0.18);
  const cardX = W * 0.11;
  const cardY = (H - cardSize) / 2 - (format.id === 'x-header' || format.id.startsWith('linkedin') ? H * 0.04 : 0);
  const emblemSize = cardSize * 0.78;
  const textX = W * 0.39;
  const fontSize = Math.round(Math.min(H * 0.25, W * 0.072));
  const wordY = H * 0.57;

  let safeZoneMarkup = '';
  if (includeSafeZones) {
    if (format.id === 'x-header' || format.id === 'linkedin-profile-cover') {
      const avR = H * 0.34;
      safeZoneMarkup = `
        <circle cx="${W * 0.13}" cy="${H * 0.88}" r="${avR}" fill="#EF4444" fill-opacity="0.16" stroke="#EF4444" stroke-width="3" stroke-dasharray="12 8" />
      `;
    } else if (format.id === 'linkedin-company-cover') {
      safeZoneMarkup = `
        <rect x="${W * 0.05}" y="${H * 0.32}" width="${H * 0.65}" height="${H * 0.65}" rx="8" fill="#EF4444" fill-opacity="0.16" stroke="#EF4444" stroke-width="2.5" stroke-dasharray="10 6" />
      `;
    } else if (format.id === 'facebook-page-cover') {
      const mobileW = W * 0.74;
      const mobileX = (W - mobileW) / 2;
      safeZoneMarkup = `
        <rect x="${mobileX}" y="24" width="${mobileW}" height="${H - 48}" rx="12" fill="none" stroke="#10B981" stroke-width="4" stroke-dasharray="14 10" />
      `;
    } else {
      safeZoneMarkup = `
        <rect x="${W * 0.04}" y="${H * 0.07}" width="${W * 0.92}" height="${H * 0.86}" rx="14" fill="none" stroke="#10B981" stroke-width="3.5" stroke-dasharray="14 10" />
      `;
    }
  }

  const pillW = Math.max(150, domainClean.length * 14 + 42);
  const pillH = Math.max(30, Math.round(H * 0.085));
  const pillX = W - pillW - W * 0.045;
  const pillY = H * 0.09;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by LogoStudio.si -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <style>@import url('${fontUrl}');</style>
    <filter id="banShadow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  ${stageMarkup}

  <!-- Left Floating Emblem Card -->
  <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="${
    cardSize * 0.24
  }" fill="#FFFFFF" filter="url(#banShadow-${uid})" />
  <g transform="translate(${cardX + (cardSize - emblemSize) / 2}, ${
    cardY + (cardSize - emblemSize) / 2
  }) scale(${emblemSize / 200})">
    ${emblemInner}
  </g>

  ${
    showIndustry
      ? `<text x="${textX}" y="${wordY - fontSize * 0.92}" font-family="'${font}', sans-serif" font-size="${Math.max(
          11,
          Math.round(H * 0.036)
        )}" font-weight="700" fill="${industryFill}" letter-spacing="3.5px">${industryUpper.slice(0, 44)}</text>`
      : ''
  }

  <text x="${textX}" y="${wordY}" font-family="'${font}', sans-serif" font-size="${fontSize}" letter-spacing="${
    state.tracking
  }px">
    <tspan font-weight="${weights.w1}" fill="${word1Fill}">${escapeXml(w1Text)}</tspan><tspan font-weight="${
    weights.w2
  }" fill="${word2Fill}">${escapeXml(w2Text)}</tspan>
  </text>

  <line x1="${textX}" y1="${wordY + H * 0.048}" x2="${Math.min(
    W * 0.88,
    textX + fontSize * 4.4
  )}" y2="${wordY + H * 0.048}" stroke="${c2}" stroke-width="${Math.max(2, Math.round(H * 0.006))}" />

  ${
    showTagline
      ? `<text x="${textX}" y="${wordY + H * 0.13}" font-family="'${font}', sans-serif" font-size="${Math.max(
          12,
          Math.round(H * 0.042)
        )}" font-weight="600" fill="${taglineFill}" letter-spacing="2.5px">${taglineText}</text>`
      : ''
  }

  ${
    showDomain
      ? `<g transform="translate(${pillX}, ${pillY})">
          <rect width="${pillW}" height="${pillH}" rx="${pillH / 2}" fill="${pillBg}" />
          <text x="${pillW / 2}" y="${pillH * 0.66}" font-family="'${font}', sans-serif" font-size="${Math.max(
          11,
          Math.round(pillH * 0.44)
        )}" font-weight="700" fill="${pillText}" text-anchor="middle">${domainClean}</text>
        </g>`
      : ''
  }

  ${safeZoneMarkup}
</svg>`;
}

interface SocialMediaKitStageProps {
  state: LogoState;
}

export const SocialMediaKitStage: React.FC<SocialMediaKitStageProps> = ({ state }) => {
  const [artDirection, setArtDirection] = React.useState<SocialArtDirection>('editorial-split');
  const [showTagline, setShowTagline] = React.useState<boolean>(Boolean(state.showTagline));
  const [showDomain, setShowDomain] = React.useState<boolean>(true);
  const [showIndustry, setShowIndustry] = React.useState<boolean>(true);
  const [showSafeZones, setShowSafeZones] = React.useState<boolean>(true);
  const [selectedPlatform, setSelectedPlatform] = React.useState<SocialPlatform>('All');
  const [isExportingZip, setIsExportingZip] = React.useState<boolean>(false);
  const [exportProgress, setExportProgress] = React.useState<string>('');

  const platformCounts = React.useMemo(() => {
    const counts: Record<SocialPlatform, number> = {
      All: SOCIAL_FORMATS.length,
      Instagram: 0,
      X: 0,
      LinkedIn: 0,
      Facebook: 0,
      YouTube: 0,
      TikTok: 0,
      Pinterest: 0,
      Web: 0,
    };
    SOCIAL_FORMATS.forEach((f) => {
      f.platforms.forEach((p) => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return counts;
  }, []);

  const filteredFormats = React.useMemo(() => {
    if (selectedPlatform === 'All') return SOCIAL_FORMATS;
    return SOCIAL_FORMATS.filter((f) => f.platforms.includes(selectedPlatform));
  }, [selectedPlatform]);

  const feedFormats = filteredFormats.filter((f) => f.section === 'feed');
  const storyFormats = filteredFormats.filter((f) => f.section === 'stories');
  const coverFormats = filteredFormats.filter((f) => f.section === 'covers');

  const handleExportSingleSvg = (format: SocialFormatSpec) => {
    const cleanDom = (state.domain || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanSvg = buildSocialFormatSvg(state, format, {
      artDirection,
      showTagline,
      showDomain,
      showIndustry,
      includeSafeZones: false,
    });
    downloadSvgString(cleanSvg, `${cleanDom}-${format.id}-${format.width}x${format.height}.svg`);
  };

  const handleExportSinglePng = async (format: SocialFormatSpec) => {
    await ensureFontsLoaded(state.fontFamily);
    const cleanDom = (state.domain || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanSvg = buildSocialFormatSvg(state, format, {
      artDirection,
      showTagline,
      showDomain,
      showIndustry,
      includeSafeZones: false,
    });
    await downloadSvgStringAsPng(
      cleanSvg,
      format.width,
      format.height,
      `${cleanDom}-${format.id}-${format.width}x${format.height}.png`
    );
  };

  const handleDownloadFullSocialZip = async () => {
    try {
      setIsExportingZip(true);
      await ensureFontsLoaded(state.fontFamily);
      const zip = new JSZip();
      const cleanDom = (state.domain || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const root = zip.folder(`${cleanDom}-social-media-kit-12`) || zip;

      for (let i = 0; i < SOCIAL_FORMATS.length; i++) {
        const fmt = SOCIAL_FORMATS[i];
        setExportProgress(`Packing ${i + 1}/12 (${fmt.title})...`);
        const cleanSvg = buildSocialFormatSvg(state, fmt, {
          artDirection,
          showTagline,
          showDomain,
          showIndustry,
          includeSafeZones: false,
        });
        root.file(`${fmt.folder}/${fmt.id}-${fmt.width}x${fmt.height}.svg`, cleanSvg);
        const pngDataUrl = await renderSvgStringToPngDataUrl(cleanSvg, fmt.width, fmt.height);
        root.file(
          `${fmt.folder}/${fmt.id}-${fmt.width}x${fmt.height}.png`,
          pngDataUrl.split(',')[1],
          { base64: true }
        );
      }

      root.file(
        'README.txt',
        `Generated by LogoStudio.si — Social Media Kit (12 Formats · 8 Platforms)\nDomain: ${state.domain}\nArt Direction: ${artDirection}\nFolders: profile/, posts/, stories/, covers/, web/\n`
      );

      setExportProgress('Compressing ZIP...');
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${cleanDom}-social-media-kit-12.zip`;
      a.click();
    } finally {
      setIsExportingZip(false);
      setExportProgress('');
    }
  };

  // Sample format used for the 5 Art Direction thumbnail previews
  const previewSampleFormat = SOCIAL_FORMATS[11]; // 1200x630 OG card aspect ratio for the 5 Art Direction cards

  const renderFormatCard = (fmt: SocialFormatSpec) => {
    const previewSvg = buildSocialFormatSvg(state, fmt, {
      artDirection,
      showTagline,
      showDomain,
      showIndustry,
      includeSafeZones: showSafeZones,
    });

    return (
      <div
        key={fmt.id}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden text-slate-900"
      >
        {/* Top SVG Artwork Preview Area on Checkerboard Stage */}
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <div className="checkerboard-surface rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-2">
            <div
              className="w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[260px] [&>svg]:rounded-lg [&>svg]:shadow-sm"
              dangerouslySetInnerHTML={{ __html: previewSvg }}
            />
          </div>
        </div>

        {/* Bottom Metadata & Export Buttons */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{fmt.title}</h4>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">{fmt.ratioLabel}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {fmt.folder}/
              </span>
            </div>

            {/* Platform Pills */}
            <div className="flex flex-wrap gap-1">
              {fmt.platforms.map((plat) => (
                <span
                  key={plat}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                >
                  {plat}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{fmt.description}</p>
          </div>

          {/* Individual Export Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleExportSinglePng(fmt)}
              className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportSingleSvg(fmt)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>SVG</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1360px] mx-auto w-full bg-[#F8FAFC] text-slate-900 rounded-3xl border border-slate-200/80 shadow-2xl p-6 md:p-8 space-y-7">
      {/* 1. Header & Bulk Export */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-slate-200/80 text-slate-700">
            SOCIAL MEDIA KIT · 12 FORMATS · 8 PLATFORMS
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Export Social Media Kit for <span className="text-indigo-600">{state.domain}</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            Profile picture, feed posts, story, pin, covers for X, LinkedIn, Facebook and YouTube, and the link preview image — sized to each platform, drawn from your vector logo, with the platform safe zones respected.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadFullSocialZip}
          disabled={isExportingZip}
          className="px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-60 shrink-0"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>{isExportingZip ? exportProgress || 'Packing Kit...' : 'Download Full Kit (.ZIP · 12)'}</span>
        </button>
      </div>

      {/* 2. Art Direction Selector (5 Interactive Visual Cards) */}
      <div className="space-y-2.5">
        <div className="text-xs font-extrabold text-slate-800">Art Direction</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ART_DIRECTIONS.map((dir) => {
            const isSelected = artDirection === dir.id;
            const thumbSvg = buildSocialFormatSvg(state, previewSampleFormat, {
              artDirection: dir.id,
              showTagline: false,
              showDomain: true,
              showIndustry: true,
              includeSafeZones: false,
            });

            return (
              <button
                key={dir.id}
                type="button"
                onClick={() => setArtDirection(dir.id)}
                className={`text-left rounded-2xl p-2.5 border-2 transition cursor-pointer flex flex-col justify-between bg-white ${
                  isSelected
                    ? 'border-[#0F172A] shadow-md ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="rounded-xl overflow-hidden border border-slate-200/80 mb-2.5 bg-slate-100">
                  <div
                    className="w-full [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
                    dangerouslySetInnerHTML={{ __html: thumbSvg }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900">{dir.title}</span>
                    {dir.isDefault && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{dir.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Artwork Controls Bar & Platform Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 mr-1">Show on artwork:</span>

            <button
              type="button"
              onClick={() => setShowTagline((p) => !p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                showTagline
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Tagline</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDomain((p) => !p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                showDomain
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domain</span>
            </button>

            <button
              type="button"
              onClick={() => setShowIndustry((p) => !p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                showIndustry
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Industry label</span>
            </button>

            {!state.showTagline && !showTagline && (
              <span className="text-xs font-semibold text-amber-600 ml-1">
                No tagline is enabled for exports yet.
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showSafeZones}
              onChange={(e) => setShowSafeZones(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>
              Show platform safe zones <span className="text-slate-400 font-normal">(preview only)</span>
            </span>
          </label>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            ['All', 'Instagram', 'X', 'LinkedIn', 'Facebook', 'YouTube', 'TikTok', 'Pinterest', 'Web'] as SocialPlatform[]
          ).map((plat) => {
            const active = selectedPlatform === plat;
            return (
              <button
                key={plat}
                type="button"
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{plat}</span>
                <span className={active ? 'text-slate-300 font-mono' : 'text-slate-400 font-mono'}>
                  {platformCounts[plat]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Safe Zones Legend */}
        {showSafeZones && (
          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-xs border-2 border-dashed border-emerald-500 inline-block" />
              <span>Keep content inside</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-xs border-2 border-dashed border-rose-500 bg-rose-500/15 inline-block" />
              <span>Covered by the platform (profile photo, app controls)</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Section 1: Profile Picture & Feed Posts (4) */}
      {feedFormats.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Profile Picture &amp; Feed Posts <span className="text-slate-400 font-normal">({feedFormats.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {feedFormats.map(renderFormatCard)}
          </div>
        </div>
      )}

      {/* 5. Section 2: Stories, Reels & Pins (2) */}
      {storyFormats.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Stories, Reels &amp; Pins <span className="text-slate-400 font-normal">({storyFormats.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storyFormats.map(renderFormatCard)}
          </div>
        </div>
      )}

      {/* 6. Section 3: Covers, Banners & Link Preview (6) */}
      {coverFormats.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">
            Covers, Banners &amp; Link Preview <span className="text-slate-400 font-normal">({coverFormats.length})</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {coverFormats.map(renderFormatCard)}
          </div>
        </div>
      )}
    </div>
  );
};
