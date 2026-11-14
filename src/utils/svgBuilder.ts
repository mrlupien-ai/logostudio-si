import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';
import {
  LogoState,
  LogoVariant,
  TypoContrastStyle,
  ConstructionSpec,
  EmblemFusionMode,
  MotionPreset,
} from '../types/logo';
import { computeLockupLayout } from './lockupLayout';
import {
  computeConstructionGeometry,
  ensureIconContrast,
  hashDomain,
  renderConstruction,
} from './constructionEngine';
import { fetchEmbeddedFontCss } from './fontLoader';

type LucideIconComp = React.ComponentType<{
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  className?: string;
}>;

const iconMap: Record<string, LucideIconComp> =
  (LucideIcons as unknown as { icons?: Record<string, LucideIconComp> }).icons ||
  (LucideIcons as unknown as Record<string, LucideIconComp>);

export function resolveLucideIcon(iconName: string): LucideIconComp {
  if (!iconName) return LucideIcons.Sparkles;
  if (iconMap[iconName]) return iconMap[iconName];

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
    sparkles: 'Sparkles',
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

export function extractSvgInnerFromLucide(
  iconName: string,
  strokeColor = '#FFFFFF',
  strokeWidth = 2.2
): string {
  try {
    const Comp = resolveLucideIcon(iconName);
    const html = renderToStaticMarkup(
      React.createElement(Comp, {
        size: 24,
        strokeWidth,
        color: strokeColor,
      })
    );
    const match = html.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    return match ? match[1] : '';
  } catch {
    return `<path d="M12 2v20M2 12h20" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  }
}

export interface EmblemMarkupConfig {
  containerStyle: string;
  construction?: ConstructionSpec;
  activeIcon: string;
  secondaryIcon?: string;
  emblemFusion?: EmblemFusionMode;
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
  markOnly?: boolean;
  markColor?: string;
  // Independent Fundal (Background) & Icon Layer Controls
  showEmblemBg?: boolean;
  showEmblemIcon?: boolean;
  emblemBgColor?: string;
  emblemBgAccentColor?: string;
  emblemIconColor?: string;
  emblemBgScale?: number;
  emblemBgOffsetX?: number;
  emblemBgOffsetY?: number;
  emblemIconScale?: number;
  emblemIconOffsetX?: number;
  emblemIconOffsetY?: number;
  surfaceBgHex?: string;
}

export function emblemConfigFromState(
  state: LogoState | LogoVariant,
  overrides: Partial<EmblemMarkupConfig> = {}
): EmblemMarkupConfig {
  const s = state as LogoState;
  const v = state as LogoVariant;
  return {
    containerStyle: state.containerStyle,
    construction: state.construction,
    activeIcon: state.activeIcon,
    secondaryIcon: s.secondaryIcon || v.secondaryIcon,
    emblemFusion: s.emblemFusion || v.emblemFusion,
    customSvgPath: s.customSvgPath || v.customSvgPath,
    primary: state.primary,
    secondary: state.secondary,
    accent: state.accent,
    fontFamily: state.fontFamily,
    word1: state.word1,
    iconStrokeWidth: s.iconStrokeWidth || 2.2,
    iconRotation: s.iconRotation || 0,
    iconFlipH: s.iconFlipH || false,
    iconFlipV: s.iconFlipV || false,
    showEmblemBg: s.showEmblemBg ?? v.showEmblemBg,
    showEmblemIcon: s.showEmblemIcon ?? v.showEmblemIcon,
    emblemBgColor: s.emblemBgColor ?? v.emblemBgColor,
    emblemBgAccentColor: s.emblemBgAccentColor ?? v.emblemBgAccentColor,
    emblemIconColor: s.emblemIconColor ?? v.emblemIconColor,
    emblemBgScale: s.emblemBgScale ?? v.emblemBgScale,
    emblemBgOffsetX: s.emblemBgOffsetX ?? v.emblemBgOffsetX,
    emblemBgOffsetY: s.emblemBgOffsetY ?? v.emblemBgOffsetY,
    emblemIconScale: s.emblemIconScale ?? v.emblemIconScale,
    emblemIconOffsetX: s.emblemIconOffsetX ?? v.emblemIconOffsetX,
    emblemIconOffsetY: s.emblemIconOffsetY ?? v.emblemIconOffsetY,
    ...overrides,
  };
}

export function computeEmblemBleed(config: EmblemMarkupConfig): number {
  const showBg = config.showEmblemBg !== false;
  const showIcon = config.showEmblemIcon !== false;
  const bgScale = Number.isFinite(config.emblemBgScale) ? config.emblemBgScale! : 1;
  const bgOx = Number.isFinite(config.emblemBgOffsetX) ? Math.abs(config.emblemBgOffsetX!) : 0;
  const bgOy = Number.isFinite(config.emblemBgOffsetY) ? Math.abs(config.emblemBgOffsetY!) : 0;
  const icScale = Number.isFinite(config.emblemIconScale) ? config.emblemIconScale! : 1;
  const icOx = Number.isFinite(config.emblemIconOffsetX) ? Math.abs(config.emblemIconOffsetX!) : 0;
  const icOy = Number.isFinite(config.emblemIconOffsetY) ? Math.abs(config.emblemIconOffsetY!) : 0;

  if (
    bgScale <= 1.02 &&
    icScale <= 1.05 &&
    bgOx <= 2 &&
    bgOy <= 2 &&
    icOx <= 8 &&
    icOy <= 8
  ) {
    return 0;
  }

  const bgExtent = showBg ? Math.max(0, 96 * bgScale - 96) + Math.max(bgOx, bgOy) : 0;
  const icExtent = showIcon ? Math.max(0, 74 * icScale - 90) + Math.max(icOx, icOy) : 0;
  return Math.max(0, Math.ceil(Math.max(bgExtent, icExtent) + 8));
}

export function buildEmblemInnerMarkup(config: EmblemMarkupConfig): string {
  const c1 = config.primary;
  const c2 = config.secondary;
  const c3 = config.accent;
  const strokeW = config.iconStrokeWidth || 2.2;
  const initChar = (config.word1 ? config.word1[0] : 'A').toUpperCase();
  const fusion: EmblemFusionMode = config.emblemFusion || 'single';

  const showBg = config.showEmblemBg !== false;
  const showIcon = config.showEmblemIcon !== false;
  const bgC1 = config.emblemBgColor || c1;
  const bgC2 = config.emblemBgAccentColor || c2;
  const bgScale = Number.isFinite(config.emblemBgScale)
    ? Math.max(0.4, Math.min(1.6, config.emblemBgScale!))
    : 1;
  const bgOx = Number.isFinite(config.emblemBgOffsetX)
    ? Math.max(-50, Math.min(50, config.emblemBgOffsetX!))
    : 0;
  const bgOy = Number.isFinite(config.emblemBgOffsetY)
    ? Math.max(-50, Math.min(50, config.emblemBgOffsetY!))
    : 0;
  const iconScaleVal = Number.isFinite(config.emblemIconScale)
    ? Math.max(0.35, Math.min(1.75, config.emblemIconScale!))
    : 1;
  const iconOx = Number.isFinite(config.emblemIconOffsetX)
    ? Math.max(-50, Math.min(50, config.emblemIconOffsetX!))
    : 0;
  const iconOy = Number.isFinite(config.emblemIconOffsetY)
    ? Math.max(-50, Math.min(50, config.emblemIconOffsetY!))
    : 0;

  const hasLayerOverrides =
    !showBg ||
    !showIcon ||
    Boolean(config.emblemBgColor || config.emblemBgAccentColor || config.emblemIconColor) ||
    bgScale !== 1 ||
    bgOx !== 0 ||
    bgOy !== 0 ||
    iconScaleVal !== 1 ||
    iconOx !== 0 ||
    iconOy !== 0;

  if (!showBg && !showIcon && !config.markOnly) {
    return '';
  }

  const wrapBg = (markup: string): string => {
    if (!showBg || !markup) return '';
    if (bgScale === 1 && bgOx === 0 && bgOy === 0) return markup;
    return `<g transform="translate(${100 + bgOx}, ${100 + bgOy}) scale(${bgScale}) translate(-100, -100)">${markup}</g>`;
  };

  const wrapIcon = (markup: string, cx: number, cy: number): string => {
    if (!showIcon || !markup) return '';
    if (iconScaleVal === 1 && iconOx === 0 && iconOy === 0) return markup;
    return `<g transform="translate(${cx + iconOx}, ${cy + iconOy}) scale(${iconScaleVal}) translate(${-cx}, ${-cy})">${markup}</g>`;
  };

  const rot = config.iconRotation || 0;
  const scaleX = config.iconFlipH ? -1 : 1;
  const scaleY = config.iconFlipV ? -1 : 1;

  const renderSpecificIcon = (
    iconName: string,
    x: number,
    y: number,
    targetSize: number,
    color = '#FFFFFF',
    allowCustom = true
  ) => {
    if (allowCustom && config.customSvgPath) {
      const scale = targetSize / 100;
      return `
        <g transform="translate(${x + targetSize / 2}, ${y + targetSize / 2}) rotate(${rot}) scale(${scaleX}, ${scaleY}) translate(${-targetSize / 2}, ${-targetSize / 2})">
          <g transform="scale(${scale})">
            <path d="${config.customSvgPath}" fill="${color}" fill-rule="evenodd" clip-rule="evenodd" />
          </g>
        </g>
      `;
    }

    const iconInner = extractSvgInnerFromLucide(iconName, color, strokeW);
    const scale = targetSize / 24;
    return `
      <g transform="translate(${x + targetSize / 2}, ${y + targetSize / 2}) rotate(${rot}) scale(${scaleX}, ${scaleY}) translate(${-targetSize / 2}, ${-targetSize / 2})">
        <g transform="scale(${scale})" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" stroke-linejoin="round">
          ${iconInner}
        </g>
      </g>
    `;
  };

  const renderIcon = (x: number, y: number, targetSize: number, color = '#FFFFFF') =>
    renderSpecificIcon(config.activeIcon, x, y, targetSize, color, true);

  // Defect 14 fix: when rendering inside an external squircle container (App Icon view),
  // markOnly renders the inner geometric symbol + accent without a second outer box container.
  if (config.markOnly) {
    if (!showBg && !showIcon) return '';
    const fg = config.emblemIconColor || config.markColor || '#FFFFFF';
    if (fusion === 'monogram-negative') {
      const bgPart = wrapBg(`
        <text x="64" y="138" font-family="'${config.fontFamily}', sans-serif" font-weight="900" font-size="112" fill="${bgC2}" opacity="0.38" text-anchor="middle">${initChar}</text>
        <circle cx="124" cy="102" r="48" fill="${bgC1}" stroke="${bgC2}" stroke-width="3.5"/>
        <circle cx="158" cy="52" r="9" fill="${c3}"/>
      `);
      const icPart = showBg
        ? wrapIcon(renderIcon(86, 64, 76, fg), 124, 102)
        : wrapIcon(renderIcon(40, 40, 120, fg), 100, 100);
      return `${bgPart}${icPart}`;
    }
    if (fusion === 'dual-badge') {
      const secIcon = config.secondaryIcon || 'Sparkles';
      const primaryIc = wrapIcon(renderIcon(28, 28, 114, fg), 85, 85);
      const badgeBg = wrapBg(`
        <rect x="114" y="114" width="66" height="66" rx="20" fill="${bgC2}" stroke="${bgC1}" stroke-width="4"/>
        <circle cx="172" cy="118" r="7" fill="${c3}"/>
      `);
      const badgeIc = showIcon ? renderSpecificIcon(secIcon, 127, 127, 40, '#FFFFFF', false) : '';
      return `${primaryIc}${badgeBg}${badgeIc}`;
    }
    const accentDot = wrapBg(`<circle cx="156" cy="46" r="10" fill="${c3}"/>`);
    const iconMark = wrapIcon(renderIcon(40, 40, 120, fg), 100, 100);
    return `${accentDot}${iconMark}`;
  }

  // Compound Emblem Fusion Mode 2: Monogram + Negative-Space Symbol
  if (fusion === 'monogram-negative') {
    const geom = config.construction
      ? computeConstructionGeometry(config.construction)
      : { mainBox: { x: 18, y: 20, w: 164, h: 160 } };
    const mb = geom.mainBox;
    const rx = Number(config.construction?.params?.radius ?? 38);
    const bgPart = wrapBg(`
      <rect x="${mb.x}" y="${mb.y}" width="${mb.w}" height="${mb.h}" rx="${rx}" fill="${bgC1}"/>
      <rect x="${mb.x}" y="${mb.y}" width="${Math.round(mb.w * 0.52)}" height="${mb.h}" rx="${rx}" fill="${bgC2}" opacity="0.24"/>
      <text x="${mb.x + Math.round(mb.w * 0.31)}" y="${mb.y + Math.round(mb.h * 0.72)}" font-family="'${config.fontFamily}', sans-serif" font-weight="900" font-size="104" fill="#FFFFFF" opacity="0.92" text-anchor="middle">${initChar}</text>
      <circle cx="${mb.x + Math.round(mb.w * 0.68)}" cy="${mb.y + Math.round(mb.h * 0.52)}" r="44" fill="${bgC1}" stroke="${bgC2}" stroke-width="4"/>
      <circle cx="${mb.x + Math.round(mb.w * 0.86)}" cy="${mb.y + Math.round(mb.h * 0.22)}" r="8" fill="${c3}"/>
    `);
    const monoIconColor =
      config.emblemIconColor ||
      (showBg ? '#FFFFFF' : ensureIconContrast(c1, config.surfaceBgHex || '#FFFFFF', c1));
    const icX = showBg ? mb.x + Math.round(mb.w * 0.68) - 34 : 36;
    const icY = showBg ? mb.y + Math.round(mb.h * 0.52) - 34 : 36;
    const icSize = showBg ? 68 : 128;
    const icPart = wrapIcon(
      renderIcon(icX, icY, icSize, monoIconColor),
      icX + icSize / 2,
      icY + icSize / 2
    );
    return `${bgPart}${icPart}`;
  }

  let baseInner = '';

  if (config.construction) {
    baseInner = renderConstruction(config.construction, {
      c1,
      c2,
      c3,
      initChar,
      fontFamily: config.fontFamily,
      renderIcon,
      showBg,
      showIcon,
      bgColor: config.emblemBgColor,
      bgAccentColor: config.emblemBgAccentColor,
      iconColorOverride: config.emblemIconColor,
      bgScale,
      bgOffsetX: bgOx,
      bgOffsetY: bgOy,
      iconScale: iconScaleVal,
      iconOffsetX: iconOx,
      iconOffsetY: iconOy,
      surfaceBgHex: config.surfaceBgHex,
    });
  } else if (!hasLayerOverrides) {
    switch (config.containerStyle) {
      case 'cutoutCorner':
        baseInner = `
        <rect x="20" y="24" width="146" height="150" rx="38" fill="${c1}"/>
        <path d="M20 64 C20 42 38 24 60 24 H124 C146 24 166 42 166 64 V92 H20 Z" fill="${c2}" opacity="0.25"/>
        <circle cx="150" cy="50" r="34" fill="#FFFFFF"/>
        <circle cx="150" cy="50" r="24" fill="${c2}"/>
        <circle cx="150" cy="50" r="8" fill="#FFFFFF"/>
        ${renderIcon(44, 62, 86, '#FFFFFF')}
      `;
        break;

      case 'monogramSeal':
        baseInner = `
        <rect x="18" y="22" width="164" height="156" rx="40" fill="${c1}"/>
        <path d="M104 22 H142 C164 22 182 40 182 62 V138 C182 160 164 178 142 178 H104 Z" fill="${c2}"/>
        <text x="60" y="132" font-family="'${config.fontFamily}', sans-serif" font-weight="800" font-size="88" fill="#FFFFFF" text-anchor="middle">${initChar}</text>
        ${renderIcon(114, 68, 60, '#FFFFFF')}
        <circle cx="104" cy="50" r="8" fill="${c3}"/>
      `;
        break;

      case 'isoHexCube':
        baseInner = `
        <polygon points="100,12 178,56 178,144 100,188 22,144 22,56" fill="${c1}"/>
        <polygon points="100,12 178,56 100,100 22,56" fill="${c2}"/>
        <polygon points="100,100 178,56 178,144 100,188" fill="${c2}" opacity="0.38"/>
        <circle cx="100" cy="104" r="54" fill="${c1}" stroke="#FFFFFF" stroke-width="5"/>
        ${renderIcon(62, 66, 76, '#FFFFFF')}
        <circle cx="100" cy="36" r="7" fill="${c3}"/>
      `;
        break;

      case 'bauhausGrid':
        baseInner = `
        <rect x="20" y="20" width="76" height="76" rx="20" fill="${c2}"/>
        <path d="M104 20 H140 C162 20 180 38 180 60 V96 H104 Z" fill="${c3}"/>
        <rect x="20" y="104" width="160" height="76" rx="24" fill="${c1}"/>
        <circle cx="58" cy="58" r="16" fill="#FFFFFF"/>
        ${renderIcon(64, 106, 72, '#FFFFFF')}
      `;
        break;

      case 'offsetNeo':
        baseInner = `
        <rect x="34" y="34" width="146" height="146" rx="36" fill="${c2}"/>
        <rect x="20" y="20" width="146" height="146" rx="36" fill="${c1}" stroke="#FFFFFF" stroke-width="5"/>
        <circle cx="138" cy="48" r="10" fill="${c3}"/>
        ${renderIcon(47, 47, 92, '#FFFFFF')}
      `;
        break;

      case 'swissSeal':
        baseInner = `
        <circle cx="100" cy="100" r="84" fill="none" stroke="${c1}" stroke-width="6"/>
        <path d="M100 16 A84 84 0 0 1 184 100" fill="none" stroke="${c2}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="100" cy="100" r="64" fill="${c1}"/>
        <circle cx="164" cy="42" r="11" fill="${c3}" stroke="#FFFFFF" stroke-width="4"/>
        ${renderIcon(58, 58, 84, '#FFFFFF')}
      `;
        break;

      case 'slashCapsule':
        baseInner = `
        <rect x="22" y="22" width="156" height="156" rx="44" fill="${c1}"/>
        <path d="M22 66 C22 42 42 22 66 22 H134 C158 22 178 42 178 66 V76 L22 124 Z" fill="${c2}"/>
        <circle cx="148" cy="148" r="10" fill="${c3}"/>
        ${renderIcon(54, 54, 92, '#FFFFFF')}
      `;
        break;

      case 'shieldCrest':
        baseInner = `
        <path d="M100 14 L172 42 V102 C172 148 140 176 100 188 C60 176 28 148 28 102 V42 L100 14 Z" fill="${c1}"/>
        <path d="M100 26 L158 49 V100 C158 138 132 160 100 172 V26 Z" fill="${c2}" opacity="0.82"/>
        <circle cx="100" cy="44" r="8" fill="${c3}"/>
        ${renderIcon(56, 58, 88, '#FFFFFF')}
      `;
        break;

      case 'vennPortal':
        baseInner = `
        <circle cx="78" cy="104" r="62" fill="${c2}" opacity="0.88"/>
        <circle cx="114" cy="96" r="64" fill="${c1}"/>
        <circle cx="52" cy="54" r="12" fill="${c3}"/>
        ${renderIcon(72, 54, 84, '#FFFFFF')}
      `;
        break;

      case 'squircle':
        baseInner = `
        <rect x="20" y="20" width="160" height="160" rx="48" fill="${c1}"/>
        <rect x="25" y="25" width="150" height="150" rx="44" fill="none" stroke="${c2}" stroke-width="4" opacity="0.6"/>
        <circle cx="152" cy="48" r="8" fill="${c3}"/>
        ${renderIcon(46, 46, 108, '#FFFFFF')}
      `;
        break;

      case 'pureIcon':
        baseInner = `
        <circle cx="100" cy="100" r="88" fill="${c2}" opacity="0.08"/>
        ${renderIcon(25, 25, 150, c1)}
      `;
        break;

      case 'minimalistSpark':
      default:
        baseInner = `
        <rect x="26" y="26" width="148" height="148" rx="38" fill="${c2}" opacity="0.12"/>
        <circle cx="156" cy="44" r="16" fill="${c3}"/>
        <circle cx="44" cy="156" r="10" fill="${c2}"/>
        ${renderIcon(34, 34, 132, c1)}
      `;
        break;
    }
  } else {
    // Legacy containers with separated fundal & icon layers
    let bgMarkup = '';
    let icRect = { x: 46, y: 46, size: 108, defaultColor: '#FFFFFF' };

    switch (config.containerStyle) {
      case 'cutoutCorner':
        bgMarkup = `
          <rect x="20" y="24" width="146" height="150" rx="38" fill="${bgC1}"/>
          <path d="M20 64 C20 42 38 24 60 24 H124 C146 24 166 42 166 64 V92 H20 Z" fill="${bgC2}" opacity="0.25"/>
          <circle cx="150" cy="50" r="34" fill="#FFFFFF"/>
          <circle cx="150" cy="50" r="24" fill="${bgC2}"/>
          <circle cx="150" cy="50" r="8" fill="#FFFFFF"/>
        `;
        icRect = { x: 44, y: 62, size: 86, defaultColor: '#FFFFFF' };
        break;

      case 'monogramSeal':
        bgMarkup = `
          <rect x="18" y="22" width="164" height="156" rx="40" fill="${bgC1}"/>
          <path d="M104 22 H142 C164 22 182 40 182 62 V138 C182 160 164 178 142 178 H104 Z" fill="${bgC2}"/>
          <text x="60" y="132" font-family="'${config.fontFamily}', sans-serif" font-weight="800" font-size="88" fill="#FFFFFF" text-anchor="middle">${initChar}</text>
          <circle cx="104" cy="50" r="8" fill="${c3}"/>
        `;
        icRect = { x: 114, y: 68, size: 60, defaultColor: '#FFFFFF' };
        break;

      case 'isoHexCube':
        bgMarkup = `
          <polygon points="100,12 178,56 178,144 100,188 22,144 22,56" fill="${bgC1}"/>
          <polygon points="100,12 178,56 100,100 22,56" fill="${bgC2}"/>
          <polygon points="100,100 178,56 178,144 100,188" fill="${bgC2}" opacity="0.38"/>
          <circle cx="100" cy="104" r="54" fill="${bgC1}" stroke="#FFFFFF" stroke-width="5"/>
          <circle cx="100" cy="36" r="7" fill="${c3}"/>
        `;
        icRect = { x: 62, y: 66, size: 76, defaultColor: '#FFFFFF' };
        break;

      case 'bauhausGrid':
        bgMarkup = `
          <rect x="20" y="20" width="76" height="76" rx="20" fill="${bgC2}"/>
          <path d="M104 20 H140 C162 20 180 38 180 60 V96 H104 Z" fill="${c3}"/>
          <rect x="20" y="104" width="160" height="76" rx="24" fill="${bgC1}"/>
          <circle cx="58" cy="58" r="16" fill="#FFFFFF"/>
        `;
        icRect = { x: 64, y: 106, size: 72, defaultColor: '#FFFFFF' };
        break;

      case 'offsetNeo':
        bgMarkup = `
          <rect x="34" y="34" width="146" height="146" rx="36" fill="${bgC2}"/>
          <rect x="20" y="20" width="146" height="146" rx="36" fill="${bgC1}" stroke="#FFFFFF" stroke-width="5"/>
          <circle cx="138" cy="48" r="10" fill="${c3}"/>
        `;
        icRect = { x: 47, y: 47, size: 92, defaultColor: '#FFFFFF' };
        break;

      case 'swissSeal':
        bgMarkup = `
          <circle cx="100" cy="100" r="84" fill="none" stroke="${bgC1}" stroke-width="6"/>
          <path d="M100 16 A84 84 0 0 1 184 100" fill="none" stroke="${bgC2}" stroke-width="12" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="64" fill="${bgC1}"/>
          <circle cx="164" cy="42" r="11" fill="${c3}" stroke="#FFFFFF" stroke-width="4"/>
        `;
        icRect = { x: 58, y: 58, size: 84, defaultColor: '#FFFFFF' };
        break;

      case 'slashCapsule':
        bgMarkup = `
          <rect x="22" y="22" width="156" height="156" rx="44" fill="${bgC1}"/>
          <path d="M22 66 C22 42 42 22 66 22 H134 C158 22 178 42 178 66 V76 L22 124 Z" fill="${bgC2}"/>
          <circle cx="148" cy="148" r="10" fill="${c3}"/>
        `;
        icRect = { x: 54, y: 54, size: 92, defaultColor: '#FFFFFF' };
        break;

      case 'shieldCrest':
        bgMarkup = `
          <path d="M100 14 L172 42 V102 C172 148 140 176 100 188 C60 176 28 148 28 102 V42 L100 14 Z" fill="${bgC1}"/>
          <path d="M100 26 L158 49 V100 C158 138 132 160 100 172 V26 Z" fill="${bgC2}" opacity="0.82"/>
          <circle cx="100" cy="44" r="8" fill="${c3}"/>
        `;
        icRect = { x: 56, y: 58, size: 88, defaultColor: '#FFFFFF' };
        break;

      case 'vennPortal':
        bgMarkup = `
          <circle cx="78" cy="104" r="62" fill="${bgC2}" opacity="0.88"/>
          <circle cx="114" cy="96" r="64" fill="${bgC1}"/>
          <circle cx="52" cy="54" r="12" fill="${c3}"/>
        `;
        icRect = { x: 72, y: 54, size: 84, defaultColor: '#FFFFFF' };
        break;

      case 'squircle':
        bgMarkup = `
          <rect x="20" y="20" width="160" height="160" rx="48" fill="${bgC1}"/>
          <rect x="25" y="25" width="150" height="150" rx="44" fill="none" stroke="${bgC2}" stroke-width="4" opacity="0.6"/>
          <circle cx="152" cy="48" r="8" fill="${c3}"/>
        `;
        icRect = { x: 46, y: 46, size: 108, defaultColor: '#FFFFFF' };
        break;

      case 'pureIcon':
        bgMarkup = `<circle cx="100" cy="100" r="88" fill="${bgC2}" opacity="0.08"/>`;
        icRect = { x: 25, y: 25, size: 150, defaultColor: c1 };
        break;

      case 'minimalistSpark':
      default:
        bgMarkup = `
          <rect x="26" y="26" width="148" height="148" rx="38" fill="${bgC2}" opacity="0.12"/>
          <circle cx="156" cy="44" r="16" fill="${c3}"/>
          <circle cx="44" cy="156" r="10" fill="${bgC2}"/>
        `;
        icRect = { x: 34, y: 34, size: 132, defaultColor: c1 };
        break;
    }

    const effSize = showBg ? icRect.size : Math.min(148, Math.max(icRect.size, 128));
    const effX = showBg ? icRect.x : Math.round(100 - effSize / 2);
    const effY = showBg ? icRect.y : Math.round(100 - effSize / 2);
    const resolvedIconColor =
      config.emblemIconColor ||
      (showBg
        ? ensureIconContrast(
            icRect.defaultColor === '#FFFFFF' ? '#FFFFFF' : bgC1,
            bgC1,
            bgC1
          )
        : ensureIconContrast(c1, config.surfaceBgHex || '#FFFFFF', c1));

    const wrappedBg = wrapBg(bgMarkup);
    const wrappedIcon = wrapIcon(
      renderIcon(effX, effY, effSize, resolvedIconColor),
      effX + effSize / 2,
      effY + effSize / 2
    );
    baseInner = `${wrappedBg}${wrappedIcon}`;
  }

  // Compound Emblem Fusion Mode 3: Dual-Icon Interlock Badge
  if (fusion === 'dual-badge') {
    const secIcon = config.secondaryIcon || 'Sparkles';
    const badgeBg = wrapBg(
      `<rect x="116" y="116" width="68" height="68" rx="22" fill="${bgC2}" stroke="#FFFFFF" stroke-width="5"/><circle cx="176" cy="122" r="7" fill="${c3}"/>`
    );
    const badgeIc = showIcon
      ? renderSpecificIcon(secIcon, 130, 130, 40, config.emblemIconColor || '#FFFFFF', false)
      : '';
    return `
      <g transform="translate(-4, -4) scale(0.94)">
        ${baseInner}
      </g>
      <g id="logostudio-secondary-badge">
        ${badgeBg}
        ${badgeIc}
      </g>
    `;
  }

  return baseInner;
}

export function buildEmblemSvgMarkup(
  config: EmblemMarkupConfig,
  size = 200,
  opts?: { bleed?: number | 'auto' }
): string {
  const inner = buildEmblemInnerMarkup(config);
  const bleed =
    opts?.bleed === undefined || opts.bleed === 'auto'
      ? computeEmblemBleed(config)
      : Math.max(0, opts.bleed);
  if (bleed === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}">${inner}</svg>`;
  }
  const vbSpan = 200 + bleed * 2;
  const pxSize = Math.round((size * vbSpan) / 200);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-bleed} ${-bleed} ${vbSpan} ${vbSpan}" width="${pxSize}" height="${pxSize}">${inner}</svg>`;
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

function buildMotionCss(motionPreset: MotionPreset): string {
  if (!motionPreset || motionPreset === 'none') return '';

  if (motionPreset === 'draw-stroke') {
    return `
      @media (prefers-reduced-motion: no-preference) {
        #logostudio-emblem path,
        #logostudio-emblem circle,
        #logostudio-emblem rect,
        #logostudio-emblem polygon,
        #logostudio-emblem polyline,
        #logostudio-emblem line {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: ls-draw 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        #logostudio-wordmark {
          opacity: 0;
          animation: ls-word 0.7s ease-out 0.35s forwards;
        }
      }
      @keyframes ls-draw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes ls-word {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  if (motionPreset === 'kinetic-spin') {
    return `
      @media (prefers-reduced-motion: no-preference) {
        #logostudio-emblem-inner {
          transform-origin: 100px 100px;
          animation: ls-spin 14s linear infinite;
        }
      }
      @keyframes ls-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  }

  if (motionPreset === 'ambient-pulse') {
    return `
      @media (prefers-reduced-motion: no-preference) {
        #logostudio-emblem-inner {
          transform-origin: 100px 100px;
          animation: ls-pulse 3.2s ease-in-out infinite;
        }
      }
      @keyframes ls-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.06); }
      }
    `;
  }

  return '';
}

function injectPathLengthOnStrokes(svgMarkup: string): string {
  return svgMarkup.replace(
    /<(path|circle|rect|polygon|polyline|line)\b([^>]*?)(\/?>)/gi,
    (_full, tag, attrs, close) => {
      if (/pathLength=/i.test(attrs)) return `<${tag}${attrs}${close}`;
      return `<${tag}${attrs} pathLength="100"${close}`;
    }
  );
}

export interface FullLogoSvgOptions {
  width: number;
  height: number;
  background?: 'transparent' | 'white' | 'dark' | 'brand';
  paddingRatio?: number;
  animated?: boolean;
  embeddedFontCss?: string;
}

export function generateFullLogoSvg(
  state: LogoState | LogoVariant,
  options: FullLogoSvgOptions
): string {
  const { width, height, background = 'white', animated = false, embeddedFontCss } = options;
  const isSquare = Math.abs(width - height) < 20;

  // Single source of truth layout engine
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

  const secondaryIcon =
    (state as LogoState).secondaryIcon ||
    (state as LogoVariant).secondaryIcon ||
    (state as LogoState).icons10?.[1] ||
    'Sparkles';

  const emblemFusion: EmblemFusionMode =
    (state as LogoState).emblemFusion || (state as LogoVariant).emblemFusion || 'single';

  const motionPreset: MotionPreset = animated
    ? (state as LogoState).motionPreset || 'none'
    : 'none';

  let emblemMarkup = '';
  if (layout.emblem.show) {
    let emblemSvgInner = buildEmblemInnerMarkup(
      emblemConfigFromState(state, {
        secondaryIcon,
        emblemFusion,
        fontFamily: layout.fontFamily,
        surfaceBgHex: bgFill === 'none' ? '#FFFFFF' : bgFill,
      })
    );

    if (motionPreset === 'draw-stroke') {
      emblemSvgInner = injectPathLengthOnStrokes(emblemSvgInner);
    }

    emblemMarkup = `
    <g id="logostudio-emblem" transform="translate(${layout.emblem.x}, ${layout.emblem.y})">
      <g transform="scale(${layout.emblem.size / 200})">
        <g id="logostudio-emblem-inner">
          ${emblemSvgInner}
        </g>
      </g>
    </g>
  `;
  }

  // Mask for 45° stencil cut if active
  const maskHash = hashDomain(`${state.domain || state.word1}-${width}x${height}`).toString(36);
  const stencilMaskId = `ls-stencil-${maskHash}`;
  let stencilDefsMarkup = '';
  let wordmarkAccentMarkup = '';

  if (layout.wordmarkAccent?.mode === 'stencil-slice-45' && layout.wordmarkAccent.slicePolygon) {
    const polyPts = layout.wordmarkAccent.slicePolygon
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
    stencilDefsMarkup = `
      <mask id="${stencilMaskId}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="white" />
        <polygon points="${polyPts}" fill="black" />
      </mask>
    `;
    if (layout.wordmarkAccent.wedgePolygon) {
      const wedgePts = layout.wordmarkAccent.wedgePolygon
        .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');
      wordmarkAccentMarkup = `<polygon points="${wedgePts}" fill="${layout.wordmarkAccent.color}" />`;
    }
  } else if (
    layout.wordmarkAccent?.mode === 'spark-dot' &&
    layout.wordmarkAccent.sparkCx !== undefined &&
    layout.wordmarkAccent.sparkCy !== undefined &&
    layout.wordmarkAccent.sparkRadius !== undefined
  ) {
    wordmarkAccentMarkup = `<circle cx="${layout.wordmarkAccent.sparkCx.toFixed(1)}" cy="${layout.wordmarkAccent.sparkCy.toFixed(1)}" r="${layout.wordmarkAccent.sparkRadius.toFixed(1)}" fill="${layout.wordmarkAccent.color}" />`;
  }

  const w1TextElement = `
    <text x="${layout.w1.x}" y="${layout.w1.y}" font-family="'${layout.fontFamily}', sans-serif" font-size="${layout.w1.fontSize}" font-weight="${layout.w1.fontWeight}" fill="${primaryColor}" letter-spacing="${layout.w1.trackingPx.toFixed(2)}px">
      ${layout.w1.text}
    </text>
  `;

  const w1Markup = stencilDefsMarkup
    ? `<g mask="url(#${stencilMaskId})">${w1TextElement}</g>`
    : w1TextElement;

  const w2Markup = layout.w2
    ? `
    <text x="${layout.w2.x}" y="${layout.w2.y}" font-family="'${layout.fontFamily}', sans-serif" font-size="${layout.w2.fontSize}" font-weight="${layout.w2.fontWeight}" fill="${secondaryColor}" letter-spacing="${layout.w2.trackingPx.toFixed(2)}px">
      ${layout.w2.text}
    </text>
  `
    : '';

  const w3Markup = layout.w3
    ? `
    <text x="${layout.w3.x}" y="${layout.w3.y}" font-family="'${layout.fontFamily}', sans-serif" font-size="${layout.w3.fontSize}" font-weight="${layout.w3.fontWeight}" fill="${primaryColor}" letter-spacing="${layout.w3.trackingPx.toFixed(2)}px">
      ${layout.w3.text}
    </text>
  `
    : '';

  const dotBadgeMarkup = layout.dotBadge
    ? `
    <circle cx="${layout.dotBadge.cx}" cy="${layout.dotBadge.cy}" r="${layout.dotBadge.radius}" fill="${layout.dotBadge.color}" />
  `
    : '';

  // Extension block across all 5 extStyle modes
  let extMarkup = '';
  if (layout.extPill) {
    const ep = layout.extPill;
    if (ep.style === 'inline' || ep.style === 'superscript') {
      extMarkup = `
        <g id="logostudio-ext-pill">
          <text x="${ep.textX}" y="${ep.textY}" font-family="'${ep.fontFamily}', sans-serif" font-weight="${ep.fontWeight}" font-size="${ep.fontSize}" fill="${ep.textColor}">
            ${ep.text}
          </text>
        </g>
      `;
    } else if (ep.style === 'dot') {
      extMarkup = `
        <g id="logostudio-ext-pill">
          <circle cx="${ep.dotCx}" cy="${ep.dotCy}" r="${ep.dotRadius}" fill="${ep.dotColor}" />
          <text x="${ep.textX}" y="${ep.textY}" font-family="'${ep.fontFamily}', sans-serif" font-weight="${ep.fontWeight}" font-size="${ep.fontSize}" fill="${ep.textColor}">
            ${ep.text}
          </text>
        </g>
      `;
    } else if (ep.style === 'tech-tag') {
      extMarkup = `
        <g id="logostudio-ext-pill">
          <rect x="${ep.x}" y="${ep.y}" width="${ep.width}" height="${ep.height}" rx="${ep.radius}" fill="${ep.color}" fill-opacity="${ep.fillOpacity ?? 0.12}" stroke="${ep.strokeColor || ep.color}" stroke-width="${ep.strokeWidth ?? 1.5}" />
          <text x="${ep.textX}" y="${ep.textY}" font-family="'${ep.fontFamily}', monospace" font-weight="${ep.fontWeight}" font-size="${ep.fontSize}" fill="${ep.textColor}">
            ${ep.text}
          </text>
        </g>
      `;
    } else {
      // 'pill'
      extMarkup = `
        <g id="logostudio-ext-pill">
          <rect x="${ep.x}" y="${ep.y}" width="${ep.width}" height="${ep.height}" rx="${ep.radius}" fill="${ep.color}" />
          <text x="${ep.textX}" y="${ep.textY}" font-family="'${ep.fontFamily}', sans-serif" font-weight="${ep.fontWeight}" font-size="${ep.fontSize}" fill="${ep.textColor}">
            ${ep.text}
          </text>
        </g>
      `;
    }
  }

  const taglineMarkup = layout.tagline
    ? `
    <text x="${layout.tagline.x}" y="${layout.tagline.y}" font-family="'${layout.fontFamily}', sans-serif" font-weight="600" font-size="${layout.tagline.fontSize}" letter-spacing="${layout.tagline.tracking}px" fill="${layout.tagline.color}">
      ${layout.tagline.text}
    </text>
  `
    : '';

  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    layout.fontFamily
  )}:wght@300;400;600;700;800&amp;display=swap`;
  const fontCssBlock = embeddedFontCss || `@import url('${fontUrl}');`;
  const motionCssBlock = buildMotionCss(motionPreset);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by LogoStudio.si -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${stencilDefsMarkup}
    <style>
      ${fontCssBlock}
      text {
        font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        -webkit-font-smoothing: antialiased;
      }
      ${motionCssBlock}
    </style>
  </defs>
  ${bgFill !== 'none' ? `<rect width="${width}" height="${height}" fill="${bgFill}" />` : ''}
  ${emblemMarkup}
  <g id="logostudio-wordmark">
    ${w1Markup}
    ${w2Markup}
    ${w3Markup}
    ${wordmarkAccentMarkup}
    ${dotBadgeMarkup}
    ${extMarkup}
    ${taglineMarkup}
  </g>
</svg>`;
}

/**
 * Generates a self-contained SVG with base64-embedded `@font-face` woff2 subset rules
 * so the exported/copied SVG renders with the exact brand font even without internet or installed fonts.
 */
export async function generateFullLogoSvgEmbedded(
  state: LogoState | LogoVariant,
  options: FullLogoSvgOptions
): Promise<string> {
  const isSquare = Math.abs(options.width - options.height) < 20;
  const layout = computeLockupLayout(null, state, options.width, options.height, isSquare);

  const sampleText = [
    layout.w1.text,
    layout.w2?.text || '',
    layout.w3?.text || '',
    layout.extPill?.text || '',
    layout.tagline?.text || '',
    (state.word1 ? state.word1[0] : 'A').toUpperCase(),
  ].join('');

  const weights = Array.from(
    new Set([layout.w1.fontWeight, layout.w2?.fontWeight || '700', '600', '700', '800'])
  );

  const primaryCss = await fetchEmbeddedFontCss(layout.fontFamily, weights, sampleText);
  let combinedCss = primaryCss;

  if (layout.extPill?.style === 'tech-tag' && layout.fontFamily !== 'JetBrains Mono') {
    const monoCss = await fetchEmbeddedFontCss('JetBrains Mono', ['700'], layout.extPill.text);
    combinedCss = `${primaryCss}\n${monoCss}`;
  }

  return generateFullLogoSvg(state, {
    ...options,
    embeddedFontCss: combinedCss,
  });
}
