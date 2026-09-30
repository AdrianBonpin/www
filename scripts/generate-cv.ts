#!/usr/bin/env node

/**
 * CV PDF Generator — ATS-friendly plain-text edition
 * Generates public/cv.pdf alongside the styled public/resume.pdf
 * Runs at build time before Astro build.
 *
 * Design priorities (deliberately different from the resume):
 *   - ATS-first: strictly black text on white, no colors, no columns, no images
 *   - Standard Helvetica fonts, simple uppercase headings + thin rules
 *   - Complete, scannable content: summary, experience, selected projects,
 *     skills, education, certifications
 *
 * Shares its data and text helpers with the styled resume generator so the two
 * documents can never drift apart on content.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib"

import { wrapText, formatDateRange, employmentLabel } from "./lib/resume-helpers"
import { siteConfig } from "../src/data/site-config"
import { experiences } from "../src/data/experience"
import { skillCategories } from "../src/data/skills"
import { education } from "../src/data/education"
import { certificates } from "../src/data/certificates"
import { resumeProjects } from "../src/data/resume-projects"
import { resumeSummary } from "../src/data/resume-summary"

const __dirname = dirname(new URL(import.meta.url).pathname)

// ─── Configuration ───
const OUTPUT_PATH = resolve(__dirname, "../public/cv.pdf")

const PAGE_WIDTH = PageSizes.Letter[0]  // 612
const PAGE_HEIGHT = PageSizes.Letter[1] // 792
const MARGIN = 54                       // 0.75"
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

// Strictly black on white.
const BLACK = rgb(0, 0, 0)

/** Replace typographic punctuation that trips up some ATS parsers. */
function sanitize(value: string): string {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00b7/g, "|")
    .replace(/\u00a0/g, " ")
}

// ─── Types ───
interface Ctx {
  page: any
  font: any
  bold: any
  italic: any
  y: number
  x: number
}

interface TextOpts {
  font?: any
  size?: number
  color?: any
  x?: number
  maxWidth?: number
  lineHeight?: number
}

// ─── Helpers ───
function rule(ctx: Ctx, y: number, thickness = 0.8) {
  ctx.page.drawLine({
    start: { x: ctx.x, y },
    end: { x: ctx.x + CONTENT_WIDTH, y },
    thickness,
    color: BLACK,
  })
}

function text(ctx: Ctx, value: string, opts: TextOpts = {}) {
  const font = opts.font || ctx.font
  const size = opts.size || 10
  const color = opts.color || BLACK
  const x = opts.x ?? ctx.x
  const maxWidth = opts.maxWidth ?? CONTENT_WIDTH
  const lineHeight = opts.lineHeight || size * 1.4

  const lines = wrapText(sanitize(value), maxWidth, font, size)
  for (const l of lines) {
    ctx.page.drawText(l, { x, y: ctx.y, size, font, color })
    ctx.y -= lineHeight
  }
}

function bullet(ctx: Ctx, value: string) {
  const indent = 12
  ctx.page.drawText("-", { x: ctx.x, y: ctx.y, size: 9.5, font: ctx.bold, color: BLACK })
  text(ctx, value, {
    size: 9.5,
    x: ctx.x + indent,
    maxWidth: CONTENT_WIDTH - indent,
    lineHeight: 12.5,
  })
}

// ─── Page Builder ───
async function buildCV() {
  const pdfDoc = await PDFDocument.create()

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const ctx: Ctx = {
    page,
    font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    y: PAGE_HEIGHT - MARGIN,
    x: MARGIN,
  }

  function newPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    ctx.page = page
    ctx.y = PAGE_HEIGHT - MARGIN
  }

  function checkPage(minSpace = 60) {
    if (ctx.y < MARGIN + minSpace) newPage()
  }

  function sectionHeader(title: string) {
    checkPage(72)
    ctx.y -= 6
    ctx.page.drawText(sanitize(title).toUpperCase(), {
      x: ctx.x,
      y: ctx.y,
      size: 11,
      font: ctx.bold,
      color: BLACK,
    })
    rule(ctx, ctx.y - 5, 0.8)
    ctx.y -= 18
  }

  // ── HEADER ──
  ctx.page.drawText(sanitize(siteConfig.name), {
    x: ctx.x,
    y: ctx.y,
    size: 22,
    font: ctx.bold,
    color: BLACK,
  })
  ctx.y -= 26

  ctx.page.drawText(sanitize(siteConfig.title), {
    x: ctx.x,
    y: ctx.y,
    size: 11,
    font: ctx.font,
    color: BLACK,
  })
  ctx.y -= 16

  text(ctx, `${siteConfig.email}  |  ${siteConfig.location}  |  adrianbonpin.com`, {
    size: 9.5,
    lineHeight: 12,
  })
  text(ctx, `github.com/adrianbonpin  |  linkedin.com/in/adrianbonpin`, {
    size: 9.5,
    lineHeight: 12,
  })
  ctx.y -= 6

  // ── PROFESSIONAL SUMMARY ──
  sectionHeader("Professional Summary")
  text(ctx, resumeSummary, { size: 10, lineHeight: 13.5 })
  ctx.y -= 6

  // ── PROFESSIONAL EXPERIENCE ──
  sectionHeader("Professional Experience")
  for (const exp of experiences) {
    checkPage(70)
    const dateText = formatDateRange(exp.startDate, exp.endDate)
    const dateW = ctx.font.widthOfTextAtSize(dateText, 9)
    const label = employmentLabel(exp)

    ctx.page.drawText(
      sanitize(`${exp.role}, ${exp.company}${label ? ` (${label})` : ""}`),
      { x: ctx.x, y: ctx.y, size: 10.5, font: ctx.bold, color: BLACK }
    )
    ctx.page.drawText(dateText, {
      x: ctx.x + CONTENT_WIDTH - dateW,
      y: ctx.y,
      size: 9,
      font: ctx.font,
      color: BLACK,
    })
    ctx.y -= 15

    for (const h of exp.highlights) {
      checkPage(30)
      bullet(ctx, h)
    }
    ctx.y -= 6
  }

  // ── SELECTED PROJECTS ──
  sectionHeader("Selected Projects")
  for (const proj of resumeProjects) {
    checkPage(45)
    const yearText = String(proj.year)
    const yearW = ctx.font.widthOfTextAtSize(yearText, 9)

    ctx.page.drawText(sanitize(proj.title), {
      x: ctx.x,
      y: ctx.y,
      size: 10,
      font: ctx.bold,
      color: BLACK,
    })
    ctx.page.drawText(yearText, {
      x: ctx.x + CONTENT_WIDTH - yearW,
      y: ctx.y,
      size: 9,
      font: ctx.font,
      color: BLACK,
    })
    ctx.y -= 13

    const meta = [proj.desc, proj.link].filter(Boolean).join("  |  ")
    text(ctx, meta, { size: 9.5, lineHeight: 12.5 })

    if (proj.techTags.length > 0) {
      text(ctx, `Tech: ${proj.techTags.join(", ")}`, { size: 9.5, lineHeight: 12.5 })
    }
    ctx.y -= 5
  }

  // ── TECHNICAL SKILLS ──
  sectionHeader("Technical Skills")
  for (const cat of skillCategories) {
    checkPage(28)
    const items = cat.items.map((s) => s.name).join(", ")
    text(ctx, `${cat.category}: ${items}`, { size: 9.5, lineHeight: 12.5 })
    ctx.y -= 2
  }
  ctx.y -= 4

  // ── EDUCATION ──
  if (education.length > 0) {
    sectionHeader("Education")
    for (const edu of education) {
      checkPage(30)
      const yearText =
        edu.status === "expected" ? `Expected ${edu.year}` : String(edu.year)
      const yearW = ctx.font.widthOfTextAtSize(yearText, 9)

      ctx.page.drawText(sanitize(`${edu.credential}, ${edu.field}`), {
        x: ctx.x,
        y: ctx.y,
        size: 10,
        font: ctx.bold,
        color: BLACK,
      })
      ctx.page.drawText(yearText, {
        x: ctx.x + CONTENT_WIDTH - yearW,
        y: ctx.y,
        size: 9,
        font: ctx.font,
        color: BLACK,
      })
      ctx.y -= 13

      text(ctx, edu.institution, { size: 9.5, lineHeight: 12 })
      if (edu.description) {
        text(ctx, edu.description, { size: 9.5, lineHeight: 12 })
      }
      ctx.y -= 5
    }
    ctx.y -= 2
  }

  // ── CERTIFICATIONS ──
  if (certificates.length > 0) {
    sectionHeader("Certifications")
    for (const cert of certificates) {
      checkPage(30)
      const statusText =
        cert.status === "passed" ? `Passed ${cert.year}` : String(cert.year)
      const statusW = ctx.font.widthOfTextAtSize(statusText, 9)

      ctx.page.drawText(sanitize(cert.name), {
        x: ctx.x,
        y: ctx.y,
        size: 10,
        font: ctx.bold,
        color: BLACK,
      })
      ctx.page.drawText(statusText, {
        x: ctx.x + CONTENT_WIDTH - statusW,
        y: ctx.y,
        size: 9,
        font: ctx.font,
        color: BLACK,
      })
      ctx.y -= 13

      text(ctx, cert.issuer, { size: 9.5, lineHeight: 12 })
      if (cert.description) {
        text(ctx, cert.description, { size: 9.5, lineHeight: 12 })
      }
      ctx.y -= 5
    }
  }

  // ── FOOTER (last page only) ──
  const lastPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1]
  lastPage.drawText("adrianbonpin.com", {
    x: MARGIN,
    y: MARGIN - 14,
    size: 8,
    font: ctx.font,
    color: BLACK,
  })

  const pdfBytes = await pdfDoc.save()
  const outputDir = dirname(OUTPUT_PATH)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  writeFileSync(OUTPUT_PATH, pdfBytes)

  const kb = (pdfBytes.length / 1024).toFixed(1)
  const pages = pdfDoc.getPages().length
  console.log(
    `📄 CV (ATS) PDF saved: ${OUTPUT_PATH} (${kb} KB, ${pages} page${pages > 1 ? "s" : ""})`
  )
}

buildCV().catch((err) => {
  console.error("❌ Failed to generate CV:", err)
  process.exit(1)
})
