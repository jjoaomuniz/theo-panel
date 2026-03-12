# Theo Panel — Interface Design System

## Direction
**Feel:** Neural control center. Cold precision with traces of biological signal. Like a terminal that grew dendrites.
**User:** Developer / AI operator. Context: usually alone, late, monitoring live systems. Needs density over friendliness.
**Primary action:** Monitor and intervene — not explore.

## Depth Strategy
Borders-only. Shadows reserved for glow effects only (never elevation).
- Standard: `rgba(255,255,255,0.03)` — whisper quiet
- Hover: `rgba(255,255,255,0.06)`
- Glow emphasis: `rgba(139,92,246,0.15)`

## Surface Elevation
- Base canvas: `#06060b` (`--color-bg-primary`)
- Cards: `#0d0d16` (`--color-bg-card`) — same hue, slightly lifted
- Hover state: `#13131f` (`--color-bg-card-hover`)
- Elevated (modals/dropdowns): `#16162a` (`--color-bg-elevated`)

## Palette
- Accent primary: `#8b5cf6` (purple — signal, active state)
- Accent secondary: `#22d3ee` (cyan — data, links)
- Text: `#f1f5f9` / `#94a3b8` / `#475569` (3-level hierarchy)
- Success: `#34d399` | Warning: `#fbbf24` | Error: `#f87171`

## Typography
- Sans: Inter (body, labels)
- Mono: JetBrains Mono / Fira Code (data, IDs, code, identifiers)
- Tracking on headings: `tracking-[0.2em]` for brand; wide labels use `tracking-wider`

## Spacing
Base unit: 4px (`1` = 4px). Components use multiples of 4.

## Navigation
Sidebar same background as canvas. Separated by `border-white/[0.03]`.
Active state: `bg-accent-purple/10` + left `2px` bar.
Width: 224px expanded / 62px collapsed.

## Components
### Sidebar Nav Item
- Inactive: `text-text-muted hover:text-text-primary hover:bg-white/[0.02]`
- Active: `bg-accent-purple/10 text-accent-purple` + left bar indicator
- Collapsed: icons only, centered

### Cards
- `bg-bg-card border border-white/[0.03] rounded-xl`
- Hover lift: `card-hover` class (translateY -1px + purple border glow)

### Glass surfaces
- `.glass`: `backdrop-blur-md` + `rgba(13,13,22,0.85)` + `border-white/[0.04]`
- `.glass-subtle`: lighter variant

## Signature Elements
- **Neural Map** as homepage — graph of nodes representing the AI brain
- Pulsing status dots with ring animation (`animate-pulse-ring`)
- `THEO / NEURAL CONTROL` monospace brand lock-up
- Left-edge gradient accent on sidebar (`from-accent-purple/20 via-accent-cyan/10`)
- Text gradient: `linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)`
