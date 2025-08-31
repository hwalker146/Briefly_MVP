// Design system tokens for Briefly MVP
export const colors = {
  // Background and surfaces
  background: 'bg-gray-50',
  surface: 'bg-white',
  
  // Text colors
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  
  // Accent colors
  accent: 'indigo-600',
  accentHover: 'indigo-700',
  accentMuted: 'indigo-100',
  accentText: 'text-indigo-600',
  
  // States
  error: 'red-600',
  success: 'green-600',
  warning: 'yellow-600',
  
  // Borders
  border: 'border-gray-100',
  borderStrong: 'border-gray-200',
} as const

export const typography = {
  // Font family
  fontFamily: 'font-inter',
  
  // Font weights
  fontNormal: 'font-normal', // 400
  fontMedium: 'font-semibold', // 600  
  fontBold: 'font-bold', // 700
  
  // Font sizes
  h1: 'text-[28px] leading-tight',
  h2: 'text-xl leading-tight',
  body: 'text-base leading-relaxed',
  small: 'text-[13px] leading-normal',
} as const

export const spacing = {
  // 8pt baseline grid
  xs: 'p-1', // 4px
  sm: 'p-2', // 8px
  md: 'p-3', // 12px
  lg: 'p-4', // 16px
  xl: 'p-6', // 24px
  xxl: 'p-8', // 32px
  
  // Margins
  marginXs: 'm-1',
  marginSm: 'm-2', 
  marginMd: 'm-3',
  marginLg: 'm-4',
  marginXl: 'm-6',
  marginXxl: 'm-8',
  
  // Gaps
  gapXs: 'gap-1',
  gapSm: 'gap-2',
  gapMd: 'gap-3', 
  gapLg: 'gap-4',
  gapXl: 'gap-6',
} as const

export const radius = {
  sm: 'rounded-md',
  md: 'rounded-lg', 
  full: 'rounded-full',
} as const

export const elevation = {
  card: 'shadow-sm',
  modal: 'shadow-lg',
  tooltip: 'shadow',
} as const

export const layout = {
  sidebarWidth: 'w-[260px]',
  maxContent: 'max-w-[1200px]',
  containerPadding: 'px-6 py-8',
  headerHeight: 'h-16',
} as const

// Component-specific tokens
export const components = {
  button: {
    primary: `inline-flex items-center px-4 py-2 ${radius.sm} text-white bg-${colors.accent} hover:bg-${colors.accentHover} ${typography.fontMedium} transition-colors`,
    secondary: `inline-flex items-center px-3 py-1 ${radius.sm} border ${colors.borderStrong} ${colors.textPrimary} hover:bg-gray-50 transition-colors`,
    ghost: `inline-flex items-center px-3 py-1 ${radius.sm} ${colors.textSecondary} hover:${colors.textPrimary} hover:bg-gray-50 transition-colors`,
  },
  
  card: `${colors.surface} border ${colors.border} ${radius.md} ${elevation.card}`,
  
  input: `block w-full px-3 py-2 border ${colors.border} ${radius.sm} ${colors.textPrimary} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-${colors.accent} focus:border-transparent`,
  
  focusRing: `focus:outline-none focus:ring-2 focus:ring-${colors.accent} focus:ring-offset-2`,
} as const