# BA WorkXP Complete Colour Inventory

## Overview
This document provides a comprehensive inventory of all colours used across the BA WorkXP application, including primary brand colours, neutral palettes, status colours, and special-use colours found in components, email templates, and CSS variables.

---

## PRIMARY COLOURS

### Main Brand Purple
- **#7c3aed** (`purple-700`)
  - **Usage**: Primary brand colour, main buttons, CTAs, email headings, links
  - **RGB**: `rgb(124, 58, 237)`
  - **HSL**: `hsl(262, 83%, 58%)` (matches `--purple-primary`)
  - **Found in**: 
    - All email templates (welcome, reset password, admin notifications)
    - Button backgrounds
    - Primary text/headings
    - Focus rings
    - Core learning content h3 tags

### Secondary Purple (Indigo)
- **#4f46e5** (`indigo-600`)
  - **Usage**: Secondary brand accent, gradients with primary purple, email headers
  - **RGB**: `rgb(79, 70, 229)`
  - **Found in**:
    - Admin reset password email header gradient
    - Contact form email header gradient
    - UI accent colours alongside purple

### Purple Gradient Variants
- **#9333ea** (`purple-600`)
  - **Usage**: Gradient start in email headers, alternate purple accent
  - **RGB**: `rgb(147, 51, 234)`
  - **Found in**: Email template gradients

- **#a855f7** (`purple-500`)
  - **Usage**: Light purple accent, dark mode accent primary
  - **RGB**: `rgb(168, 85, 247)`
  - **HSL Variable**: Used in CSS as `--accent-primary` for dark mode

- **#c084fc** (`purple-400`)
  - **Usage**: Light purple accent, dark mode accent secondary
  - **RGB**: `rgb(192, 132, 252)`
  - **HSL Variable**: Used in CSS as `--accent-secondary` for dark mode

- **#6b21a8** (`purple-800`)
  - **Usage**: Dark purple variant, used in gradients

- **#581c87** (`purple-900`)
  - **Usage**: Very dark purple, used in dark backgrounds

---

## SECONDARY COLOURS

### Special Magenta/Pink Gradient (BA-in-Action & Dashboard CTAs)
- **#ff09aa** (Magenta-Pink)
  - **Usage**: Primary CTA button colour, BA-in-Action page background gradient start
  - **RGB**: `rgb(255, 9, 170)`
  - **Found in**: Dashboard guided tour CTA, BA-in-Action page gradients

- **#ff3cbf** (Pink)
  - **Usage**: Gradient middle colour
  - **RGB**: `rgb(255, 60, 191)`
  - **Found in**: Button gradients, animation effects

- **#d238ff** (Purple-Pink)
  - **Usage**: Gradient end colour
  - **RGB**: `rgb(210, 56, 255)`
  - **Found in**: Button gradients, BA-in-Action page

- **#ff56c9** (Light Pink)
  - **Usage**: Gradient variant
  - **RGB**: `rgb(255, 86, 201)`
  - **Found in**: BA-in-Action background gradient

- **#c94bff** (Purple)
  - **Usage**: Gradient variant
  - **RGB**: `rgb(201, 75, 255)`
  - **Found in**: BA-in-Action background gradient end

- **#ff73d3** (Light Magenta-Pink)
  - **Usage**: Hover states, ring colours
  - **RGB**: `rgb(255, 115, 211)`

- **#d60081** (Deep Pink)
  - **Usage**: Text colour in light backgrounds
  - **RGB**: `rgb(214, 0, 129)`

- **#ff21b1** (Magenta)
  - **Usage**: Hover state variant
  - **RGB**: `rgb(255, 33, 177)`

- **#b52fff** (Purple)
  - **Usage**: Hover state gradient end
  - **RGB**: `rgb(181, 47, 255)`

### Dark Mode Magenta Variants
- **#7a0057** (Dark Magenta)
  - **Usage**: Dark mode background gradient start
  - **RGB**: `rgb(122, 0, 87)`

- **#6b008a** (Dark Purple)
  - **Usage**: Dark mode background gradient middle
  - **RGB**: `rgb(107, 0, 138)`

- **#4b0082** (Very Dark Purple)
  - **Usage**: Dark mode background gradient end
  - **RGB**: `rgb(75, 0, 130)`

- **#501538** (Very Dark Pink)
  - **Usage**: Dark mode card background
  - **RGB**: `rgb(80, 21, 56)`

- **#2d1027** (Almost Black Pink)
  - **Usage**: Dark mode card background variant
  - **RGB**: `rgb(45, 16, 39)`

- **#3c1550** (Dark Purple-Pink)
  - **Usage**: Dark mode card background variant
  - **RGB**: `rgb(60, 21, 80)`

- **#5b0050** (Dark Magenta Background)
  - **Usage**: Dark mode background for magenta text
  - **RGB**: `rgb(91, 0, 80)`

- **#ff8cd9** (Light Pink for Dark Mode)
  - **Usage**: Dark mode text colour for magenta backgrounds
  - **RGB**: `rgb(255, 140, 217)`

### Light Background Variants (Magenta/Pink)
- **#ffeff9** (Very Light Pink)
  - **Usage**: Light mode card background gradient start
  - **RGB**: `rgb(255, 239, 249)`

- **#fbe9ff** (Very Light Purple)
  - **Usage**: Light mode card background gradient end
  - **RGB**: `rgb(251, 233, 255)`

- **#ffebf7** (Light Pink)
  - **Usage**: Light mode background for pink text
  - **RGB**: `rgb(255, 235, 247)`

- **#ffe6f5** (Light Magenta)
  - **Usage**: Hover state background
  - **RGB**: `rgb(255, 230, 245)`

---

## NEUTRAL PALETTE

### Text Colours
- **#111827** (`gray-900`)
  - **Usage**: Primary text, headings (light mode)
  - **RGB**: `rgb(17, 24, 39)`
  - **Found in**: Email templates, core learning content headings

- **#1f2937** (`gray-800`)
  - **Usage**: Secondary text, dark text, dark backgrounds
  - **RGB**: `rgb(31, 41, 55)`
  - **Found in**: Email headings, dark mode code backgrounds, tooltips

- **#374151** (`gray-700`)
  - **Usage**: Tertiary text, borders (dark mode)
  - **RGB**: `rgb(55, 65, 81)`
  - **Found in**: Core learning content text, dark mode scrollbar

- **#4b5563** (`gray-600`)
  - **Usage**: Secondary text, muted text
  - **RGB**: `rgb(75, 85, 99)`
  - **Found in**: Email body text, form labels

- **#6b7280** (`gray-500`)
  - **Usage**: Muted text, secondary information, email footer text
  - **RGB**: `rgb(107, 114, 128)`
  - **Found in**: All email templates for secondary text and footers

- **#9ca3af** (`gray-400`)
  - **Usage**: Very muted text, email footer text
  - **RGB**: `rgb(156, 163, 175)`
  - **Found in**: Email templates, scrollbar thumb

- **#d1d5db** (`gray-300`)
  - **Usage**: Light text on dark backgrounds, dark mode text
  - **RGB**: `rgb(209, 213, 219)`

### Background Colours
- **#ffffff** (`white`)
  - **Usage**: Primary background (light mode), email content areas
  - **RGB**: `rgb(255, 255, 255)`
  - **Found in**: All email templates

- **#f9fafb** (`gray-50`)
  - **Usage**: Very light background, email container backgrounds
  - **RGB**: `rgb(249, 250, 251)`
  - **Found in**: Email templates, form backgrounds

- **#f3f4f6** (`gray-100`)
  - **Usage**: Light gray backgrounds, card backgrounds, email sections
  - **RGB**: `rgb(243, 244, 246)`
  - **Found in**: Email templates, help email background

- **#e5e7eb** (`gray-200`)
  - **Usage**: Borders, dividers, scrollbar track
  - **RGB**: `rgb(229, 231, 235)`
  - **Found in**: Email borders, scrollbar styling

### Dark Mode Backgrounds
- **#1e1b2e** (Dark Purple Background)
  - **Usage**: Primary dark mode background
  - **RGB**: `rgb(30, 27, 46)`
  - **CSS Variable**: `--bg-primary`

- **#2d1b69** (Dark Purple Secondary)
  - **Usage**: Secondary dark mode background, card backgrounds
  - **RGB**: `rgb(45, 27, 105)`
  - **CSS Variable**: `--bg-secondary`

- **#3b2a6b** (Dark Purple Tertiary)
  - **Usage**: Tertiary dark mode background, card backgrounds
  - **RGB**: `rgb(59, 42, 107)`
  - **CSS Variable**: `--bg-tertiary`

- **#1a1625** (Admin Dark Background)
  - **Usage**: Admin-specific dark background (even darker)
  - **RGB**: `rgb(26, 22, 37)`
  - **CSS Variable**: `--admin-bg-primary`

### Dark Mode Text
- **#f8fafc** (`gray-50`)
  - **Usage**: Primary text (dark mode)
  - **RGB**: `rgb(248, 250, 252)`
  - **CSS Variable**: `--text-primary`

- **#e2e8f0** (`gray-200`)
  - **Usage**: Secondary text (dark mode)
  - **RGB**: `rgb(226, 232, 240)`
  - **CSS Variable**: `--text-secondary`

### Special Dark Mode Colours (Voice Meeting)
- **#0D0D0D** (Very Dark Gray)
  - **Usage**: Voice meeting dark background
  - **RGB**: `rgb(13, 13, 13)`

- **#1A1A1A** (Dark Gray)
  - **Usage**: Voice meeting component background
  - **RGB**: `rgb(26, 26, 26)`

- **#242424** (Medium Dark Gray)
  - **Usage**: Voice meeting card backgrounds
  - **RGB**: `rgb(36, 36, 36)`

- **#292929** (Slightly Lighter Gray)
  - **Usage**: Voice meeting UI elements
  - **RGB**: `rgb(41, 41, 41)`

- **#3A3A3A** (Border Gray)
  - **Usage**: Voice meeting borders
  - **RGB**: `rgb(58, 58, 58)`

- **#121212** (Dark Background)
  - **Usage**: Voice meeting modal backgrounds
  - **RGB**: `rgb(18, 18, 18)`

### Special Colours (Orientation Page)
- **#464775** (Deep Blue-Purple)
  - **Usage**: BA-in-Action orientation page header/buttons
  - **RGB**: `rgb(70, 71, 117)`

- **#5b5d8f** (Light Blue-Purple)
  - **Usage**: Gradient end for orientation page
  - **RGB**: `rgb(91, 93, 143)`

- **#3d3f63** (Darker Blue-Purple)
  - **Usage**: Hover state for orientation buttons
  - **RGB**: `rgb(61, 63, 99)`

---

## STATUS COLOURS

### Success
- **#10b981** (`emerald-500`)
  - **Usage**: Success states, completed items
  - **RGB**: `rgb(16, 185, 129)`
  - **Found in**: Career journey completed phases

### Warning/Info
- **#f59e0b** (`amber-500`)
  - **Usage**: Warning states, amber accents
  - **RGB**: `rgb(245, 158, 11)`

### Error/Danger
- **#ef4444** (`red-500`) - Implied from Tailwind usage
  - **Usage**: Error states, danger actions
  - **RGB**: `rgb(239, 68, 68)`

### Primary Action Blue
- **#3b82f6** (`blue-500`)
  - **Usage**: Focus rings, primary actions
  - **RGB**: `rgb(59, 130, 246)`
  - **Found in**: Focus styles, loading spinners

- **#60a5fa** (`blue-400`)
  - **Usage**: Dark mode focus rings
  - **RGB**: `rgb(96, 165, 250)`

---

## GRADIENT COLOURS (From Tailwind Safelist)

The following colours are used in gradient combinations for Core Concepts cards:

### Purple/Indigo Family
- `purple-500` (#a855f7), `purple-600` (#9333ea), `indigo-500` (#6366f1), `indigo-600` (#4f46e5), `violet-500` (#8b5cf6), `violet-600` (#9333ea)

### Blue/Cyan Family
- `blue-500` (#3b82f6), `blue-600` (#2563eb), `cyan-500` (#06b6d4), `cyan-600` (#0891b2), `teal-500` (#14b8a6), `teal-600` (#0d9488)

### Green/Emerald Family
- `green-500` (#22c55e), `green-600` (#16a34a), `emerald-500` (#10b981), `emerald-600` (#059669), `lime-500` (#84cc16)

### Orange/Red Family
- `orange-500` (#f97316), `orange-600` (#ea580c), `red-500` (#ef4444), `red-600` (#dc2626), `rose-500` (#f43f5e), `rose-600` (#e11d48), `pink-500` (#ec4899), `pink-600` (#db2777), `fuchsia-600` (#c026d3)

### Yellow/Amber Family
- `yellow-500` (#eab308), `yellow-600` (#ca8a04), `amber-500` (#f59e0b), `amber-600` (#d97706)

### Gray/Slate Family
- `slate-500` (#64748b), `slate-600` (#475569), `gray-500` (#6b7280), `gray-600` (#4b5563)

---

## CSS VARIABLES (HSL Format)

Defined in `src/index.css`:

### Purple Palette
- `--purple-primary`: `262 83% 58%` (equivalent to #7c3aed)
- `--purple-secondary`: `252 100% 72%`

### Green Palette
- `--green-primary`: `142 76% 36%`
- `--green-secondary`: `125 100% 45%`

### Orange Palette
- `--orange-primary`: `24 95% 53%`
- `--orange-secondary`: `13 100% 62%`

### Blue Palette
- `--blue-primary`: `217 91% 60%`
- `--blue-secondary`: `199 89% 48%`

### Red Palette
- `--red-primary`: `0 84% 60%`
- `--red-secondary`: `0 91% 71%`

### Purple Scale (Tailwind)
- `--purple-50`: #faf5ff
- `--purple-100`: #f3e8ff
- `--purple-200`: #e9d5ff
- `--purple-300`: #d8b4fe
- `--purple-400`: #c084fc
- `--purple-500`: #a855f7
- `--purple-600`: #9333ea
- `--purple-700`: #7c3aed
- `--purple-800`: #6b21a8
- `--purple-900`: #581c87
- `--purple-950`: #3b0764

---

## EMAIL TEMPLATE COLOUR SCHEME

### Primary Email Colours
- **Heading Colour**: `#7c3aed` (purple-700)
- **Button Background**: `#7c3aed` (purple-700)
- **Button Text**: `white`
- **Body Text**: `#4b5563` (gray-600)
- **Secondary Text**: `#6b7280` (gray-500)
- **Footer Text**: `#9ca3af` (gray-400)
- **Background**: `#ffffff` (white)
- **Section Background**: `#f3f4f6` (gray-100)
- **Border**: `#e5e7eb` (gray-200)

### Email Header Gradient (Admin Reset Password)
- **Gradient Start**: `#7c3aed` (purple-700)
- **Gradient End**: `#4f46e5` (indigo-600)
- **Header Text**: `white`

---

## COLOUR USAGE SUMMARY

### Most Frequently Used Colours (Top 10)
1. **#7c3aed** - Primary brand purple (buttons, CTAs, email headings)
2. **#6b7280** - Muted gray text (email footers, secondary text)
3. **#ffffff** - White backgrounds (email content, light mode)
4. **#1f2937** - Dark text/backgrounds (email headings, dark mode)
5. **#4b5563** - Secondary text (email body text)
6. **#e5e7eb** - Borders/dividers (email borders, UI borders)
7. **#ff09aa** - Magenta CTA (Dashboard, BA-in-Action)
8. **#a855f7** - Light purple accent (dark mode, UI accents)
9. **#f3f4f6** - Light backgrounds (email sections, cards)
10. **#9ca3af** - Very muted text (email footers)

---

## COLOUR CONFLICTS & NOTES

### Duplicated Shades
- Multiple purple shades (`purple-500`, `purple-600`, `purple-700`) - intentional for gradient/UI hierarchy
- Gray palette has many similar shades - intentional for text hierarchy

### Inconsistent Usage
- **#ff09aa** magenta gradient used only in Dashboard/BA-in-Action - consider standardizing or documenting as special-use
- Voice Meeting uses custom dark grays (#0D0D0D, #1A1A1A, etc.) - intentional for dark UI

### Recommendations
1. **Standardize email templates** to use primary purple (#7c3aed) consistently
2. **Document magenta gradient** (#ff09aa family) as special marketing/CTA colours
3. **Use CSS variables** for frequently used colours to ensure consistency
4. **Create colour token system** for easier maintenance

---

## DARK MODE COLOUR MAPPING

### Light → Dark Mode
- Text: `#111827` → `#f8fafc`
- Secondary Text: `#6b7280` → `#e2e8f0`
- Background: `#ffffff` → `#1e1b2e`
- Card Background: `#f9fafb` → `#2d1b69`
- Border: `#e5e7eb` → `#374151`
- Primary Accent: `#7c3aed` → `#a855f7`

---

## SPECIAL USE CASES

### BA-in-Action Page
- Background: Gradient from `#ff09aa` → `#ff56c9` → `#c94bff`
- Dark Mode: Gradient from `#7a0057` → `#6b008a` → `#4b0082`
- Buttons: Gradient `#ff09aa` → `#ff3cbf` → `#d238ff`

### Dashboard CTA Card
- Background: Gradient `#ffeff9` → `white` → `#fbe9ff`
- Dark Mode: Gradient `#501538` → `#2d1027` → `#3c1550`
- Button: Gradient `#ff09aa` → `#ff3cbf` → `#d238ff`

### Voice Meeting Component
- Dark theme only: Uses custom dark grays (#0D0D0D, #1A1A1A, #242424, #292929)
- Active speaker glow: `#00FFFF` (cyan)

---

## COLOUR ACCESSIBILITY NOTES

- Primary purple (#7c3aed) on white has good contrast (WCAG AA compliant)
- Gray text (#6b7280) on white may need larger font sizes for readability
- Dark mode text (#f8fafc) on dark backgrounds (#1e1b2e) has excellent contrast
- Magenta gradients (#ff09aa) should be used carefully with text overlay

---

**Document Generated**: Complete colour inventory for BA WorkXP brand system
**Last Updated**: 2025-01-13
**Purpose**: Email template design system alignment

