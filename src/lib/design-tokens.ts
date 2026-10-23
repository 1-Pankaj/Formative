/**
 * Formative Design System - Design Tokens
 * 
 * This file contains all design tokens for the Formative Studio application.
 * Uses a structured approach with semantic, color, spacing, and typography tokens.
 */

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  // Base unit: 4px
  xs: '0.25rem',     // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  '4xl': '2.5rem',   // 40px
  '5xl': '3rem',     // 48px
  '6xl': '4rem',     // 64px
  
  // Special spacing for canvas elements
  canvas: {
    node: {
      width: 280,
      height: 120,
    },
    gap: {
      x: 100,
      y: 160,
    },
    padding: {
      node: 16,
      canvas: 40,
    },
  },
  
  // Layout spacing
  sidebar: {
    width: 240,
    collapsed: 64,
  },
  nav: {
    width: 56,
    height: '100%',
  },
  header: {
    height: 48,
  },
  footer: {
    height: 24,
  },
  inspector: {
    width: 320,
  },
} as const;

// ============================================================================
// COLOR TOKENS - Semantic Design System
// ============================================================================

export const colors = {
  // Brand colors - Formative's signature palette
  brand: {
    primary: '#E04418',      // Formative Orange
    primaryHover: '#F25224',
    primaryActive: '#C7380F',
    primarySubtle: 'rgba(224, 68, 24, 0.12)',
    primaryBorder: 'rgba(224, 68, 24, 0.28)',
    primaryGlow: 'rgba(224, 68, 24, 0.35)',
    
    // Secondary brand colors
    accent: '#06B6D4',       // Cyan for AI/automation
    accentHover: '#22D3EE',
    accentActive: '#0891B2',
    
    // Status colors
    success: '#10B981',      // Emerald
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    info: '#3B82F6',         // Blue
  },
  
  // Semantic colors - Light mode
  light: {
    // Background
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceHover: '#F1F5F9',
    surfaceActive: '#E2E8F0',
    
    // Borders
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    borderSubtle: '#F1F5F9',
    
    // Text
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#94A3B8',
      muted: '#CBD5E1',
      inverse: '#FFFFFF',
    },
    
    // Components
    card: {
      background: '#FFFFFF',
      border: '#E2E8F0',
      hover: '#F8FAFC',
    },
    
    // Interactive
    interactive: {
      background: '#F1F5F9',
      backgroundHover: '#E2E8F0',
      backgroundActive: '#CBD5E1',
      text: '#475569',
      textHover: '#0F172A',
    },
  },
  
  // Semantic colors - Dark mode
  dark: {
    // Background - Deep obsidian palette
    background: '#09090B',
    surface: '#121215',
    surfaceHover: '#18181C',
    surfaceActive: '#222530',
    
    // Borders
    border: '#27272A',
    borderStrong: '#3F3F46',
    borderSubtle: '#1F1F23',
    
    // Text
    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1AA',
      tertiary: '#71717A',
      muted: '#52525B',
      inverse: '#09090B',
    },
    
    // Components
    card: {
      background: '#121215',
      border: '#27272A',
      hover: '#18181C',
    },
    
    // Interactive
    interactive: {
      background: '#18181C',
      backgroundHover: '#27272A',
      backgroundActive: '#3F3F46',
      text: '#A1A1AA',
      textHover: '#FAFAFA',
    },
  },
  
  // Node category colors - Consistent across themes
  nodeCategory: {
    frontend: {
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#3B82F6',
      border: 'rgba(59, 130, 246, 0.3)',
      dot: '#3B82F6',
    },
    gateway: {
      bg: 'rgba(168, 85, 247, 0.15)',
      text: '#A855F7',
      border: 'rgba(168, 85, 247, 0.3)',
      dot: '#A855F7',
    },
    backend: {
      bg: 'rgba(16, 185, 129, 0.15)',
      text: '#10B981',
      border: 'rgba(16, 185, 129, 0.3)',
      dot: '#10B981',
    },
    database: {
      bg: 'rgba(245, 158, 11, 0.15)',
      text: '#F59E0B',
      border: 'rgba(245, 158, 11, 0.3)',
      dot: '#F59E0B',
    },
    cache: {
      bg: 'rgba(6, 182, 212, 0.15)',
      text: '#06B6D4',
      border: 'rgba(6, 182, 212, 0.3)',
      dot: '#06B6D4',
    },
    queue: {
      bg: 'rgba(236, 72, 153, 0.15)',
      text: '#EC4899',
      border: 'rgba(236, 72, 153, 0.3)',
      dot: '#EC4899',
    },
    worker: {
      bg: 'rgba(99, 102, 241, 0.15)',
      text: '#6366F1',
      border: 'rgba(99, 102, 241, 0.3)',
      dot: '#6366F1',
    },
    ai: {
      bg: 'rgba(251, 191, 36, 0.15)',
      text: '#FBBF24',
      border: 'rgba(251, 191, 36, 0.3)',
      dot: '#FBBF24',
    },
    auth: {
      bg: 'rgba(239, 68, 68, 0.15)',
      text: '#EF4444',
      border: 'rgba(239, 68, 68, 0.3)',
      dot: '#EF4444',
    },
    note: {
      bg: 'rgba(113, 113, 122, 0.15)',
      text: '#94A3B8',
      border: 'rgba(113, 113, 122, 0.3)',
      dot: '#94A3B8',
    },
  },
  
  // Status colors
  status: {
    idle: {
      bg: 'rgba(107, 114, 128, 0.2)',
      text: '#94A3B8',
      dot: '#94A3B8',
    },
    running: {
      bg: 'rgba(245, 158, 11, 0.2)',
      text: '#F59E0B',
      dot: '#F59E0B',
    },
    done: {
      bg: 'rgba(16, 185, 129, 0.2)',
      text: '#10B981',
      dot: '#10B981',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.2)',
      text: '#EF4444',
      dot: '#EF4444',
    },
    blocked: {
      bg: 'rgba(239, 68, 68, 0.2)',
      text: '#F97316',
      dot: '#F97316',
    },
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '2rem',     // 32px
    '4xl': '2.5rem',   // 40px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  
  // Brand shadows
  brand: {
    sm: '0 0 8px -2px rgba(224, 68, 24, 0.2)',
    md: '0 0 16px -2px rgba(224, 68, 24, 0.3)',
    lg: '0 0 24px -4px rgba(224, 68, 24, 0.4)',
  },
  
  // Node shadows
  node: {
    default: '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
    hover: '0 8px 20px -4px rgba(0, 0, 0, 0.4)',
    selected: '0 0 0 3px rgba(224, 68, 24, 0.3)',
  },
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
  
  // Special radii
  canvas: {
    node: '0.75rem',  // 12px
    card: '1rem',     // 16px
  },
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  
  timing: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom cubic-bezier
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
  max: 9999,
} as const;

// ============================================================================
// THEME UTILITIES
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export function getThemeColors(theme: ThemeMode) {
  return theme === 'light' ? colors.light : colors.dark;
}

export function getThemeToken(theme: ThemeMode, token: keyof typeof colors.light): string {
  return getThemeColors(theme)[token] as string;
}

// CSS Custom Properties for the current theme
export function generateThemeCSS(theme: ThemeMode): string {
  const c = getThemeColors(theme);
  
  return `
    --color-background: ${c.background};
    --color-surface: ${c.surface};
    --color-surface-hover: ${c.surfaceHover};
    --color-surface-active: ${c.surfaceActive};
    --color-border: ${c.border};
    --color-border-strong: ${c.borderStrong};
    --color-border-subtle: ${c.borderSubtle};
    --color-text-primary: ${c.text.primary};
    --color-text-secondary: ${c.text.secondary};
    --color-text-tertiary: ${c.text.tertiary};
    --color-text-muted: ${c.text.muted};
    --color-text-inverse: ${c.text.inverse};
    
    --color-brand-primary: ${colors.brand.primary};
    --color-brand-primary-hover: ${colors.brand.primaryHover};
    --color-brand-accent: ${colors.brand.accent};
    
    --color-success: ${colors.brand.success};
    --color-warning: ${colors.brand.warning};
    --color-error: ${colors.brand.error};
    --color-info: ${colors.brand.info};
    
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    
    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    
    --spacing-xs: ${spacing.xs};
    --spacing-sm: ${spacing.sm};
    --spacing-md: ${spacing.md};
    --spacing-lg: ${spacing.lg};
    --spacing-xl: ${spacing.xl};
  `;
}

export default {
  spacing,
  colors,
  typography,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  getThemeColors,
  getThemeToken,
  generateThemeCSS,
};
