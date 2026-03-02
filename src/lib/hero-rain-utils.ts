// Pure utility functions extracted from AsciiLiquid for testability

export interface ColorThresholds {
    dim: string
    mid: string
    bright: string
}

export function getCSSColor(variable: string, fallback: string): string {
    const val = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim()
    return val || fallback
}

export function densityToColor(val: number, colors: ColorThresholds): string {
    if (val < 1) return colors.dim
    if (val < 3) return colors.mid
    return colors.bright
}

export function clampParticleCount(
    width: number,
    density: number,
    min: number,
    max: number
): number {
    const count = Math.floor(width * density)
    return Math.max(min, Math.min(max, count))
}
