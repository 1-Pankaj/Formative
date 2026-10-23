/**
 * Formative Design System - Apple HIG Inspired
 * 
 * Based on Apple's Human Interface Guidelines (HIG)
 * Principles: Clarity, Deference, Depth, Consistency, Feedback, Metaphor
 * 
 * This design system brings Apple-like polish and professionalism to Formative Studio.
 */

// ============================================================================
// APPLE HIG DESIGN PRINCIPLES
// ============================================================================

/**
 * Apple HIG Core Principles:
 * 1. Clarity - Text is legible, icons are precise and lucid, adornments are subtle
 * 2. Deference - UI helps users achieve goals without drawing attention to itself
 * 3. Depth - Visual layers and realistic motion convey hierarchy and vitality
 * 4. Consistency - Uniform terminology, icons, and UI elements
 * 5. Feedback - User actions are acknowledged with visual or haptic responses
 * 6. Metaphor - Real-world analogies make the virtual feel familiar
 */

// ============================================================================
// FOUNDATION: SPACING (8px Grid System - Apple Standard)
// ============================================================================

export const spacing = {
  // Base unit: 8px (Apple uses 8px grid, not 4px)
  xxs: '0.125rem',   // 2px  - Micro spacing
  xs: '0.25rem',     // 4px  - Tight spacing
  sm: '0.5rem',     // 8px  - Base unit
  md: '0.75rem',    // 12px - Standard spacing
  lg: '1rem',       // 16px - Comfortable spacing
  xl: '1.25rem',    // 20px - Generous spacing
  '2xl': '1.5rem',   // 24px - Section spacing
  '3xl': '2rem',     // 32px - Large gaps
  '4xl': '2.5rem',   // 40px - XL gaps
  '5xl': '3rem',     // 48px - Section padding
  '6xl': '4rem',     // 64px - Page margins
  '7xl': '5rem',     // 80px - Large sections
  
  // Layout dimensions
  sidebar: {
    width: 256,      // Apple-like sidebar width
    collapsed: 72,   // Compact sidebar
  },
  nav: {
    width: 64,       // Navigation rail
    height: '100%',
  },
  header: {
    height: 56,      // Standard toolbar height
  },
  footer: {
    height: 32,
  },
  inspector: {
    width: 320,
  },
  
  // Canvas-specific
  canvas: {
    node: {
      width: 280,
      minHeight: 100,
    },
    gap: {
      x: 120,
      y: 140,
    },
    padding: {
      node: 16,
      canvas: 48,
    },
  },
  
  // Touch targets (Apple minimum: 44x44pt)
  touch: {
    min: '2.75rem',  // 44px
    comfortable: '3rem', // 48px
  },
} as const;

// ============================================================================
// FOUNDATION: COLOR SYSTEM (Apple-inspired neutral palette)
// ============================================================================

export const colors = {
  // Brand - Professional and refined (Apple uses blue as primary)
  brand: {
    primary: '#0071E3',           // Apple Blue (similar to macOS selection)
    primaryHover: '#0077ED',
    primaryActive: '#005CC8',
    primarySubtle: 'rgba(0, 113, 227, 0.12)',
    primaryBorder: 'rgba(0, 113, 227, 0.24)',
    
    // Accent for secondary actions
    accent: '#FF9500',            // Orange accent (like Apple Music)
    accentHover: '#FF9F0A',
    accentActive: '#E68400',
    
    // Gradient for depth
    gradient: {
      primary: 'linear-gradient(180deg, #0071E3 0%, #005CC8 100%)',
      accent: 'linear-gradient(180deg, #FF9500 0%, #E68400 100%)',
    },
  },
  
  // Semantic - Light Mode (Apple uses neutral backgrounds)
  light: {
    // Background hierarchy (Apple uses multiple levels)
    background: '#F5F5F7',        // System gray 6 (macOS window background)
    backgroundSecondary: '#FFFFFF', // Pure white for elevated surfaces
    surface: '#FFFFFF',
    surfaceHover: '#F2F2F7',     // System gray 5
    surfaceActive: '#E5E5EA',    // System gray 4
    surfaceElevated: '#FFFFFF',
    
    // Borders (Apple uses subtle, single-pixel borders)
    border: '#D2D2D7',          // System gray 3
    borderStrong: '#C7C7CC',    // System gray 2
    borderSubtle: '#E5E5EA',    // System gray 4
    
    // Text (Apple typography hierarchy)
    text: {
      primary: '#1D1D1F',        // System gray 1 (Label color)
      secondary: '#515154',      // System gray 2 (Secondary label)
      tertiary: '#86868B',       // System gray 3 (Tertiary label)
      quaternary: '#AEAEB2',    // System gray 4 (Placeholder)
      disabled: '#C7C7CC',      // System gray 2
    },
    
    // Status colors (Apple uses these exact values)
    status: {
      success: '#34C759',        // System green
      warning: '#FF9500',        // System orange
      error: '#FF3B30',          // System red
      info: '#0071E3',          // System blue
    },
  },
  
  // Semantic - Dark Mode (Apple Dark Mode palette)
  dark: {
    // Background hierarchy
    background: '#000000',        // Pure black
    backgroundSecondary: '#1D1D1F', // Elevated background
    surface: '#1D1D1F',
    surfaceHover: '#2D2D30',     // Hover state
    surfaceActive: '#3A3A3C',    // Active state
    surfaceElevated: '#2D2D30',
    
    // Borders
    border: '#3A3A3C',
    borderStrong: '#48484A',
    borderSubtle: '#2D2D30',
    
    // Text
    text: {
      primary: '#F5F5F7',        // Primary text
      secondary: '#EBEBF5',      // Secondary text (90% opacity)
      tertiary: '#AEAEB2',       // Tertiary text (60% opacity)
      quaternary: '#86868B',     // Quaternary text (40% opacity)
      disabled: '#636366',      // Disabled text
    },
    
    // Status colors (Dark mode variants)
    status: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF453A',
      info: '#0071E3',
    },
  },
  
  // Node category colors (Professional, muted palette)
  nodes: {
    architecture: {
      bg: 'rgba(0, 113, 227, 0.12)',
      border: 'rgba(0, 113, 227, 0.32)',
      text: '#0071E3',
      icon: '#005CC8',
    },
    ai: {
      bg: 'rgba(15, 155, 155, 0.12)',
      border: 'rgba(15, 155, 155, 0.32)',
      text: '#0F9B9B',
      icon: '#0A7A7A',
    },
    data: {
      bg: 'rgba(128, 80, 222, 0.12)',
      border: 'rgba(128, 80, 222, 0.32)',
      text: '#8050DE',
      icon: '#6A3EB8',
    },
    backend: {
      bg: 'rgba(255, 149, 0, 0.12)',
      border: 'rgba(255, 149, 0, 0.32)',
      text: '#FF9500',
      icon: '#E68400',
    },
    frontend: {
      bg: 'rgba(0, 180, 216, 0.12)',
      border: 'rgba(0, 180, 216, 0.32)',
      text: '#00B4D8',
      icon: '#0096C7',
    },
    mobile: {
      bg: 'rgba(255, 59, 48, 0.12)',
      border: 'rgba(255, 59, 48, 0.32)',
      text: '#FF3B30',
      icon: '#FF2D20',
    },
    note: {
      bg: 'rgba(255, 204, 0, 0.12)',
      border: 'rgba(255, 204, 0, 0.32)',
      text: '#FFCC00',
      icon: '#E6B800',
    },
  },
} as const;

// ============================================================================
// FOUNDATION: TYPOGRAPHY (SF Pro inspired scale)
// ============================================================================

export const typography = {
  // Font families (Apple uses SF Pro on macOS, -apple-system on web)
  family: {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'SF Mono, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    // For web compatibility, we'll use system fonts
    // In production macOS app, SF Pro would be available
  },
  
  // Font weights (Apple SF Pro weights)
  weight: {
    ultralight: 100,
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800,
    black: 900,
  },
  
  // Font sizes (Apple point scale converted to rem)
  // Note: Apple uses points (pt) where 1pt = 1.333px on non-retina
  // For web, we use rem (1rem = 16px)
  size: {
    // System text styles (macOS)
    caption1: { fontSize: '0.6875rem', lineHeight: '0.875rem', weight: 400 },  // 11px / 14px
    caption2: { fontSize: '0.75rem', lineHeight: '0.875rem', weight: 600 },   // 12px / 14px
    footnote: { fontSize: '0.75rem', lineHeight: '1rem', weight: 400 },      // 12px / 16px
    subheadline: { fontSize: '0.875rem', lineHeight: '1.125rem', weight: 400 }, // 14px / 18px
    
    // Body styles
    body: { fontSize: '1rem', lineHeight: '1.375rem', weight: 400 },         // 16px / 22px
    bodyEmphasized: { fontSize: '1rem', lineHeight: '1.375rem', weight: 600 }, // 16px / 22px
    
    // Callout (slightly larger body)
    callout: { fontSize: '1rem', lineHeight: '1.375rem', weight: 400 },      // 16px / 22px
    
    // Headline styles
    headline: { fontSize: '1.125rem', lineHeight: '1.375rem', weight: 600 },   // 18px / 22px
    
    // Title styles
    title3: { fontSize: '1.25rem', lineHeight: '1.5rem', weight: 600 },       // 20px / 24px
    title2: { fontSize: '1.5rem', lineHeight: '1.75rem', weight: 600 },       // 24px / 28px
    title1: { fontSize: '1.75rem', lineHeight: '2rem', weight: 700 },         // 28px / 32px
    
    // Large titles
    largeTitle: { fontSize: '2rem', lineHeight: '2.25rem', weight: 700 },     // 32px / 36px
    largeTitleEmphasized: { fontSize: '2.25rem', lineHeight: '2.5rem', weight: 800 }, // 36px / 40px
    
    // Display
    display: { fontSize: '3rem', lineHeight: '3.5rem', weight: 700 },       // 48px / 56px
  },
  
  // Letter spacing (Apple uses tight tracking)
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
  
  // Text transforms
  transform: {
    none: 'none',
    uppercase: 'uppercase',
    capitalize: 'capitalize',
  },
} as const;

// ============================================================================
// FOUNDATION: BORDER RADIUS (Apple rounded corners)
// ============================================================================

export const borderRadius = {
  // Apple uses consistent rounded corners
  none: '0',
  sm: '0.375rem',    // 6px - Small elements
  md: '0.5rem',      // 8px - Buttons, inputs
  lg: '0.75rem',    // 12px - Cards, dialogs
  xl: '1rem',        // 16px - Large cards, panels
  '2xl': '1.5rem',   // 24px - Extra large
  full: '9999px',   // Pill shape
  
  // Special rounded styles
  circle: '50%',
  
  // Apple-specific (macOS Big Sur+ uses 12-14px for most elements)
  apple: {
    button: '0.625rem',   // 10px
    card: '0.875rem',    // 14px
    dialog: '1rem',      // 16px
    sheet: '1.25rem',    // 20px (macOS sheets)
    pill: '1rem',        // 16px for pills
  },
} as const;

// ============================================================================
// FOUNDATION: SHADOWS (Apple subtle, layered shadows)
// ============================================================================

export const shadows = {
  // Apple uses very subtle shadows with multiple layers
  none: 'none',
  
  // Light mode shadows
  light: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    lg: '0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
    xl: '0 8px 16px 0 rgba(0, 0, 0, 0.16), 0 4px 8px 0 rgba(0, 0, 0, 0.12)',
    
    // Floating/elevated elements
    float: {
      sm: '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      md: '0 8px 24px 0 rgba(0, 0, 0, 0.16)',
      lg: '0 16px 32px 0 rgba(0, 0, 0, 0.20)',
    },
    
    // Inner shadows for depth
    inner: {
      sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
  },
  
  // Dark mode shadows (darker, more pronounced)
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.20)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.32), 0 1px 2px 0 rgba(0, 0, 0, 0.20)',
    lg: '0 4px 8px 0 rgba(0, 0, 0, 0.40), 0 2px 4px 0 rgba(0, 0, 0, 0.28)',
    xl: '0 8px 16px 0 rgba(0, 0, 0, 0.48), 0 4px 8px 0 rgba(0, 0, 0, 0.36)',
    
    float: {
      sm: '0 4px 12px 0 rgba(0, 0, 0, 0.32)',
      md: '0 8px 24px 0 rgba(0, 0, 0, 0.40)',
      lg: '0 16px 32px 0 rgba(0, 0, 0, 0.48)',
    },
    
    inner: {
      sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.16)',
      md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.24)',
    },
  },
} as const;

// ============================================================================
// FOUNDATION: TRANSITIONS (Apple smooth, natural motion)
// ============================================================================

export const transitions = {
  // Timing functions (Apple uses cubic-bezier curves)
  easing: {
    // Standard ease in out (Apple default)
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Ease out (for elements exiting)
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    
    // Ease in (for elements entering)
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    
    // Spring-like (for interactive elements)
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // Linear (for loading indicators)
    linear: 'linear',
  },
  
  // Durations (Apple uses these standard durations)
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
    
    // Special durations
    spring: '500ms',
    bounce: '700ms',
  },
  
  // Predefined transitions
  default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ============================================================================
// FOUNDATION: Z-INDEX (Layering system)
// ============================================================================

export const zIndex = {
  // Apple layering system
  base: 0,
  raised: 1,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  maximum: 9999,
  
  // Canvas-specific
  canvas: {
    background: 0,
    edges: 1,
    nodes: 2,
    nodeControls: 3,
    nodePanel: 4,
    connection: 5,
    selection: 10,
    dragPreview: 50,
    contextMenu: 100,
  },
} as const;

// ============================================================================
// SEMANTIC TOKENS (Apple-inspired component tokens)
// ============================================================================

export const semanticTokens = {
  // Button variants
  button: {
    primary: {
      bg: 'colors.brand.primary',
      bgHover: 'colors.brand.primaryHover',
      bgActive: 'colors.brand.primaryActive',
      text: 'colors.light.text.primary',
      border: 'colors.brand.primary',
      shadow: 'shadows.light.sm',
    },
    secondary: {
      bg: 'colors.light.surfaceElevated',
      bgHover: 'colors.light.surfaceHover',
      bgActive: 'colors.light.surfaceActive',
      text: 'colors.brand.primary',
      border: 'colors.light.border',
      borderHover: 'colors.light.borderStrong',
    },
    ghost: {
      bg: 'transparent',
      bgHover: 'colors.light.surfaceHover',
      bgActive: 'colors.light.surfaceActive',
      text: 'colors.light.text.secondary',
      textHover: 'colors.light.text.primary',
    },
  },
  
  // Card variants
  card: {
    elevated: {
      bg: 'colors.light.surfaceElevated',
      border: 'colors.light.border',
      shadow: 'shadows.light.md',
    },
    bordered: {
      bg: 'colors.light.surface',
      border: 'colors.light.border',
      shadow: 'none',
    },
    flat: {
      bg: 'colors.light.surface',
      border: 'transparent',
      shadow: 'none',
    },
  },
  
  // Input states
  input: {
    default: {
      bg: 'colors.light.surface',
      border: 'colors.light.border',
      text: 'colors.light.text.primary',
      placeholder: 'colors.light.text.quaternary',
    },
    hover: {
      border: 'colors.light.borderStrong',
    },
    focus: {
      border: 'colors.brand.primary',
      shadow: '0 0 0 3px colors.brand.primarySubtle',
    },
    error: {
      border: 'colors.light.status.error',
    },
    disabled: {
      bg: 'colors.light.surface',
      border: 'colors.light.borderSubtle',
      text: 'colors.light.text.disabled',
    },
  },
} as const;

// ============================================================================
// ANIMATIONS (Apple-inspired micro-interactions)
// ============================================================================

export const animations = {
  // Fade animations
  fade: {
    in: 'fadeIn 200ms ease-out',
    out: 'fadeOut 200ms ease-in',
  },
  
  // Scale animations
  scale: {
    in: 'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    out: 'scaleOut 200ms ease-in',
  },
  
  // Slide animations
  slide: {
    up: 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    down: 'slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    left: 'slideLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    right: 'slideRight 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Bounce animations
  bounce: {
    subtle: 'bounceSubtle 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    strong: 'bounceStrong 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  
  // Spin animations
  spin: {
    slow: 'spinSlow 20s linear infinite',
    normal: 'spinNormal 1s linear infinite',
    fast: 'spinFast 0.5s linear infinite',
  },
  
  // Pulse animations
  pulse: {
    subtle: 'pulseSubtle 2s ease-in-out infinite',
    strong: 'pulseStrong 1s ease-in-out infinite',
  },
  
  // Glow animations
  glow: {
    primary: 'glowPrimary 2s ease-in-out infinite',
    accent: 'glowAccent 2s ease-in-out infinite',
  },
} as const;

// ============================================================================
// RESPONSIVE BREAKPOINTS (Apple device sizes)
// ============================================================================

export const breakpoints = {
  // Mobile devices
  xs: '320px',   // iPhone SE
  sm: '375px',   // iPhone 12/13/14
  md: '428px',   // iPhone 14 Pro Max
  
  // Tablet devices
  lg: '768px',   // iPad (Portrait)
  xl: '834px',   // iPad (Landscape split view)
  
  // Desktop devices
  '2xl': '1024px',  // iPad Pro (Portrait)
  '3xl': '1366px',  // iPad Pro (Landscape)
  '4xl': '1440px',  // MacBook Air
  '5xl': '1600px',  // MacBook Pro 14"
  '6xl': '2048px',  // MacBook Pro 16"
  '7xl': '2560px',  // iMac 27"
  
  // Media queries
  isMobile: '(max-width: 767px)',
  isTablet: '(min-width: 768px) and (max-width: 1023px)',
  isDesktop: '(min-width: 1024px)',
  isLargeDesktop: '(min-width: 1440px)',
  
  // Touch vs mouse
  isTouch: '(hover: none) and (pointer: coarse)',
  isMouse: '(hover: hover) and (pointer: fine)',
  
  // Reduced motion
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Dark mode
  darkMode: '(prefers-color-scheme: dark)',
  
  // High contrast
  highContrast: '(prefers-contrast: high)',
} as const;

// ============================================================================
// ACCESSIBILITY TOKENS
// ============================================================================

export const accessibility = {
  // Focus styles
  focus: {
    visible: {
      outline: '2px solid colors.brand.primary',
      outlineOffset: '2px',
    },
    ring: {
      width: '3px',
      color: 'colors.brand.primary',
      offset: '2px',
    },
  },
  
  // ARIA attributes
  aria: {
    hidden: 'aria-hidden="true"',
    label: 'aria-label',
    describedby: 'aria-describedby',
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    disabled: 'aria-disabled',
    pressed: 'aria-pressed',
    checked: 'aria-checked',
    controls: 'aria-controls',
    hasPopup: 'aria-haspopup',
    live: 'aria-live',
    atomic: 'aria-atomic',
    relevant: 'aria-relevant',
  },
  
  // Keyboard navigation
  keyboard: {
    focusable: 'tabindex="0"',
    notFocusable: 'tabindex="-1"',
    enterKey: 'Enter',
    spaceKey: ' ',
    escapeKey: 'Escape',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
  },
  
  // Screen reader only
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  },
  
  // Skip link
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: '0',
    background: 'colors.brand.primary',
    color: 'colors.light.text.primary',
    padding: '8px 16px',
    zIndex: '9999',
    transition: 'top 200ms ease-in-out',
    focus: {
      top: '0',
    },
  },
} as const;

// ============================================================================
// EXPORT
// ============================================================================

export const appleDesignSystem = {
  spacing,
  colors,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  semanticTokens,
  animations,
  breakpoints,
  accessibility,
};

export default appleDesignSystem;
