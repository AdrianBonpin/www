#!/usr/bin/env bun

/**
 * OG Image Generator
 * Generates a 1200x630 PNG for Open Graph meta tags
 * Runs at build time before Astro build
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(new URL(import.meta.url).pathname)

// Configuration
const OUTPUT_PATH = resolve(__dirname, '../public/og-image.png')
const WIDTH = 1200
const HEIGHT = 630

// Colors from site palette
const COLORS = {
    background: '#18122B',
    accent: '#393053',
    secondary: '#443C68',
    primary: '#635985',
    text: '#F4F4F4',
}

async function fetchFont(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch font from ${url}: ${response.statusText}`)
    }
    return response.arrayBuffer()
}

function loadLocalFont(path: string): ArrayBuffer {
    return readFileSync(path)
}

async function generateOGImage() {
    console.log('🎨 Generating OG image...')

    // Load fonts
    const fusionPixelFont = loadLocalFont(
        resolve(__dirname, '../node_modules/@fontsource/fusion-pixel-12px-monospaced-jp/files/fusion-pixel-12px-monospaced-jp-latin-400-normal.woff')
    )

    console.log('  📥 Downloading Raleway font...')
    // Get direct font URL from Google Fonts API
    const ralewayUrl = 'https://fonts.googleapis.com/css2?family=Raleway:wght@400'
    const cssResponse = await fetch(ralewayUrl)
    const cssText = await cssResponse.text()
    const fontUrlMatch = cssText.match(/url\(([^)]+)\)/)
    if (!fontUrlMatch) {
        throw new Error('Could not find Raleway font URL')
    }
    const ralewayFont = await fetchFont(fontUrlMatch[1])

    // Generate SVG with satori
    console.log('  🖼️  Rendering SVG...')
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS.background,
                    position: 'relative',
                    overflow: 'hidden',
                },
                children: [
                    // Subtle background pattern (dots)
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                opacity: 0.15,
                                backgroundImage: `radial-gradient(circle, ${COLORS.primary} 2px, transparent 2px)`,
                                backgroundSize: '30px 30px',
                            },
                        },
                    },
                    // Content container
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1,
                            },
                            children: [
                                // Username
                                {
                                    type: 'h1',
                                    props: {
                                        style: {
                                            fontFamily: 'Fusion Pixel',
                                            fontSize: 72,
                                            color: COLORS.text,
                                            margin: 0,
                                            marginBottom: '24px',
                                            letterSpacing: '2px',
                                        },
                                        children: 'adrianbonpin',
                                    },
                                },
                                // Tagline
                                {
                                    type: 'p',
                                    props: {
                                        style: {
                                            fontFamily: 'Raleway',
                                            fontSize: 28,
                                            fontWeight: 400,
                                            color: COLORS.primary,
                                            margin: 0,
                                            fontStyle: 'italic',
                                        },
                                        children: 'Building Dreams. One Line at a Time.',
                                    },
                                },
                            ],
                        },
                    },
                    // URL at bottom
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                bottom: '40px',
                                left: '60px',
                                fontFamily: 'Raleway',
                                fontSize: 18,
                                color: COLORS.secondary,
                                fontWeight: 500,
                            },
                            children: 'adrianbonpin.com',
                        },
                    },
                ],
            },
        },
        {
            width: WIDTH,
            height: HEIGHT,
            fonts: [
                {
                    name: 'Fusion Pixel',
                    data: fusionPixelFont,
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Raleway',
                    data: ralewayFont,
                    weight: 400,
                    style: 'normal',
                },
            ],
        }
    )

    // Convert SVG to PNG
    console.log('  🖨️  Converting to PNG...')
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: WIDTH,
        },
    })
    const pngData = resvg.render()

    // Ensure public directory exists
    const outputDir = dirname(OUTPUT_PATH)
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
    }

    // Write output
    writeFileSync(OUTPUT_PATH, pngData.asPng())
    console.log(`  ✅ OG image written to ${OUTPUT_PATH}`)
}

// Run the generator
generateOGImage().catch((error) => {
    console.error('❌ Failed to generate OG image:', error)
    process.exit(1)
})
