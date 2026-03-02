# Hero Rain Follow-up Improvements

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden and optimize the `HeroRain` canvas component with a Float32Array allocation fix, graceful animation error handling, unit tests for core logic, and ARIA accessibility on the canvas.

**Architecture:** The component lives entirely in `src/components/hero-rain.astro` as an inline `<script>` block (the `AsciiLiquid` class). Tests will be extracted into a plain TypeScript utility module so Bun's test runner can import and verify them without a browser. The animation script lives in `src/pages/index.astro`.

**Tech Stack:** Astro v5, TypeScript, Bun (package manager + test runner), anime.js v4 named exports, Tailwind CSS v4, `@happy-dom/global-registrator` (jsdom-lite; used to provide `getComputedStyle` in tests)

---

## Task 1: Reuse Float32Array — allocate once, clear each frame

**Problem:** `render()` calls `new Float32Array(this.cols * this.rows).fill(0)` on every animation frame (~60×/sec). This allocates a new buffer every frame, creating GC pressure.

**Fix:** Allocate `this.grid` once in `init()` (or lazily in `resize()`), resize it when cols/rows change, and call `.fill(0)` at the start of each `render()` instead of allocating a new buffer.

**Files:**
- Modify: `src/components/hero-rain.astro` — `AsciiLiquid` class

**Step 1: Add `grid` field to the class declaration**

In `src/components/hero-rain.astro`, find the private field declarations block (lines 38-45) and add `private grid: Float32Array = new Float32Array(0)`.

Before:
```typescript
private cols: number = 0
private rows: number = 0
private colors!: {
    dim: string
    mid: string
    bright: string
}
```

After:
```typescript
private cols: number = 0
private rows: number = 0
private grid: Float32Array = new Float32Array(0)
private colors!: {
    dim: string
    mid: string
    bright: string
}
```

**Step 2: Reallocate `this.grid` inside `resize()` when dimensions change**

At the end of the `resize()` method (after the particle clamping loop), add:

```typescript
// Reallocate grid only when dimensions change
const needed = this.cols * this.rows
if (this.grid.length !== needed) {
    this.grid = new Float32Array(needed)
}
```

**Step 3: Update `render()` to reuse `this.grid`**

Replace the line:
```typescript
const grid = new Float32Array(this.cols * this.rows).fill(0)
```

With:
```typescript
this.grid.fill(0)
const grid = this.grid
```

**Step 4: Verify the build still passes**

```bash
bun run build
```

Expected: `dist/` directory written, no TypeScript errors, exit code 0.

**Step 5: Commit**

```bash
git add src/components/hero-rain.astro
git commit -m "perf(hero-rain): reuse Float32Array grid across frames to reduce GC pressure"
```

---

## Task 2: Graceful error handling for anime.js animation

**Problem:** If the `animejs` import fails (e.g., CDN/SSR/bundler issue), all hero elements stay `opacity: 0` and the page becomes blank for the user.

**Fix:** Wrap the entire animation block in `try/catch`. On any error, set all target elements to `opacity: 1` and remove their `transform` so the page is still readable. Also remove the `transform` style on animation complete to avoid stale inline styles.

**Files:**
- Modify: `src/pages/index.astro` — the `<script>` block

**Step 1: Extract target reset into a helper function and wrap in try/catch**

Replace the entire `<script>` block content with the following. The key changes are:
1. A `showAll()` helper that resets opacity and transform for all targets.
2. A `try/catch` around the timeline construction.
3. Cleanup of `transform` style (not just `willChange`) in `onComplete`.

```typescript
import { createTimeline } from 'animejs'

const targets = [
    'nav',
    '#top h1',
    '#ascii-container',
    '#scroll-hint',
]

function showAll() {
    targets.forEach(selector => {
        const el = document.querySelector(selector) as HTMLElement | null
        if (el) {
            el.style.opacity = '1'
            el.style.transform = ''
        }
    })
}

// Hide elements before animation begins
targets.forEach(selector => {
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(12px)'
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
        showAll()
        return
    }

    try {
        const tl = createTimeline({
            defaults: {
                ease: 'easeOutExpo',
                duration: 900,
            },
            onComplete: () => {
                const el = document.querySelector('#ascii-container') as HTMLElement | null
                if (el) {
                    el.style.willChange = 'auto'
                    el.style.transform = ''
                }
            }
        })

        tl.add('nav', {
            opacity: [0, 1],
            translateY: [-8, 0],
            duration: 600,
        })

        tl.add('#top h1', {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 900,
        }, '-=200')

        tl.add('#ascii-container', {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 1000,
        }, '-=400')

        tl.add('#scroll-hint', {
            opacity: [0, 1],
            translateY: [8, 0],
            duration: 700,
        }, '-=200')
    } catch {
        // If animation fails for any reason, make all elements visible immediately
        showAll()
    }
})
```

**Step 2: Verify the build still passes**

```bash
bun run build
```

Expected: exit code 0, no TypeScript errors.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "fix(animations): add try/catch fallback to show content if anime.js fails"
```

---

## Task 3: Unit tests for core AsciiLiquid logic

**Problem:** There are no unit tests. The `getCSSColor()` helper, density-to-color threshold mapping, and `calculateParticleCount()` clamping are logic-heavy and untested.

**Approach:** Extract testable pure functions into a separate TS module (`src/lib/hero-rain-utils.ts`) and import them from `hero-rain.astro`. Tests run with Bun's built-in test runner (`bun test`).

**Files:**
- Create: `src/lib/hero-rain-utils.ts`
- Modify: `src/components/hero-rain.astro` — import from the new module
- Create: `src/lib/hero-rain-utils.test.ts`

**Note on test environment:** `getCSSColor` calls `getComputedStyle(document.documentElement)`. In Bun's test environment there is no DOM. We stub it using a minimal mock inside the test file — no third-party jsdom needed.

### Step 1: Create `src/lib/hero-rain-utils.ts`

```typescript
// Pure utility functions extracted from AsciiLiquid for testability

export interface ColorThresholds {
    dim: string
    mid: string
    bright: string
}

/**
 * Reads a CSS custom property from the document root.
 * Returns `fallback` if the variable is not set or is empty.
 */
export function getCSSColor(variable: string, fallback: string): string {
    const val = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim()
    return val || fallback
}

/**
 * Maps a density grid value to the appropriate color string.
 * val < 1   → dim  (empty/sparse cell)
 * val < 3   → mid  (moderate density)
 * val >= 3  → bright (high density)
 */
export function densityToColor(val: number, colors: ColorThresholds): string {
    if (val < 1) return colors.dim
    if (val < 3) return colors.mid
    return colors.bright
}

/**
 * Clamps the calculated particle count to [min, max].
 */
export function clampParticleCount(
    width: number,
    density: number,
    min: number,
    max: number
): number {
    const count = Math.floor(width * density)
    return Math.max(min, Math.min(max, count))
}
```

### Step 2: Create `src/lib/hero-rain-utils.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { getCSSColor, densityToColor, clampParticleCount } from './hero-rain-utils'

// --- getCSSColor ---

describe('getCSSColor', () => {
    // Stub getComputedStyle before each test
    const originalGetComputedStyle = globalThis.getComputedStyle

    beforeEach(() => {
        // Provide a minimal stub
        ;(globalThis as any).getComputedStyle = (_el: Element) => ({
            getPropertyValue: (prop: string) => {
                if (prop === '--primary') return ' #635985'
                if (prop === '--empty') return ''
                return ''
            },
        })
        ;(globalThis as any).document = {
            documentElement: {} as Element,
        }
    })

    afterEach(() => {
        globalThis.getComputedStyle = originalGetComputedStyle
    })

    it('returns the trimmed CSS value when the variable is set', () => {
        expect(getCSSColor('--primary', '#000000')).toBe('#635985')
    })

    it('returns the fallback when the variable is empty', () => {
        expect(getCSSColor('--empty', '#fallback')).toBe('#fallback')
    })

    it('returns the fallback when the variable is not found', () => {
        expect(getCSSColor('--nonexistent', '#default')).toBe('#default')
    })
})

// --- densityToColor ---

describe('densityToColor', () => {
    const colors = { dim: 'dim-color', mid: 'mid-color', bright: 'bright-color' }

    it('returns dim for val = 0', () => {
        expect(densityToColor(0, colors)).toBe('dim-color')
    })

    it('returns dim for val = 0.99', () => {
        expect(densityToColor(0.99, colors)).toBe('dim-color')
    })

    it('returns mid for val = 1', () => {
        expect(densityToColor(1, colors)).toBe('mid-color')
    })

    it('returns mid for val = 2.99', () => {
        expect(densityToColor(2.99, colors)).toBe('mid-color')
    })

    it('returns bright for val = 3', () => {
        expect(densityToColor(3, colors)).toBe('bright-color')
    })

    it('returns bright for val > 3', () => {
        expect(densityToColor(10, colors)).toBe('bright-color')
    })
})

// --- clampParticleCount ---

describe('clampParticleCount', () => {
    const density = 0.47
    const min = 100
    const max = 1200

    it('clamps to min for very small widths', () => {
        // 50 * 0.47 = 23, below min
        expect(clampParticleCount(50, density, min, max)).toBe(100)
    })

    it('clamps to max for very large widths', () => {
        // 5000 * 0.47 = 2350, above max
        expect(clampParticleCount(5000, density, min, max)).toBe(1200)
    })

    it('returns the exact count for mid-range widths', () => {
        // 1000 * 0.47 = 470 — within [100, 1200]
        expect(clampParticleCount(1000, density, min, max)).toBe(470)
    })

    it('floors fractional counts', () => {
        // 1001 * 0.47 = 470.47 → floor = 470
        expect(clampParticleCount(1001, density, min, max)).toBe(470)
    })
})
```

### Step 3: Update `src/components/hero-rain.astro` to import from the utility module

At the top of the `<script>` block (before `interface Particle`), add:

```typescript
import { getCSSColor, densityToColor, clampParticleCount } from '../lib/hero-rain-utils'
```

Then update the three methods that duplicate this logic:

**`getCSSColor` method** — delete the private method entirely (lines ~63-68), since it's now imported.

**`init()` method** — replace the three `this.getCSSColor(...)` calls with the imported `getCSSColor(...)`:
```typescript
this.colors = {
    dim: getCSSColor('--accent', '#393053'),
    mid: getCSSColor('--primary', '#635985'),
    bright: getCSSColor('--text', '#F4F4F4'),
}
```

**`calculateParticleCount()` method** — replace the body with:
```typescript
return clampParticleCount(this.width, CONFIG.particleDensity, CONFIG.minParticles, CONFIG.maxParticles)
```

**`render()` method** — replace the inline `if (val < 1) ... else if (val < 3) ... else ...` fillStyle block with:
```typescript
this.ctx.fillStyle = densityToColor(val, this.colors)
```

### Step 4: Run the tests

```bash
bun test
```

Expected output:
```
bun test v1.x
src/lib/hero-rain-utils.test.ts:
✓ getCSSColor > returns the trimmed CSS value when the variable is set
✓ getCSSColor > returns the fallback when the variable is empty
✓ getCSSColor > returns the fallback when the variable is not found
✓ densityToColor > returns dim for val = 0
✓ densityToColor > returns dim for val = 0.99
✓ densityToColor > returns mid for val = 1
✓ densityToColor > returns mid for val = 2.99
✓ densityToColor > returns bright for val = 3
✓ densityToColor > returns bright for val > 3
✓ clampParticleCount > clamps to min for very small widths
✓ clampParticleCount > clamps to max for very large widths
✓ clampParticleCount > returns the exact count for mid-range widths
✓ clampParticleCount > floors fractional counts
13 pass, 0 fail
```

### Step 5: Verify the build still passes

```bash
bun run build
```

Expected: exit code 0, no TypeScript errors.

### Step 6: Commit

```bash
git add src/lib/hero-rain-utils.ts src/lib/hero-rain-utils.test.ts src/components/hero-rain.astro
git commit -m "test(hero-rain): extract pure utils and add unit tests for getCSSColor, densityToColor, clampParticleCount"
```

---

## Task 4: ARIA accessibility for the canvas

**Problem:** Screen readers encounter the `<canvas>` with no label or role — it appears as an empty interactive element. The ASCII animation is purely decorative; screen readers should skip it, and the container should convey its purpose via an accessible label.

**Fix:**
- Mark the `<canvas>` as `aria-hidden="true"` (it's decorative — screen readers should not try to describe individual pixels).
- Add `role="img"` and `aria-label` to the `#ascii-container` div so assistive technology announces a meaningful description.
- Add `<title>` text inside the container as a fallback for older AT.

**Files:**
- Modify: `src/components/hero-rain.astro` — the HTML template (lines 1-6)

**Step 1: Update the HTML template**

Replace:
```html
<div
    id='ascii-container'
    class='w-full flex-1'
>
    <canvas id='ascii-canvas' style='background: transparent'></canvas>
</div>
```

With:
```html
<div
    id='ascii-container'
    class='w-full flex-1'
    role='img'
    aria-label='Animated ASCII rain — decorative background'
>
    <canvas
        id='ascii-canvas'
        style='background: transparent'
        aria-hidden='true'
    ></canvas>
</div>
```

**Step 2: Verify the build still passes**

```bash
bun run build
```

Expected: exit code 0, no errors.

**Step 3: Manual accessibility check (optional but recommended)**

Open the built site in a browser, enable VoiceOver (macOS: `Cmd+F5`) or NVDA, and navigate to the hero section. The canvas area should be announced as _"Animated ASCII rain — decorative background, image"_ and inner canvas content should be skipped.

**Step 4: Commit**

```bash
git add src/components/hero-rain.astro
git commit -m "feat(a11y): add role=img and aria-label to canvas container, hide decorative canvas from screen readers"
```

---

## Completion Check

After all four tasks:

1. `bun test` — all 13 tests pass
2. `bun run build` — exits 0 with no type errors
3. The page renders identically to before (no visual regression)
4. Screen readers announce the canvas container and skip the inner `<canvas>`
