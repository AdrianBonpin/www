# Hero Rain Refactor & Entry Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the Hero Rain canvas component to use the site's design tokens, replace the opaque-background canvas with a fully transparent grid-always-visible ASCII rain overlay, expand the symbol set, and add gradual anime.js fade-in animations on page entry.

**Architecture:** The Hero Rain component (`src/components/hero-rain.astro`) is a self-contained Astro island with a `<canvas>` and an inline `<script>` containing the entire `AsciiLiquid` class. We will refactor the rendering model: instead of a solid background fill with particles driving character visibility, every grid cell will always show a character whose *color alpha* is driven by particle density — text always visible, rain is the color. The entry animations will live in a new `<script>` in `src/pages/index.astro` using anime.js v4, targeting the hero section elements (`h1`, `#ascii-container`, scroll hint).

**Tech Stack:** Astro v5, Canvas 2D API, anime.js v4.2.2 (already installed), Tailwind CSS v4, TypeScript

---

## Context: Current State

| Item | Current value | Problem |
|---|---|---|
| Canvas background | `#f4f6ff` (hardcoded light lavender) | Clashes with dark site `#18122B`; not a design token |
| Text color | `#eb8317` (hardcoded orange) | Not a design token |
| Render model | Background fill + draw chars only where density > 0.3 | Empty cells = empty → no "always visible grid" |
| Symbol set | `[" ", "·", ":", "o", "x", "%", "#", "@"]` | Sparse, non-grid-filling, includes space as index 0 which skips rendering |
| Animations | None | Page loads flat; anime.js is installed but unused |

## Design Token Reference

Read from `src/styles/global.css` `:root`:

```
--primary:    #635985   (muted purple)
--secondary:  #443C68   (deep purple)
--background: #18122B   (near-black dark purple) ← canvas should match this
--accent:     #393053   (mid dark purple)
--text:       #F4F4F4   (near-white)
```

These are also exposed as CSS custom properties on `:root`, so we can read them at runtime via `getComputedStyle(document.documentElement).getPropertyValue('--primary')`.

---

## Task 1: Transparent Canvas Background + Design Token Colors

**Goal:** Make the canvas transparent (so the site's `bg-background` shows through) and wire color reads from CSS custom properties instead of hardcoded hex strings.

**Files:**
- Modify: `src/components/hero-rain.astro`

### Step 1: Make canvas transparent

In `render()` (line 322), replace the solid fill with a `clearRect`:

```typescript
// BEFORE (line 322-323):
this.ctx.fillStyle = "#f4f6ff"
this.ctx.fillRect(0, 0, this.width, this.height)

// AFTER:
this.ctx.clearRect(0, 0, this.width, this.height)
```

### Step 2: Read colors from CSS custom properties

Add a helper method to `AsciiLiquid` that reads the site's tokens at runtime:

```typescript
private getCSSColor(variable: string, fallback: string): string {
    const val = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim()
    return val || fallback
}
```

### Step 3: Update CONFIG to remove hardcoded colors

Remove `textColor: "#eb8317"` from `CONFIG`. Colors will be derived per-render from CSS vars. Add a `colors` object to the class instance:

```typescript
private colors: {
    dim: string      // --accent  (#393053) — low-density chars
    mid: string      // --primary (#635985) — medium-density chars
    bright: string   // --text    (#F4F4F4) — high-density chars (where rain is)
}
```

Initialize in `init()`:

```typescript
this.colors = {
    dim:    this.getCSSColor('--accent',    '#393053'),
    mid:    this.getCSSColor('--primary',   '#635985'),
    bright: this.getCSSColor('--text',      '#F4F4F4'),
}
```

### Step 4: Update the canvas element to have transparent background

Add `style="background: transparent"` to the `<canvas>` element in the Astro template, and ensure the container has no background.

**Verify manually:** Open the browser. The canvas area should now blend into the dark site background — no bright white/lavender panel.

### Step 5: Commit

```bash
git add src/components/hero-rain.astro
git commit -m "feat(hero-rain): transparent canvas, read colors from CSS design tokens"
```

---

## Task 2: Always-Visible Grid Rendering + Density-Driven Color

**Goal:** Every grid cell always renders a character. Particle density determines the character's color (dim → bright), not whether it appears at all. This creates an omnipresent grid where the rain effect is expressed through *color contrast*, not character presence.

**Files:**
- Modify: `src/components/hero-rain.astro`

### Step 1: Expand and redesign the symbol set

Replace the current `densityMap` with a new array of characters that all have strong visual weight and render cleanly at 20px monospace in a grid. Remove the leading `" "` (empty) — every cell will now always draw.

```typescript
// BEFORE:
densityMap: [" ", "·", ":", "o", "x", "%", "#", "@"],

// AFTER:
// Index 0 = least density (dim background), highest index = most rain presence
densityMap: ["·", "+", "=", "I", "T", "H", "O", "#", "@", "█"],
```

**Character selection rationale:**
- `·` — barely there, background texture
- `+` — simple cross, reads well at small sizes
- `=` — horizontal bar, grid-friendly
- `I` — tall, readable, fills cell height
- `T` — top-heavy, good contrast
- `H` — wide, symmetric, high visual weight
- `O` — circular, good at grid scale
- `#` — lattice, classic rain symbol
- `@` — complex, high density signal
- `█` — full block, maximum presence (peak density)

### Step 2: Redesign `render()` — always draw every cell, color by density

The new render loop:
1. Clear canvas (transparent)
2. Build density grid as before (Float32Array)
3. For every cell (not just val > 0.3), determine a color based on density
4. Draw character

```typescript
render() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    const grid = new Float32Array(this.cols * this.rows).fill(0)

    for (let p of this.particles) {
        const c = Math.floor(p.x / CONFIG.charSize)
        const r = Math.floor(p.y / CONFIG.charSize)
        if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
            const idx = r * this.cols + c
            grid[idx] += 1
            if (c + 1 < this.cols) grid[idx + 1] += 0.4
            if (c - 1 >= 0)        grid[idx - 1] += 0.4
            if (r + 1 < this.rows) grid[idx + this.cols] += 0.4
            if (r - 1 >= 0)        grid[idx - this.cols] += 0.4
        }
    }

    this.ctx.font = `${CONFIG.charSize}px monospace`
    this.ctx.textBaseline = "middle"
    this.ctx.textAlign = "center"

    const mapLen = CONFIG.densityMap.length

    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            const val = grid[r * this.cols + c]

            // Map density to char index
            const charIdx = Math.min(
                Math.floor(val),
                mapLen - 1
            )
            const char = CONFIG.densityMap[charIdx]

            // Map density to color
            // 0 → dim (accent), 1-2 → mid (primary), 3+ → bright (text)
            if (val < 1) {
                this.ctx.fillStyle = this.colors.dim
            } else if (val < 3) {
                this.ctx.fillStyle = this.colors.mid
            } else {
                this.ctx.fillStyle = this.colors.bright
            }

            this.ctx.fillText(
                char,
                c * CONFIG.charSize + CONFIG.charSize / 2,
                r * CONFIG.charSize + CONFIG.charSize / 2
            )
        }
    }
}
```

**Note on font:** Replace `monospace` with `'Fusion Pixel 12px Monospaced JP'` to match the site's pixel font and give the rain a distinctive look consistent with the brand.

```typescript
this.ctx.font = `${CONFIG.charSize}px 'Fusion Pixel 12px Monospaced JP', monospace`
```

### Step 3: Tune charSize for grid density

With every cell always visible, a smaller `charSize` creates a denser, more atmospheric grid. Recommend reducing from `20` to `16`:

```typescript
charSize: 16,
```

This increases the number of visible characters, making the effect feel more like a proper rain display than sparse particle markers. The interaction radius should be adjusted proportionally:

```typescript
interactionRadius: 11,  // was 14, scaled with charSize reduction
```

### Step 4: Verify visually

- All grid cells should show characters at all times
- Cells without rain nearby should be dim (accent purple, barely visible)
- Cells with rain should glow brighter (primary purple → near-white)
- The effect should look like glowing characters raining down on a dark grid

### Step 5: Commit

```bash
git add src/components/hero-rain.astro
git commit -m "feat(hero-rain): always-visible grid with density-driven color, expanded symbol set"
```

---

## Task 3: Hero Rain Polish & Additional Improvements

**Goal:** Apply several UX and performance improvements identified during the refactor.

**Files:**
- Modify: `src/components/hero-rain.astro`

### Step 1: Use pixel font for canvas text

Already noted in Task 2, Step 2. The `Fusion Pixel 12px Monospaced JP` font must be loaded before the canvas draws. Since it's already imported in `base.astro` via `@fontsource/fusion-pixel-12px-monospaced-jp`, add a `document.fonts.ready` gate:

```typescript
// In the constructor, after `this.init()`:
document.fonts.ready.then(() => {
    this.loop()
})
// Remove the direct `this.loop()` call from constructor
```

Remove `this.loop()` from `init()` (it was called from the constructor after `init()`).

### Step 2: Add `data-canvas-ready` attribute for CSS fade-in hook

After the first render frame, set a data attribute on the container so CSS/anime.js can target it:

```typescript
loop() {
    this.updatePhysics()
    this.render()
    if (!this.container.dataset.canvasReady) {
        this.container.dataset.canvasReady = 'true'
    }
    requestAnimationFrame(() => this.loop())
}
```

### Step 3: Increase rain rate slightly for better visual effect

With a full grid always rendered, the rain "flow" needs to be more pronounced:

```typescript
rainRate: 0.05,           // was 0.03 — slightly faster recycling
stagnantThreshold: 2.5,   // was 2.0 — slightly more generous stagnant detection
```

### Step 4: Add a subtle velocity-based character lean (optional enhancement)

Track velocity per particle for a future enhancement — no change to current Particle interface needed now. Skip if it adds complexity; mark as "future".

### Step 5: Remove unused CONFIG key

Remove `textColor` from `CONFIG` entirely (was `#eb8317`), since colors now live on `this.colors`.

### Step 6: Commit

```bash
git add src/components/hero-rain.astro
git commit -m "feat(hero-rain): font-ready gate, rain rate tuning, cleanup stale CONFIG keys"
```

---

## Task 4: Entry Animations with anime.js

**Goal:** Add staggered fade-in animations when the page first loads. Target: navbar, hero h1, the rain canvas container, and the "Scroll Down" hint. Use anime.js v4 (already installed at `animejs` in package.json).

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/base.astro` (add `data-animate` attribute to navbar)

### Step 1: Understand anime.js v4 import syntax

anime.js v4 changed its API. Import as:

```typescript
import anime from 'animejs'
```

The timeline API in v4:

```typescript
const tl = anime.createTimeline({ defaults: { easing: 'easeOutExpo', duration: 800 } })
tl.add('#selector', { opacity: [0, 1], translateY: [20, 0] })
tl.add('#selector2', { opacity: [0, 1] }, '-=400') // overlap
```

### Step 2: Add `data-animate` identifiers to animatable elements

In `src/layouts/base.astro`, add `data-animate="navbar"` to the `<Navbar />` wrapper or directly to the `<nav>` inside `navbar.astro`. Check what wrapping element exists.

Actually — since we don't want to modify the navbar internals — add the attribute to the `<body>` and target selectors by existing class/id. Simpler: just use existing IDs and classes.

Elements to animate on entry (all already have selectors):
- `nav` — the fixed navbar (select by tag)
- `#top h1` — the hero heading
- `#ascii-container` — the rain canvas wrapper
- `#top > div` — the "Scroll Down" hint (last child div of #top section)

### Step 3: Add animation script to `src/pages/index.astro`

Add a `<script>` block at the end of the page content in `index.astro`:

```html
<script>
    import anime from 'animejs'

    // Set initial state — all targets start invisible
    const targets = [
        'nav',
        '#top h1',
        '#ascii-container',
        '#top > div:last-child',
    ]

    // Apply initial hidden state immediately (before first paint)
    targets.forEach(selector => {
        const el = document.querySelector(selector) as HTMLElement | null
        if (el) {
            el.style.opacity = '0'
            el.style.transform = 'translateY(12px)'
        }
    })

    // Wait for DOM + fonts ready, then animate
    document.addEventListener('DOMContentLoaded', () => {
        const tl = anime.createTimeline({
            defaults: {
                easing: 'easeOutExpo',
                duration: 900,
            }
        })

        // Navbar fades in first, slides down from slight offset
        tl.add('nav', {
            opacity: [0, 1],
            translateY: [-8, 0],
            duration: 600,
        })

        // Hero heading fades in with upward slide
        tl.add('#top h1', {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 900,
        }, '-=200')

        // Rain canvas fades in slightly after the heading
        tl.add('#ascii-container', {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 1000,
        }, '-=400')

        // Scroll hint fades in last
        tl.add('#top > div:last-child', {
            opacity: [0, 1],
            translateY: [8, 0],
            duration: 700,
        }, '-=200')
    })
</script>
```

### Step 4: Verify anime.js v4 timeline API

**Important:** anime.js v4 changed significantly from v3. Check the actual installed version's API before coding.

Run:
```bash
cat node_modules/animejs/package.json | grep '"version"'
```

If v4, the `anime.createTimeline()` API is correct. If the package exports differ, adjust the import. The v4 package entry point is typically `animejs` (ESM). Test that the import resolves:

```bash
bun run build 2>&1 | head -50
```

If import fails, try:
```typescript
import { animate, createTimeline } from 'animejs'
```

### Step 5: Handle `will-change` for animation performance

For the canvas container which is the most expensive to animate, add `will-change: opacity, transform` in CSS to promote it to its own compositor layer. Add to `global.css`:

```css
#ascii-container {
    will-change: opacity, transform;
}
```

Remove `will-change` after animation completes to free GPU memory. In the timeline `complete` callback:

```typescript
const tl = anime.createTimeline({
    defaults: { ... },
    onComplete: () => {
        const el = document.querySelector('#ascii-container') as HTMLElement | null
        if (el) el.style.willChange = 'auto'
    }
})
```

### Step 6: Verify animation feels correct

Check that:
- On first load, nothing flashes in — elements start at opacity 0
- Navbar slides in from top-8px → 0
- Heading fades up
- Rain canvas fades in (it's already animating internally, which is fine — it will gradually become visible)
- Scroll hint fades in last
- Total animation sequence ~1.5–2 seconds

### Step 7: Commit

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat(animations): anime.js entry fade-in sequence for hero section elements"
```

---

## Task 5: Final Integration Check & Build Verification

**Goal:** Ensure everything compiles cleanly, no TypeScript errors, and the build succeeds.

**Files:**
- No new changes — verification only

### Step 1: Run the dev server and visually inspect

```bash
bun run dev
```

Open `http://localhost:4321` (default Astro port). Verify:
- [ ] Page background is dark (`#18122B`) everywhere including the canvas area
- [ ] Canvas renders transparent — no bright panel
- [ ] Every grid cell shows a character (not just dense areas)
- [ ] Low-density cells: dim accent purple (`#393053`)
- [ ] High-density cells (rain): near-white (`#F4F4F4`)
- [ ] Characters include the new expanded set (`·`, `+`, `=`, `I`, `T`, `H`, `O`, `#`, `@`, `█`)
- [ ] Pixel font renders in canvas
- [ ] Mouse repulsion still works
- [ ] On page load: everything fades in sequentially
- [ ] No console errors

### Step 2: Run production build

```bash
bun run build
```

Expected: `✓ Built in X.XXs` with no errors.

If TypeScript errors appear about anime.js types, install the types or add a `// @ts-ignore` above the import as a last resort:

```bash
bun add -d @types/animejs
```

(Note: v4 may ship its own types — check `node_modules/animejs/types/` first.)

### Step 3: Final commit (if any fixups were needed)

```bash
git add -A
git commit -m "fix: resolve build errors from hero-rain refactor and animation integration"
```

---

## Additional Recommendations (Not in Scope But Worth Noting)

These were identified during analysis but are out of scope for this plan:

1. **Reduced motion support:** Wrap the anime.js sequence in `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)` to respect accessibility settings. If the user prefers reduced motion, skip animations and set elements to `opacity: 1` immediately.

2. **Canvas resolution scaling:** The canvas does not currently account for `devicePixelRatio`, meaning on high-DPI displays the characters may appear slightly blurry. Fix with:
   ```typescript
   this.canvas.width = this.width * dpr
   this.canvas.height = this.height * dpr
   this.canvas.style.width = this.width + 'px'
   this.canvas.style.height = this.height + 'px'
   this.ctx.scale(dpr, dpr)
   ```

3. **Color interpolation for smooth density gradient:** Instead of three discrete color buckets (dim/mid/bright), linearly interpolate between `--accent` and `--text` based on the normalized density value for a smooth glow effect. This would require parsing the hex colors into RGB and lerping.

4. **`visibility: hidden` instead of `opacity: 0` for FOUC prevention:** Using `opacity: 0` in JS can cause a brief flash if the script is slow. A more robust approach is to set `visibility: hidden` in CSS and remove it in JS after animation starts.

5. **Scroll-triggered re-entry animations for below-fold sections:** The projects and about sections could benefit from scroll-triggered fade-ins using `IntersectionObserver` + anime.js, consistent with the hero animation style.

---

## File Summary

| File | Change Type | Purpose |
|---|---|---|
| `src/components/hero-rain.astro` | Major refactor | Transparent canvas, CSS token colors, always-visible grid, new symbols, font gate |
| `src/pages/index.astro` | New script block | anime.js entry animation timeline |
| `src/styles/global.css` | Minor addition | `will-change` for animation performance |
