import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';
import { LogoState, LogoVariant, TypoContrastStyle, ConstructionSpec } from '../types/logo';
import { computeLockupLayout } from './lockupLayout';
import { renderConstruction } from './constructionEngine';

type LucideIconComp = React.ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  className?: string;
}>;

const iconMap: Record<string, LucideIconComp> = (LucideIcons as unknown as { icons?: Record<string, LucideIconComp> }).icons || (LucideIcons as unknown as Record<string, LucideIconComp>);

export function resolveLucideIcon(iconName: string): LucideIconComp {
  if (!iconName) return LucideIcons.Sparkles;
  if (iconMap[iconName]) return iconMap[iconName];

  // Convert kebab-case to PascalCase
  const pascal = iconName
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  if (iconMap[pascal]) return iconMap[pascal];

  const cleanName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases: Record<string, string> = {
    candlestickchart: 'ChartCandlestick',
    barchart3: 'ChartBar',
    barchart2: 'ChartColumn',
    piechart: 'ChartPie',
    linechart: 'ChartLine',
    penline: 'Pen',
    wand2: 'Wand',
    home: 'House',
    house: 'House',
    code2: 'CodeXml',
    code: 'Code',
    palmtree: 'TreePalm',
    treepalm: 'TreePalm',
    sliders: 'SlidersHorizontal',
    slidershorizontal: 'SlidersHorizontal',
    checkcircle2: 'CheckCircle2',
    qrcode: 'QrCode',
    cpu: 'Cpu',
    target: 'Target',
    bot: 'Bot',
    wrench: 'Wrench',
    terminal: 'Terminal',
    shoppingcart: 'ShoppingCart',
    shoppingbag: 'ShoppingBag',
    briefcase: 'Briefcase',
    graduationcap: 'GraduationCap',
    chefhat: 'ChefHat',
    carfront: 'CarFront',
    pawprint: 'PawPrint',
    sparkles: 'Sparkles'
  };

  if (aliases[cleanName] && iconMap[aliases[cleanName]]) {
    return iconMap[aliases[cleanName]];
  }

  for (const [key, comp] of Object.entries(iconMap)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanName) {
      return comp;
    }
  }

  return LucideIcons.Sparkles;
}

export function extractSvgInnerFromLucide(iconName: string, strokeColor = '#FFFFFF', strokeWidth = 2.2): string {
  try {
    const Comp = resolveLucideIcon(iconName);
    const html = renderToStaticMarkup(
      React.createElement(Comp, {
        size: 24,
        strokeWidth,
        color: strokeColor,
      })
    );
    // Strip outer <svg> and </svg> wrapper to get pure child elements
    const match = html.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    return match ? match[1] : '';
  } catch {
    return `<path d="M12 2v20M2 12h20" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  }
}

export function buildEmblemInnerMarkup(config: {
  containerStyle: string;
  construction?: ConstructionSpec;
  activeIcon: string;
  customSvgPath?: string;
  primary: string;
  secondary: string;
  accent: string;
  fontFamily: string;
  word1: string;
  iconStrokeWidth?: number;
  iconRotation?: number;
  iconFlipH?: boolean;
  iconFlipV?: boolean;
}): string {
  const c1 = config.primary;
  const c2 = config.secondary;
  const c3 = config.accent;
  const strokeW = config.iconStrokeWidth || 2.2;
  const initChar = (config.word1 ? config.word1[0] : 'A').toUpperCase();

  const rot = config.iconRotation || 0;
  const scaleX = config.iconFlipH ? -1 : 1;
  const scaleY = config.iconFlipV ? -1 : 1;

  // Render icon inside targetSize box scaled and translated
  const renderIcon = (x: number, y: number, targetSize: number, color = '#FFFFFF') => {
    if (config.customSvgPath) {
      const scale = targetSize / 100;
      return `
        <g transform="translate(${x + targetSize / 2}, ${y + targetSize / 2}) rotate(${rot}) scale(${scaleX}, ${scaleY}) translate(${-targetSize / 2}, ${-targetSize / 2})">
          <g transform="scale(${scale})">
            <path d="${config.customSvgPath}" fill="${color}" fill-rule="evenodd" clip-rule="evenodd" />
          </g>
        </g>
      `;
    }

    const iconInner = extractSvgInnerFromLucide(config.activeIcon, color, strokeW);
    const scale = targetSize / 24;
    return `
      <g transform="translate(${x + targetSize / 2}, ${y + targetSize / 2}) rotate(${rot}) scale(${scaleX}, ${scaleY}) translate(${-targetSize / 2}, ${-targetSize / 2})">
        <g transform="scale(${scale})" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
          ${iconInner}
        </g>
      </g>
    `;
  };

  if (config.construction) {
    return renderConstruction(config.construction, {
      c1,
      c2,
      c3,
      initChar,
      fontFamily: config.fontFamily,
      renderIcon,
    });
  }

  let inner = '';

  switch (config.containerStyle) {
    case 'cutoutCorner':
      inner = `
        <rect x="20" y="24" width="146" height="150" rx="38" fill="${c1}"/>
        <path d="M20 64 C20 42 38 24 60 24 H124 C146 24 166 42 166 64 V92 H20 Z" fill="${c2}" opacity="0.25"/>
        <circle cx="150" cy="50" r="34" fill="#FFFFFF"/>
        <circle cx="150" cy="50" r="24" fill="${c2}"/>
        <circle cx="150" cy="50" r="8" fill="#FFFFFF"/>
        ${renderIcon(44, 62, 86, '#FFFFFF')}
      `;
      break;

    case 'monogramSeal':
      inner = `
        <rect x="18" y="22" width="164" height="156" rx="40" fill="${c1}"/>
        <path d="M104 22 H142 C164 22 182 40 182 62 V138 C182 160 164 178 142 178 H104 Z" fill="${c2}"/>
        <text x="60" y="132" font-family="'${config.fontFamily}', sans-serif" font-weight="800" font-size="88" fill="#FFFFFF" text-anchor="middle">${initChar}</text>
        ${renderIcon(114, 68, 60, '#FFFFFF')}
        <circle cx="104" cy="50" r="8" fill="${c3}"/>
      `;
      break;

    case 'isoHexCube':
      inner = `
        <polygon points="100,12 178,56 178,144 100,188 22,144 22,56" fill="${c1}"/>
        <polygon points="100,12 178,56 100,100 22,56" fill="${c2}"/>
        <polygon points="100,100 178,56 178,144 100,188" fill="${c2}" opacity="0.38"/>
        <circle cx="100" cy="104" r="54" fill="${c1}" stroke="#FFFFFF" stroke-width="5"/>
        ${renderIcon(62, 66, 76, '#FFFFFF')}
        <circle cx="100" cy="36" r="7" fill="${c3}"/>
      `;
      break;

    case 'bauhausGrid':
      inner = `
        <rect x="20" y="20" width="76" height="76" rx="20" fill="${c2}"/>
        <path d="M104 20 H140 C162 20 180 38 180 60 V96 H104 Z" fill="${c3}"/>
        <rect x="20" y="104" width="160" height="76" rx="24" fill="${c1}"/>
        <circle cx="58" cy="58" r="16" fill="#FFFFFF"/>
        ${renderIcon(64, 106, 72, '#FFFFFF')}
      `;
      break;

    case 'offsetNeo':
      inner = `
        <rect x="34" y="34" width="146" height="146" rx="36" fill="${c2}"/>
        <rect x="20" y="20" width="146" height="146" rx="36" fill="${c1}" stroke="#FFFFFF" stroke-width="5"/>
        <circle cx="138" cy="48" r="10" fill="${c3}"/>
        ${renderIcon(47, 47, 92, '#FFFFFF')}
      `;
      break;

    case 'swissSeal':
      inner = `
        <circle cx="100" cy="100" r="84" fill="none" stroke="${c1}" stroke-width="6"/>
        <path d="M100 16 A84 84 0 0 1 184 100" fill="none" stroke="${c2}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="100" cy="100" r="64" fill="${c1}"/>
        <circle cx="164" cy="42" r="11" fill="${c3}" stroke="#FFFFFF" stroke-width="4"/>
        ${renderIcon(58, 58, 84, '#FFFFFF')}
      `;
      break;

    case 'slashCapsule':
      inner = `
        <rect x="22" y="22" width="156" height="156" rx="44" fill="${c1}"/>
        <path d="M22 66 C22 42 42 22 66 22 H134 C158 22 178 42 178 66 V76 L22 124 Z" fill="${c2}"/>
        <circle cx="148" cy="148" r="10" fill="${c3}"/>
        ${renderIcon(54, 54, 92, '#FFFFFF')}
      `;
      break;

    case 'shieldCrest':
      inner = `
        <path d="M100 14 L172 42 V102 C172 148 140 176 100 188 C60 176 28 148 28 102 V42 L100 14 Z" fill="${c1}"/>
        <path d="M100 26 L158 49 V100 C158 138 132 160 100 172 V26 Z" fill="${c2}" opacity="0.82"/>
        <circle cx="100" cy="44" r="8" fill="${c3}"/>
        ${renderIcon(56, 58, 88, '#FFFFFF')}
      `;
      break;

    case 'vennPortal':
      inner = `
        <circle cx="78" cy="104" r="62" fill="${c2}" opacity="0.88"/>
        <circle cx="114" cy="96" r="64" fill="${c1}"/>
        <circle cx="52" cy="54" r="12" fill="${c3}"/>
        ${renderIcon(72, 54, 84, '#FFFFFF')}
      `;
      break;

    case 'squircle':
      inner = `
        <rect x="20" y="20" width="160" height="160" rx="48" fill="${c1}"/>
        <rect x="25" y="25" width="150" height="150" rx="44" fill="none" stroke="${c2}" stroke-width="4" opacity="0.6"/>
        <circle cx="152" cy="48" r="8" fill="${c3}"/>
        ${renderIcon(46, 46, 108, '#FFFFFF')}
      `;
      break;

    case 'pureIcon':
      inner = `
        <circle cx="100" cy="100" r="88" fill="${c2}" opacity="0.08"/>
        ${renderIcon(25, 25, 150, c1)}
      `;
      break;

    case 'minimalistSpark':
    default:
      inner = `
        <rect x="26" y="26" width="148" height="148" rx="38" fill="${c2}" opacity="0.12"/>
        <circle cx="156" cy="44" r="16" fill="${c3}"/>
        <circle cx="44" cy="156" r="10" fill="${c2}"/>
        ${renderIcon(34, 34, 132, c1)}
      `;
      break;
  }

  return inner;
}

export function buildEmblemSvgMarkup(
  config: {
    containerStyle: string;
    construction?: ConstructionSpec;
    activeIcon: string;
    customSvgPath?: string;
    primary: string;
    secondary: string;
    accent: string;
    fontFamily: string;
    word1: string;
    iconStrokeWidth?: number;
    iconRotation?: number;
    iconFlipH?: boolean;
    iconFlipV?: boolean;
  },
  size = 200
): string {
  const inner = buildEmblemInnerMarkup(config);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}">${inner}</svg>`;
}

export function getTypographicWeights(style: TypoContrastStyle) {
  switch (style) {
    case 'heavy-light':
      return { w1: '800', w2: '300', isUpper: false };
    case 'light-heavy':
      return { w1: '300', w2: '800', isUpper: false };
    case 'upper-tracked':
      return { w1: '800', w2: '600', isUpper: true };
    case 'mono-tech':
      return { w1: '700', w2: '400', isUpper: false, forceMono: true };
    case 'serif-editorial':
      return { w1: '700', w2: '400', isUpper: false, forceSerif: true };
    case 'dot-badge':
      return { w1: '800', w2: '700', isUpper: false };
    case 'bold-bold':
    default:
      return { w1: '800', w2: '700', isUpper: false };
  }
}

export function formatWordText(text: string, letterCase: string, defaultUpper = false): string {
  if (!text) return '';
  if (defaultUpper || letterCase === 'uppercase') return text.toUpperCase();
  if (letterCase === 'lowercase') return text.toLowerCase();
  if (letterCase === 'capitalize') return text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

export function generateFullLogoSvg(
  state: LogoState | LogoVariant,
  options: {
    width: number;
    height: number;
    background?: 'transparent' | 'white' | 'dark' | 'brand';
    paddingRatio?: number;
  }
): string {
  const { width, height, background = 'white' } = options;
  const isSquare = Math.abs(width - height) < 20;

  // Use the single source of truth layout engine
  const layout = computeLockupLayout(null, state, width, height, isSquare);

  let bgFill = '#FFFFFF';
  let primaryColor = state.primary;
  let secondaryColor = state.secondary;

  if (background === 'transparent') {
    bgFill = 'none';
  } else if (background === 'dark') {
    bgFill = '#07090E';
    primaryColor = '#F8FAFC';
    secondaryColor = state.accent || '#38BDF8';
  } else if (background === 'brand') {
    bgFill = state.primary;
    primaryColor = '#FFFFFF';
    secondaryColor = state.accent || '#FACC15';
  }

  const emblemSvgInner = buildEmblemInnerMarkup({
    containerStyle: state.containerStyle,
    construction: state.construction,
    activeIcon: state.activeIcon,
    customSvgPath: (state as LogoState).customSvgPath || (state as LogoVariant).customSvgPath,
    primary: state.primary,
    secondary: state.secondary,
    accent: state.accent,
    fontFamily: layout.fontFamily,
    word1: state.word1,
    iconStrokeWidth: (state as LogoState).iconStrokeWidth || 2.2,
    iconRotation: (state as LogoState).iconRotation || 0,
    iconFlipH: (state as LogoState).iconFlipH || false,
    iconFlipV: (state as LogoState).iconFlipV || false,
  });

  // Emblem mark
  const emblemMarkup = `
    <g id="atomlogo-emblem" transform="translate(${layout.emblem.x}, ${layout.emblem.y})">
      <g transform="scale(${layout.emblem.size / 200})">
        ${emblemSvgInner}
      </g>
    </g>
  `;

  // Wordmark
  const w1Markup = `
    <text x="${layout.w1.x}" y="${layout.w1.y}" font-family="'${layout.fontFamily}', sans-serif" font-size="${layout.w1.fontSize}" font-weight="${layout.w1.fontWeight}" fill="${primaryColor}" letter-spacing="${layout.tracking}px">
      ${layout.w1.text}
    </text>
  `;

  const w2Markup = layout.w2
    ? `
    <text x="${layout.w2.x}" y="${layout.w2.y}" font-family="'${layout.fontFamily}', sans-serif" font-size="${layout.w2.fontSize}" font-weight="${layout.w2.fontWeight}" fill="${secondaryColor}" letter-spacing="${layout.tracking}px">
      ${layout.w2.text}
    </text>
  `
    : '';

  // Dot badge
  const dotBadgeMarkup = layout.dotBadge
    ? `
    <circle cx="${layout.dotBadge.cx}" cy="${layout.dotBadge.cy}" r="${layout.dotBadge.radius}" fill="${layout.dotBadge.color}" />
  `
    : '';

  // Extension pill
  const extMarkup = layout.extPill
    ? `
    <g id="atomlogo-ext-pill">
      <rect x="${layout.extPill.x}" y="${layout.extPill.y}" width="${layout.extPill.width}" height="${layout.extPill.height}" rx="${layout.extPill.radius}" fill="${layout.extPill.color}" />
      <text x="${layout.extPill.textX}" y="${layout.extPill.textY}" font-family="'${layout.fontFamily}', sans-serif" font-weight="700" font-size="${layout.extPill.fontSize}" fill="${layout.extPill.textColor}">
        ${layout.extPill.text}
      </text>
    </g>
  `
    : '';

  // Tagline
  const taglineMarkup = layout.tagline
    ? `
    <text x="${layout.tagline.x}" y="${layout.tagline.y}" font-family="'${layout.fontFamily}', sans-serif" font-weight="600" font-size="${layout.tagline.fontSize}" letter-spacing="${layout.tagline.tracking}px" fill="${layout.tagline.color}">
      ${layout.tagline.text}
    </text>
  `
    : '';

  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(layout.fontFamily)}:wght@300;400;600;700;800&amp;display=swap`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('${fontUrl}');
      text {
        font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        -webkit-font-smoothing: antialiased;
      }
    </style>
  </defs>
  ${bgFill !== 'none' ? `<rect width="${width}" height="${height}" fill="${bgFill}" />` : ''}
  ${emblemMarkup}
  ${w1Markup}
  ${w2Markup}
  ${dotBadgeMarkup}
  ${extMarkup}
  ${taglineMarkup}
</svg>`;
}
