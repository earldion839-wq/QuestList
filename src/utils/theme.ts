import { ModConfig, ModFontFamily, ModPreset, ModRadius } from '../types';

export const MOD_PRESETS: ModPreset[] = [
  {
    id: 'gx-crimson',
    name: 'GX Crimson Dark',
    description: 'Deep obsidian canvas with sharp geometry and crimson tactical accent.',
    config: {
      bgColor: '#0D0E12',
      surfaceColor: '#15171E',
      accentColor: '#FA1E4E',
      fontFamily: 'Outfit',
      fontSizePx: 15,
      radius: 'sharp',
      density: 'comfortable',
      texture: 'grid',
      soundEnabled: false,
    },
  },
  {
    id: 'studio-daylight',
    name: 'Studio Daylight',
    description: 'Clean neutral off-white paper canvas with crisp cobalt focus.',
    config: {
      bgColor: '#F4F6F9',
      surfaceColor: '#FFFFFF',
      accentColor: '#2563EB',
      fontFamily: 'Plus Jakarta Sans',
      fontSizePx: 15,
      radius: 'balanced',
      density: 'comfortable',
      texture: 'solid',
      soundEnabled: false,
    },
  },
  {
    id: 'emerald-sanctuary',
    name: 'Forest Sanctuary',
    description: 'Low-glare pine slate with calm emerald highlights.',
    config: {
      bgColor: '#0B1412',
      surfaceColor: '#12201D',
      accentColor: '#10B981',
      fontFamily: 'DM Sans',
      fontSizePx: 15,
      radius: 'soft',
      density: 'comfortable',
      texture: 'dots',
      soundEnabled: false,
    },
  },
  {
    id: 'warm-parchment',
    name: 'Warm Parchment',
    description: 'Editorial cream workspace with terracotta ink highlights.',
    config: {
      bgColor: '#F5F1E8',
      surfaceColor: '#FCFBF8',
      accentColor: '#C2410C',
      fontFamily: 'Bricolage Grotesque',
      fontSizePx: 15,
      radius: 'balanced',
      density: 'spacious',
      texture: 'solid',
      soundEnabled: false,
    },
  },
  {
    id: 'midnight-violet',
    name: 'Midnight Arcade',
    description: 'Deep indigo night deck with violet HUD accent and mono type.',
    config: {
      bgColor: '#0E0D16',
      surfaceColor: '#171526',
      accentColor: '#8B5CF6',
      fontFamily: 'JetBrains Mono',
      fontSizePx: 14,
      radius: 'sharp',
      density: 'compact',
      texture: 'diagonal',
      soundEnabled: true,
    },
  },
];

export const DEFAULT_MOD_CONFIG: ModConfig = {
  presetId: MOD_PRESETS[0].id,
  ...MOD_PRESETS[0].config,
};

export const FONT_OPTIONS: { value: ModFontFamily; label: string; sample: string }[] = [
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sample: 'Clean Neo-Grotesque' },
  { value: 'Outfit', label: 'Outfit', sample: 'Geometric Display' },
  { value: 'Bricolage Grotesque', label: 'Bricolage Grotesque', sample: 'Expressive Editorial' },
  { value: 'DM Sans', label: 'DM Sans', sample: 'Balanced Readable' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', sample: 'Technical Monospace' },
];

export function normalizeHex(hex: string, fallback = '#0D0E12'): string {
  const cleaned = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded = cleaned
      .split('')
      .map((ch) => ch + ch)
      .join('');
    return `#${expanded.toUpperCase()}`;
  }
  return fallback;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getRelativeLuminance(hexA);
  const lumB = getRelativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  const r = Math.round(a.r * (1 - w) + b.r * w);
  const g = Math.round(a.g * (1 - w) + b.g * w);
  const bl = Math.round(a.b * (1 - w) + b.b * w);
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

export interface ComputedThemeTokens {
  isDarkSurface: boolean;
  bgColor: string;
  surfaceColor: string;
  surfaceElevated: string;
  borderColor: string;
  textColor: string;
  textMuted: string;
  accentColor: string;
  accentFg: string;
  accentSoft: string;
  surfaceContrastRatio: number;
  accentContrastRatio: number;
}

export function computeAccessibleTokens(mod: ModConfig): ComputedThemeTokens {
  const bg = normalizeHex(mod.bgColor, '#0D0E12');
  const surface = normalizeHex(mod.surfaceColor, '#15171E');
  const accent = normalizeHex(mod.accentColor, '#FA1E4E');

  const surfaceLum = getRelativeLuminance(surface);
  const isDarkSurface = surfaceLum < 0.38;

  const lightText = '#F3F4F6';
  const darkText = '#111827';
  const textColor = isDarkSurface ? lightText : darkText;
  const textMuted = isDarkSurface ? '#9CA3AF' : '#4B5563';

  const surfaceElevated = isDarkSurface
    ? mixHex(surface, '#FFFFFF', 0.06)
    : mixHex(surface, '#000000', 0.04);

  const borderColor = isDarkSurface
    ? 'rgba(255, 255, 255, 0.10)'
    : 'rgba(15, 23, 42, 0.11)';

  const accentOnWhite = getContrastRatio(accent, '#FFFFFF');
  const accentOnDark = getContrastRatio(accent, '#0F172A');
  const accentFg = accentOnWhite >= accentOnDark ? '#FFFFFF' : '#0F172A';

  const { r, g, b } = hexToRgb(accent);
  const accentSoft = `rgba(${r}, ${g}, ${b}, ${isDarkSurface ? 0.16 : 0.11})`;

  return {
    isDarkSurface,
    bgColor: bg,
    surfaceColor: surface,
    surfaceElevated,
    borderColor,
    textColor,
    textMuted,
    accentColor: accent,
    accentFg,
    accentSoft,
    surfaceContrastRatio: Number(getContrastRatio(surface, textColor).toFixed(2)),
    accentContrastRatio: Number(getContrastRatio(accent, accentFg).toFixed(2)),
  };
}

export function getRadiusValues(radius: ModRadius): { outer: string; inner: string } {
  switch (radius) {
    case 'sharp':
      return { outer: '4px', inner: '3px' };
    case 'soft':
      return { outer: '14px', inner: '9px' };
    case 'balanced':
    default:
      return { outer: '9px', inner: '6px' };
  }
}

export function applyModToDocument(mod: ModConfig): ComputedThemeTokens {
  const tokens = computeAccessibleTokens(mod);
  if (typeof document === 'undefined') return tokens;

  const root = document.documentElement;
  const radii = getRadiusValues(mod.radius);
  const fontStack = `'${mod.fontFamily}', system-ui, -apple-system, sans-serif`;
  const displayStack =
    mod.fontFamily === 'JetBrains Mono'
      ? fontStack
      : `'${mod.fontFamily}', 'Outfit', system-ui, sans-serif`;

  root.style.setProperty('--mod-bg', tokens.bgColor);
  root.style.setProperty('--mod-surface', tokens.surfaceColor);
  root.style.setProperty('--mod-surface-elevated', tokens.surfaceElevated);
  root.style.setProperty('--mod-border', tokens.borderColor);
  root.style.setProperty('--mod-text', tokens.textColor);
  root.style.setProperty('--mod-text-muted', tokens.textMuted);
  root.style.setProperty('--mod-accent', tokens.accentColor);
  root.style.setProperty('--mod-accent-fg', tokens.accentFg);
  root.style.setProperty('--mod-accent-soft', tokens.accentSoft);
  root.style.setProperty('--mod-font-family', fontStack);
  root.style.setProperty('--mod-display-font', displayStack);
  root.style.setProperty('--mod-font-size', `${Math.max(12, Math.min(20, mod.fontSizePx))}px`);
  root.style.setProperty('--mod-radius', radii.outer);
  root.style.setProperty('--mod-radius-sm', radii.inner);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', tokens.bgColor);
  }

  return tokens;
}
