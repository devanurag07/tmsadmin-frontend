# TryMyStyle Brand Theme Customization Guide

This guide explains how to customize the brand theme for the TryMyStyle admin dashboard.

## 🎨 Theme Structure

The theme system is centralized in the following files:

- `lib/theme.ts` - Main theme configuration
- `app/globals.css` - CSS custom properties
- `components/theme-provider.tsx` - Theme switching functionality

## 🚀 Quick Customization

### 1. Primary Brand Colors

To change the main brand colors, edit `lib/theme.ts`:

```typescript
export const brandTheme = {
  primary: {
    50: "#fef7ff", // Lightest shade
    100: "#fdeeff",
    200: "#fbdfff",
    300: "#f8c0ff",
    400: "#f491ff",
    500: "#ed5aff", // Main brand color
    600: "#d91af9", // Primary brand color
    700: "#b80dd6",
    800: "#970eac",
    900: "#7c0e8a",
    950: "#4d0051", // Darkest shade
  },
  // ... other colors
};
```

### 2. Brand-Specific Colors

For quick brand color changes, modify the `brand` object:

```typescript
brand: {
  primary: '#d91af9',    // Main brand purple
  secondary: '#0ea5e9',  // Brand blue
  accent: '#d946ef',     // Brand pink
  dark: '#171717',       // Dark text
  light: '#fafafa',      // Light background
  white: '#ffffff',
  black: '#000000',
}
```

## 🎯 Color Palette Reference

### Current TryMyStyle Colors (30% Darker)

- **Primary Teal**: `#008585` - Main brand color
- **Secondary Blue**: `#0a7a6a` - Supporting color (30% darker)
- **Accent Pink**: `#9a2f9f` - Highlight color (30% darker)
- **Success Green**: `#1a8a4a` - Success states (30% darker)
- **Warning Orange**: `#cc6b08` - Warning states (30% darker)
- **Error Red**: `#cc3333` - Error states (30% darker)

### Color Usage Guidelines

1. **Primary**: Use for main actions, buttons, and brand elements
2. **Secondary**: Use for supporting elements and secondary actions
3. **Accent**: Use for highlights and special elements
4. **Neutral**: Use for text, backgrounds, and borders
5. **Success/Warning/Error**: Use for status indicators

## 🔧 Advanced Customization

### 1. Adding New Color Schemes

To add a new color scheme, add it to the `brandTheme` object:

```typescript
export const brandTheme = {
  // ... existing colors
  newColor: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    // ... add all shades
    950: "#082f49",
  },
};
```

### 2. Updating CSS Variables

After modifying `lib/theme.ts`, update the CSS variables in `app/globals.css`:

```css
:root {
  /* Add your new color variables */
  --new-color-50: #f0f9ff;
  --new-color-100: #e0f2fe;
  /* ... etc */
}
```

### 3. Dark Mode Customization

Dark mode colors are defined in the `.dark` class in `app/globals.css`:

```css
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  /* ... customize dark mode colors */
}
```

## 🎨 Component Theming

### Using Theme Colors in Components

```tsx
// Use semantic color classes
<button className="bg-primary text-primary-foreground">
  Primary Button
</button>

// Use specific color shades
<div className="bg-primary-500 text-white">
  Custom shade
</div>

// Use brand colors
<div className="bg-brand-primary text-white">
  Brand color
</div>
```

### Available Color Classes

- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-accent`, `text-accent`, `border-accent`
- `bg-success`, `text-success`, `border-success`
- `bg-warning`, `text-warning`, `border-warning`
- `bg-error`, `text-error`, `border-error`
- `bg-neutral-{shade}`, `text-neutral-{shade}`, `border-neutral-{shade}`

## 🌙 Theme Switching

The application includes a theme switcher that supports:

- **Light Mode**: Clean, bright interface with teal primary color
- **Dark Mode**: High-contrast dark interface optimized for readability
- **System Mode**: Automatically follows system preference

### Adding Theme Switcher

```tsx
import { ThemeSwitcher } from "@/components/theme-provider";

// Use in any component
<ThemeSwitcher />;
```

## 📱 Responsive Design

The theme automatically adapts to different screen sizes. Colors remain consistent across:

- Mobile devices
- Tablets
- Desktop screens
- High-DPI displays

## 🎯 Best Practices

1. **Consistency**: Always use the defined color palette
2. **Accessibility**: High contrast ratios for better readability
3. **Semantic Usage**: Use colors for their intended purpose
4. **Testing**: Test in both light and dark modes
5. **Documentation**: Update this guide when making changes
6. **No Gradients**: Use solid colors for better accessibility

## 🔄 Theme Updates

To update the entire theme:

1. Modify colors in `lib/theme.ts`
2. Update CSS variables in `app/globals.css`
3. Test in both light and dark modes
4. Update component usage if needed
5. Document changes in this guide

## 🎨 Color Psychology

- **Purple**: Creativity, luxury, innovation
- **Blue**: Trust, reliability, professionalism
- **Pink**: Energy, excitement, youth
- **Green**: Success, growth, health
- **Orange**: Warning, attention, energy
- **Red**: Error, danger, urgency

## 📋 Quick Reference

### File Locations

- Theme config: `lib/theme.ts`
- CSS variables: `app/globals.css`
- Theme provider: `components/theme-provider.tsx`

### Key Colors (30% Darker)

- Primary: `#008585`
- Secondary: `#0a7a6a`
- Accent: `#9a2f9f`
- Success: `#1a8a4a`
- Warning: `#cc6b08`
- Error: `#cc3333`

### Common Classes

- `bg-primary` - Primary background
- `text-primary` - Primary text
- `border-primary` - Primary border
- `hover:bg-primary/90` - Hover state

This theme system provides a consistent, professional appearance that reflects the TryMyStyle brand while maintaining flexibility for future customization.
