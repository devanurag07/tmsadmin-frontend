// TryMyStyle Brand Theme Configuration
// This file contains all brand colors and can be easily modified to change the entire theme

export const brandTheme = {
  // Primary Brand Colors (30% darker)
  primary: {
    50: '#e6f7f7',
    100: '#b3e8e0',
    200: '#80d9c9',
    300: '#4dcaa2',
    400: '#1abb7b',
    500: '#0a6b5f',
    600: '#08554b',
    700: '#063f37',
    800: '#042923',
    900: '#02130f',
    950: '#010d0b',
  },

  // Dark Mode Primary Colors (30% darker)
  primaryDark: {
    50: '#e6f7f7',
    100: '#b3e8e0',
    200: '#80d9c9',
    300: '#4dcaa2',
    400: '#1abb7b',
    500: '#007d7d', // Darker for dark mode
    600: '#006b6b',
    700: '#005959',
    800: '#004747',
    900: '#003535',
    950: '#002323',
  },

  // Secondary Colors
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Accent Colors
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Brand Specific Colors (30% darker)
  brand: {
    primary: '#0a6b5f', // Main brand teal (30% darker)
    secondary: '#0a7a6a', // Brand blue (30% darker)
    accent: '#9a2f9f', // Brand pink (30% darker)
    dark: '#0f0f0f', // Darker text
    light: '#e6e6e6', // Darker light background
    white: '#ffffff',
    black: '#000000',
  }
}

// CSS Custom Properties for easy theme switching
export const generateThemeCSS = () => {
  return `
    :root {
      /* Primary Colors */
      --primary-50: ${brandTheme.primary[50]};
      --primary-100: ${brandTheme.primary[100]};
      --primary-200: ${brandTheme.primary[200]};
      --primary-300: ${brandTheme.primary[300]};
      --primary-400: ${brandTheme.primary[400]};
      --primary-500: ${brandTheme.primary[500]};
      --primary-600: ${brandTheme.primary[600]};
      --primary-700: ${brandTheme.primary[700]};
      --primary-800: ${brandTheme.primary[800]};
      --primary-900: ${brandTheme.primary[900]};
      --primary-950: ${brandTheme.primary[950]};
      
      /* Secondary Colors */
      --secondary-50: ${brandTheme.secondary[50]};
      --secondary-100: ${brandTheme.secondary[100]};
      --secondary-200: ${brandTheme.secondary[200]};
      --secondary-300: ${brandTheme.secondary[300]};
      --secondary-400: ${brandTheme.secondary[400]};
      --secondary-500: ${brandTheme.secondary[500]};
      --secondary-600: ${brandTheme.secondary[600]};
      --secondary-700: ${brandTheme.secondary[700]};
      --secondary-800: ${brandTheme.secondary[800]};
      --secondary-900: ${brandTheme.secondary[900]};
      --secondary-950: ${brandTheme.secondary[950]};
      
      /* Accent Colors */
      --accent-50: ${brandTheme.accent[50]};
      --accent-100: ${brandTheme.accent[100]};
      --accent-200: ${brandTheme.accent[200]};
      --accent-300: ${brandTheme.accent[300]};
      --accent-400: ${brandTheme.accent[400]};
      --accent-500: ${brandTheme.accent[500]};
      --accent-600: ${brandTheme.accent[600]};
      --accent-700: ${brandTheme.accent[700]};
      --accent-800: ${brandTheme.accent[800]};
      --accent-900: ${brandTheme.accent[900]};
      --accent-950: ${brandTheme.accent[950]};
      
      /* Neutral Colors */
      --neutral-50: ${brandTheme.neutral[50]};
      --neutral-100: ${brandTheme.neutral[100]};
      --neutral-200: ${brandTheme.neutral[200]};
      --neutral-300: ${brandTheme.neutral[300]};
      --neutral-400: ${brandTheme.neutral[400]};
      --neutral-500: ${brandTheme.neutral[500]};
      --neutral-600: ${brandTheme.neutral[600]};
      --neutral-700: ${brandTheme.neutral[700]};
      --neutral-800: ${brandTheme.neutral[800]};
      --neutral-900: ${brandTheme.neutral[900]};
      --neutral-950: ${brandTheme.neutral[950]};
      
      /* Success Colors */
      --success-50: ${brandTheme.success[50]};
      --success-100: ${brandTheme.success[100]};
      --success-200: ${brandTheme.success[200]};
      --success-300: ${brandTheme.success[300]};
      --success-400: ${brandTheme.success[400]};
      --success-500: ${brandTheme.success[500]};
      --success-600: ${brandTheme.success[600]};
      --success-700: ${brandTheme.success[700]};
      --success-800: ${brandTheme.success[800]};
      --success-900: ${brandTheme.success[900]};
      --success-950: ${brandTheme.success[950]};
      
      /* Warning Colors */
      --warning-50: ${brandTheme.warning[50]};
      --warning-100: ${brandTheme.warning[100]};
      --warning-200: ${brandTheme.warning[200]};
      --warning-300: ${brandTheme.warning[300]};
      --warning-400: ${brandTheme.warning[400]};
      --warning-500: ${brandTheme.warning[500]};
      --warning-600: ${brandTheme.warning[600]};
      --warning-700: ${brandTheme.warning[700]};
      --warning-800: ${brandTheme.warning[800]};
      --warning-900: ${brandTheme.warning[900]};
      --warning-950: ${brandTheme.warning[950]};
      
      /* Error Colors */
      --error-50: ${brandTheme.error[50]};
      --error-100: ${brandTheme.error[100]};
      --error-200: ${brandTheme.error[200]};
      --error-300: ${brandTheme.error[300]};
      --error-400: ${brandTheme.error[400]};
      --error-500: ${brandTheme.error[500]};
      --error-600: ${brandTheme.error[600]};
      --error-700: ${brandTheme.error[700]};
      --error-800: ${brandTheme.error[800]};
      --error-900: ${brandTheme.error[900]};
      --error-950: ${brandTheme.error[950]};
      
      /* Brand Specific */
      --brand-primary: ${brandTheme.brand.primary};
      --brand-secondary: ${brandTheme.brand.secondary};
      --brand-accent: ${brandTheme.brand.accent};
      --brand-dark: ${brandTheme.brand.dark};
      --brand-light: ${brandTheme.brand.light};
      --brand-white: ${brandTheme.brand.white};
      --brand-black: ${brandTheme.brand.black};
    }
  `
}

// Tailwind CSS configuration for the brand theme
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: brandTheme.primary,
        secondary: brandTheme.secondary,
        accent: brandTheme.accent,
        neutral: brandTheme.neutral,
        success: brandTheme.success,
        warning: brandTheme.warning,
        error: brandTheme.error,
        brand: brandTheme.brand,
      },
    },
  },
} 