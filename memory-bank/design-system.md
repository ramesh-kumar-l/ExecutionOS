# Design System — LENSSTACK + X10THINK

## Foundation

### Color Tokens (CSS Custom Properties)
```css
:root {
  /* Backgrounds */
  --bg-base: #0a0a0a;
  --bg-surface: #111111;
  --bg-elevated: #1a1a1a;
  --bg-overlay: #222222;

  /* Text */
  --text-primary: #f5f5f5;
  --text-secondary: #a3a3a3;
  --text-tertiary: #6b6b6b;
  --text-disabled: #404040;

  /* Accent (strategic blue) */
  --accent-default: #3b82f6;
  --accent-hover: #2563eb;
  --accent-subtle: rgba(59, 130, 246, 0.12);

  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #38bdf8;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.18);

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-md: 16px;
  --text-lg: 18px;
  --text-xl: 24px;
  --text-2xl: 32px;
}
```

### Light Theme Overrides
```css
[data-theme="light"] {
  --bg-base: #fafafa;
  --bg-surface: #ffffff;
  --bg-elevated: #f4f4f5;
  --bg-overlay: #e4e4e7;
  --text-primary: #0a0a0a;
  --text-secondary: #52525b;
  --text-tertiary: #a1a1aa;
  --border-subtle: rgba(0, 0, 0, 0.05);
  --border-default: rgba(0, 0, 0, 0.09);
  --border-strong: rgba(0, 0, 0, 0.15);
}
```

## Component Library (shadcn/ui base + custom)

### Core Primitives
- `Button` — variants: default, ghost, destructive, outline
- `Input` — with label, hint, error state
- `Textarea` — auto-resize variant
- `Select` — searchable dropdown
- `Badge` — status indicators
- `Separator` — horizontal/vertical dividers
- `Tooltip` — keyboard shortcut hints
- `Dialog` — modal for critical confirmations only
- `Popover` — inline contextual panels
- `ScrollArea` — styled scrollbar

### Layout Components
- `PageLayout` — standard three-column layout
- `SidebarLayout` — collapsible left nav
- `FocusLayout` — distraction-free full-screen
- `PanelLayout` — resizable split panels

### Domain-Specific Components
- `DomainCard` — domain overview with health indicator
- `GoalCard` — goal with progress and timeline
- `TimeBlockCard` — time block with status
- `FocusTimer` — Pomodoro-style focus session widget
- `ReflectionEditor` — structured journaling component
- `CommandPalette` — ⌘K universal search/navigation
- `AIPanel` — collapsible right-side AI context panel
- `ProgressRing` — circular progress indicator
- `BalanceWheel` — 12-domain radar/spider chart

## Tailwind Configuration
```javascript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Map CSS variables to Tailwind classes
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        accent: 'var(--accent-default)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
      },
    },
  },
};
```

## Framer Motion Variants
```typescript
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

export const slideIn = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -8 },
};
```

## Icon System
- Library: `lucide-react` (consistent, minimal, customizable)
- Size: 16px default, 20px for toolbar icons
- Stroke width: 1.5px
- Domain icons: custom emoji/lucide combination

## Domain Color Palette
```
Health:       #22c55e  (green)
Career:       #3b82f6  (blue)
Financial:    #f59e0b  (amber)
Intellectual: #8b5cf6  (violet)
Emotional:    #ec4899  (pink)
Spiritual:    #06b6d4  (cyan)
Relationships: #f97316 (orange)
Family:       #84cc16  (lime)
Social:       #a78bfa  (purple)
Character:    #f43f5e  (rose)
Lifestyle:    #14b8a6  (teal)
Legacy:       #6366f1  (indigo)
```
