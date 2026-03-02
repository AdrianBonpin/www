import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { getCSSColor, densityToColor, clampParticleCount } from './hero-rain-utils'

describe('getCSSColor', () => {
    const originalGetComputedStyle = globalThis.getComputedStyle

    beforeEach(() => {
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

describe('clampParticleCount', () => {
    const density = 0.47
    const min = 100
    const max = 1200

    it('clamps to min for very small widths', () => {
        expect(clampParticleCount(50, density, min, max)).toBe(100)
    })

    it('clamps to max for very large widths', () => {
        expect(clampParticleCount(5000, density, min, max)).toBe(1200)
    })

    it('returns the exact count for mid-range widths', () => {
        expect(clampParticleCount(1000, density, min, max)).toBe(470)
    })

    it('floors fractional counts', () => {
        expect(clampParticleCount(1001, density, min, max)).toBe(470)
    })
})
