#!/usr/bin/env bun

/**
 * Resume PDF Generator
 * Generates a multi-page PDF resume at public/resume.pdf
 * Runs at build time before Astro build
 *
 * Pipeline: Data → satori (JSX→SVG) → resvg (SVG→PNG) → pdf-lib (PNG pages→PDF)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { PDFDocument } from "pdf-lib"

const __dirname = dirname(new URL(import.meta.url).pathname)

// ─── Configuration ───
const OUTPUT_PATH = resolve(__dirname, "../public/resume.pdf")
const PAGE_WIDTH = 1275 // US Letter @ 150dpi
const PAGE_HEIGHT = 1650
const MARGIN = 60
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

// Print-optimized colors
const C = {
  text: "#1a1a2e",
  textSecondary: "#4a4a6a",
  accent: "#635985",
  rule: "#e2e0eb",
  bg: "#ffffff",
  tagBg: "#f0edf7",
}

// ─── Data ───
import { siteConfig } from "../src/data/site-config"
import { experiences } from "../src/data/experience"
import { skillCategories } from "../src/data/skills"
import { education } from "../src/data/education"

interface ResumePage {
  content: any // satori JSX element tree
}

function buildPages(): ResumePage[] {
  const pages: ResumePage[] = []

  // ── Header section ──
  const headerSection = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        paddingBottom: "24px",
        borderBottomWidth: "2px",
        borderBottomColor: C.accent,
        marginBottom: "24px",
      },
      children: [
        {
          type: "h1",
          props: {
            style: {
              fontFamily: "Raleway",
              fontWeight: 700,
              fontSize: 40,
              color: C.text,
              margin: 0,
              marginBottom: "4px",
            },
            children: siteConfig.name,
          },
        },
        {
          type: "p",
          props: {
            style: {
              fontFamily: "Raleway",
              fontWeight: 400,
              fontSize: 20,
              color: C.accent,
              margin: 0,
              marginBottom: "12px",
            },
            children: siteConfig.title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              fontFamily: "Fusion Pixel",
              fontSize: 13,
              color: C.textSecondary,
            },
            children: [
              { type: "span", props: { children: `✉ ${siteConfig.email}` } },
              { type: "span", props: { children: `📍 ${siteConfig.location}` } },
              { type: "span", props: { children: "🌐 adrianbonpin.com" } },
              { type: "span", props: { children: "💻 github.com/adrianbonpin" } },
            ],
          },
        },
      ],
    },
  }

  // ── Summary section ──
  const summarySection = {
    type: "div",
    props: {
      style: {
        marginBottom: "24px",
        fontFamily: "Raleway",
        fontSize: 15,
        color: C.textSecondary,
        lineHeight: 1.6,
        fontStyle: "italic",
      },
      children:
        "Full-stack developer with 2+ years of experience building custom web applications and websites. Specialized in Next.js and Astro with a focus on performance, accessibility, and clean architecture. Currently building at DEVGO Studio, delivering bespoke solutions for clients across industries.",
    },
  }

  // ── Section heading helper ──
  function sectionHeading(label: string) {
    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          gap: "12px",
          marginBottom: "16px",
        },
        children: [
          {
            type: "h2",
            props: {
              style: {
                fontFamily: "Raleway",
                fontWeight: 700,
                fontSize: 22,
                color: C.text,
                margin: 0,
              },
              children: label,
            },
          },
          {
            type: "div",
            props: {
              style: {
                flex: 1,
                height: "1px",
                backgroundColor: C.rule,
              },
            },
          },
        ],
      },
    }
  }

  // ── Experience section ──
  const experienceItems = experiences.map((exp) => ({
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "20px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "4px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "row", gap: "8px", alignItems: "baseline" },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: { fontFamily: "Raleway", fontWeight: 700, fontSize: 17, color: C.text },
                        children: exp.role,
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: { fontFamily: "Raleway", fontWeight: 400, fontSize: 15, color: C.accent },
                        children: `at ${exp.company}`,
                      },
                    },
                  ],
                },
              },
              {
                type: "span",
                props: {
                  style: { fontFamily: "Fusion Pixel", fontSize: 12, color: C.textSecondary },
                  children: `${exp.startDate} — ${exp.endDate ?? "Present"}`,
                },
              },
            ],
          },
        },
        ...exp.highlights.map((h) => ({
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              gap: "8px",
              marginBottom: "2px",
              fontFamily: "Raleway",
              fontSize: 14,
              color: C.textSecondary,
              lineHeight: 1.5,
            },
            children: [
              { type: "span", props: { style: { color: C.accent }, children: "•" } },
              { type: "span", props: { children: h } },
            ],
          },
        })),
      ],
    },
  }))

  const experienceSection = {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", marginBottom: "24px" },
      children: [sectionHeading("Experience"), ...experienceItems],
    },
  }

  // ── Skills section ──
  const skillsSection = {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", marginBottom: "24px" },
      children: [
        sectionHeading("Skills"),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "14px" },
            children: skillCategories.map((cat) => ({
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "row", gap: "10px", alignItems: "baseline" },
                children: [
                  {
                    type: "span",
                    props: {
                      style: {
                        fontFamily: "Raleway",
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.accent,
                        minWidth: "160px",
                      },
                      children: cat.category,
                    },
                  },
                  {
                    type: "span",
                    props: {
                      style: {
                        fontFamily: "Raleway",
                        fontSize: 14,
                        color: C.textSecondary,
                        lineHeight: 1.5,
                      },
                      children: cat.items.map((s) => s.name).join("  ·  "),
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  }

  // ── Education section (only if data exists) ──
  const educationSection =
    education.length > 0
      ? {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", marginBottom: "24px" },
            children: [
              sectionHeading("Education"),
              ...education.map((edu) => ({
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "8px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", flexDirection: "row", gap: "6px" },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: { fontFamily: "Raleway", fontWeight: 700, fontSize: 15, color: C.text },
                              children: edu.credential,
                            },
                          },
                          {
                            type: "span",
                            props: {
                              style: { fontFamily: "Raleway", fontSize: 15, color: C.textSecondary },
                              children: `— ${edu.field}, ${edu.institution}`,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: { fontFamily: "Fusion Pixel", fontSize: 12, color: C.textSecondary },
                        children: String(edu.year),
                      },
                    },
                  ],
                },
              })),
            ],
          },
        }
      : null

  // ── Assemble page 1 ──
  const children: any[] = [
    headerSection,
    summarySection,
    experienceSection,
    skillsSection,
  ]
  if (educationSection) children.push(educationSection)

  // Add footer
  children.push({
    type: "div",
    props: {
      style: {
        marginTop: "auto",
        paddingTop: "16px",
        borderTopWidth: "1px",
        borderTopColor: C.rule,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        fontFamily: "Fusion Pixel",
        fontSize: 11,
        color: C.textSecondary,
      },
      children: [
        { type: "span", props: { children: "adrianbonpin.com" } },
        { type: "span", props: { children: "Page 1" } },
      ],
    },
  })

  pages.push({
    content: {
      type: "div",
      props: {
        style: {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.bg,
          padding: MARGIN,
        },
        children,
      },
    },
  })

  return pages
}

// ─── Font Loading ───
function loadLocalFont(path: string): ArrayBuffer {
  return readFileSync(path)
}

async function loadFonts() {
  // Fusion Pixel (monospace, for labels)
  const fusionPixelFont = loadLocalFont(
    resolve(
      __dirname,
      "../node_modules/@fontsource/fusion-pixel-12px-monospaced-jp/files/fusion-pixel-12px-monospaced-jp-latin-400-normal.woff"
    )
  )

  // Raleway (headings + body)
  const ralewayUrl =
    "https://fonts.googleapis.com/css2?family=Raleway:wght@400;700"
  const cssResponse = await fetch(ralewayUrl)
  const cssText = await cssResponse.text()

  // Extract font URLs from CSS (Google Fonts returns separate URLs per weight)
  const fontUrlMatches = cssText.matchAll(/url\(([^)]+)\)/g)
  const urls = Array.from(fontUrlMatches, (m) => m[1])

  const ralewayFonts: ArrayBuffer[] = []
  for (const url of urls) {
    const fontResponse = await fetch(url)
    if (!fontResponse.ok) throw new Error(`Failed to fetch font from ${url}`)
    ralewayFonts.push(await fontResponse.arrayBuffer())
  }

  return {
    fusionPixel: { name: "Fusion Pixel", data: fusionPixelFont, weight: 400, style: "normal" } as const,
    raleway400: {
      name: "Raleway",
      data: ralewayFonts[0] || ralewayFonts[ralewayFonts.length - 1],
      weight: 400,
      style: "normal",
    } as const,
    raleway700: {
      name: "Raleway",
      data: ralewayFonts[1] || ralewayFonts[0],
      weight: 700,
      style: "normal",
    } as const,
  }
}

// ─── Main ───
async function generateResume() {
  console.log("📄 Generating resume PDF...")

  const pages = buildPages()
  console.log(`  📐 Layout built: ${pages.length} page(s)`)

  const fonts = await loadFonts()
  console.log("  🔤 Fonts loaded")

  // Render each page: SVG → PNG
  const pngPages: Uint8Array[] = []
  for (let i = 0; i < pages.length; i++) {
    console.log(`  🖼️  Rendering page ${i + 1}/${pages.length}...`)

    const svg = await satori(pages[i].content, {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      fonts: [fonts.fusionPixel, fonts.raleway400, fonts.raleway700],
    })

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: PAGE_WIDTH },
    })
    const pngData = resvg.render()
    pngPages.push(pngData.asPng())
  }

  // Assemble PDF from PNG pages
  console.log("  📚 Assembling PDF...")
  const pdfDoc = await PDFDocument.create()

  for (const pngBytes of pngPages) {
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    })
  }

  const pdfBytes = await pdfDoc.save()

  // Ensure public directory exists
  const outputDir = dirname(OUTPUT_PATH)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(OUTPUT_PATH, pdfBytes)
  console.log(`  ✅ Resume PDF written to ${OUTPUT_PATH} (${(pdfBytes.length / 1024).toFixed(0)} KB)`)
}

// Run
generateResume().catch((error) => {
  console.error("❌ Failed to generate resume PDF:", error)
  process.exit(1)
})
