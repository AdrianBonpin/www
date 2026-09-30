#!/usr/bin/env node

/**
 * Resume PDF Generator
 * Generates a crisp, vector-based PDF resume at public/resume.pdf
 * Runs at build time before Astro build
 *
 * Uses pdf-lib with standard PDF fonts for 100% vector output —
 * no browser required, works in any CI/build environment (Cloudflare Pages, etc.)
 *
 * Design priorities:
 *   - ATS-friendly: single column, standard fonts, clear headings, no tables/images
 *   - Employer-ready: clean hierarchy, scannable bullets, adequate white space
 *   - Print-friendly: dark text on white, proper margins
 */

import { writeFileSync, existsSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib"

import { wrapText, formatDateRange, employmentLabel } from "./lib/resume-helpers"

const __dirname = dirname(new URL(import.meta.url).pathname)

// ─── Configuration ───
const OUTPUT_PATH = resolve(__dirname, "../public/resume.pdf")

// US Letter in points (72 pts/inch)
const PAGE_WIDTH = PageSizes.Letter[0]  // 612
const PAGE_HEIGHT = PageSizes.Letter[1] // 792
const MARGIN = 54                       // 0.75"
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

// Colors (dark enough for print, light enough for subtle hierarchy)
const C = {
  text: rgb(0.08, 0.08, 0.12),
  textSecondary: rgb(0.28, 0.28, 0.34),
  accent: rgb(0.35, 0.30, 0.48),
  rule: rgb(0.78, 0.78, 0.84),
  bullet: rgb(0.35, 0.30, 0.48),
}

// ─── Data ───
import { siteConfig } from "../src/data/site-config"
import { experiences } from "../src/data/experience"
import { skillCategories } from "../src/data/skills"
import { education } from "../src/data/education"
import { certificates } from "../src/data/certificates"
import { resumeProjects } from "../src/data/resume-projects"
import { resumeSummary } from "../src/data/resume-summary"

// ─── Types ───
interface LayoutContext {
  page: any
  fontRegular: any
  fontBold: any
  fontItalic: any
  fontMono: any
  y: number
  x: number
}

// ─── Helpers ───
function drawLine(ctx: LayoutContext, x1: number, y1: number, x2: number, y2: number, color = C.rule, thickness = 0.5) {
  ctx.page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color })
}

function drawText(ctx: LayoutContext, text: string, opts: {
  font?: any, size?: number, color?: any, x?: number, maxWidth?: number, lineHeight?: number
} = {}) {
  const font = opts.font || ctx.fontRegular
  const size = opts.size || 10
  const color = opts.color || C.text
  const x = opts.x ?? ctx.x
  const maxWidth = opts.maxWidth ?? CONTENT_WIDTH
  const lineHeight = opts.lineHeight || size * 1.45

  const lines = wrapText(text, maxWidth, font, size)
  for (const line of lines) {
    ctx.page.drawText(line, { x, y: ctx.y, size, font, color })
    ctx.y -= lineHeight
  }
  return lines.length * lineHeight
}

function sectionHeader(ctx: LayoutContext, title: string) {
  const size = 11
  const lineHeight = size * 1.4
  const paddingBottom = 6

  ctx.y -= 6
  ctx.page.drawText(title.toUpperCase(), {
    x: ctx.x,
    y: ctx.y,
    size,
    font: ctx.fontBold,
    color: C.accent,
  })

  const lineY = ctx.y - paddingBottom
  drawLine(ctx, ctx.x, lineY, ctx.x + CONTENT_WIDTH, lineY, C.rule, 0.8)
  ctx.y -= lineHeight + paddingBottom + 2
}

// ─── Page Builder ───
async function buildResume() {
  const pdfDoc = await PDFDocument.create()

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let ctx: LayoutContext = {
    page,
    fontRegular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    fontBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    fontItalic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    fontMono: await pdfDoc.embedFont(StandardFonts.Courier),
    y: PAGE_HEIGHT - MARGIN,
    x: MARGIN,
  }

  function checkPage(minSpace = 120) {
    if (ctx.y < MARGIN + minSpace) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      ctx.page = page
      ctx.y = PAGE_HEIGHT - MARGIN
    }
  }

  // ── HEADER ──
  const nameSize = 24
  const titleSize = 11
  const contactSize = 9

  // Name
  ctx.page.drawText(siteConfig.name, {
    x: ctx.x,
    y: ctx.y,
    size: nameSize,
    font: ctx.fontBold,
    color: C.text,
  })
  ctx.y -= nameSize + 3

  // Title
  ctx.page.drawText(siteConfig.title, {
    x: ctx.x,
    y: ctx.y,
    size: titleSize,
    font: ctx.fontRegular,
    color: C.accent,
  })
  ctx.y -= titleSize + 5

  // Contact rows (clear, scannable, ATS-friendly)
  const contactRow1 = `${siteConfig.email}  ·  ${siteConfig.location}  ·  adrianbonpin.com`
  const contactRow2 = `github.com/adrianbonpin  ·  linkedin.com/in/adrianbonpin`
  drawText(ctx, contactRow1, { size: contactSize, color: C.textSecondary, lineHeight: 11 })
  drawText(ctx, contactRow2, { size: contactSize, color: C.textSecondary, lineHeight: 11 })
  ctx.y -= 2

  // Accent rule below header
  drawLine(ctx, ctx.x, ctx.y, ctx.x + CONTENT_WIDTH, ctx.y, C.accent, 1.2)
  ctx.y -= 14

  // ── PROFESSIONAL SUMMARY ──
  drawText(ctx, resumeSummary, { size: 10, color: C.textSecondary, lineHeight: 14, maxWidth: CONTENT_WIDTH })
  ctx.y -= 8

  // ── PROFESSIONAL EXPERIENCE ──
  sectionHeader(ctx, "Professional Experience")
  for (const exp of experiences) {
    checkPage(70)

    // Role + Company on left, date on right
    const roleSize = 10.5
    const dateSize = 9
    const dateText = formatDateRange(exp.startDate, exp.endDate)
    const dateW = ctx.fontRegular.widthOfTextAtSize(dateText, dateSize)

    ctx.page.drawText(`${exp.role}, ${exp.company}${employmentLabel(exp) ? ` (${employmentLabel(exp)})` : ""}`, {
      x: ctx.x,
      y: ctx.y,
      size: roleSize,
      font: ctx.fontBold,
      color: C.text,
    })
    ctx.page.drawText(dateText, {
      x: ctx.x + CONTENT_WIDTH - dateW,
      y: ctx.y,
      size: dateSize,
      font: ctx.fontRegular,
      color: C.textSecondary,
    })
    ctx.y -= roleSize * 1.45

    // Highlights (ATS-friendly bullets)
    for (const h of exp.highlights) {
      const indent = 10
      const maxW = CONTENT_WIDTH - indent - 2

      ctx.page.drawText("-", {
        x: ctx.x,
        y: ctx.y,
        size: 9,
        font: ctx.fontBold,
        color: C.bullet,
      })

      const lines = wrapText(h, maxW, ctx.fontRegular, 9)
      for (let i = 0; i < lines.length; i++) {
        ctx.page.drawText(lines[i], {
          x: ctx.x + indent,
          y: ctx.y,
          size: 9,
          font: ctx.fontRegular,
          color: C.textSecondary,
        })
        ctx.y -= 11.5
      }
    }
    ctx.y -= 6
  }

  // ── SELECTED PROJECTS ──
  checkPage(70)
  sectionHeader(ctx, "Selected Projects")

  for (const proj of resumeProjects) {
    checkPage(35)
    const projSize = 10
    const metaSize = 9
    const yearText = String(proj.year)
    const yearW = ctx.fontRegular.widthOfTextAtSize(yearText, metaSize)

    ctx.page.drawText(proj.title, {
      x: ctx.x,
      y: ctx.y,
      size: projSize,
      font: ctx.fontBold,
      color: C.text,
    })
    ctx.page.drawText(yearText, {
      x: ctx.x + CONTENT_WIDTH - yearW,
      y: ctx.y,
      size: metaSize,
      font: ctx.fontRegular,
      color: C.textSecondary,
    })
    ctx.y -= 12

    const meta = [proj.desc, proj.techTags.slice(0, 4).join(", ")]
      .filter(Boolean)
      .join("  |  ")
    drawText(ctx, meta, { size: 9, color: C.textSecondary, lineHeight: 12, maxWidth: CONTENT_WIDTH })
    ctx.y -= 4
  }

  // ── TECHNICAL SKILLS ──
  checkPage(70)
  sectionHeader(ctx, "Technical Skills")

  for (const cat of skillCategories) {
    checkPage(25)
    const catSize = 9.5
    const itemSize = 9.5
    const catText = cat.category
    const catW = ctx.fontBold.widthOfTextAtSize(catText, catSize)

    ctx.page.drawText(catText, {
      x: ctx.x,
      y: ctx.y,
      size: catSize,
      font: ctx.fontBold,
      color: C.accent,
    })

    const items = cat.items.map(s => s.name).join(", ")
    const itemLines = wrapText(items, CONTENT_WIDTH - catW - 12, ctx.fontRegular, itemSize)
    for (let i = 0; i < itemLines.length; i++) {
      ctx.page.drawText(itemLines[i], {
        x: ctx.x + catW + 10,
        y: ctx.y,
        size: itemSize,
        font: ctx.fontRegular,
        color: C.textSecondary,
      })
      ctx.y -= 11.5
    }
    ctx.y -= 3
  }

  // ── EDUCATION ──
  if (education.length > 0) {
    checkPage(50)
    sectionHeader(ctx, "Education")

    for (const edu of education) {
      checkPage(25)
      const credSize = 10
      const yearSize = 9
      const yearText = edu.status === "expected"
        ? `Expected ${edu.year}`
        : String(edu.year)
      const yearW = ctx.fontRegular.widthOfTextAtSize(yearText, yearSize)

      const credText = `${edu.credential}, ${edu.field}`
      ctx.page.drawText(credText, {
        x: ctx.x,
        y: ctx.y,
        size: credSize,
        font: ctx.fontBold,
        color: C.text,
      })
      ctx.page.drawText(yearText, {
        x: ctx.x + CONTENT_WIDTH - yearW,
        y: ctx.y,
        size: yearSize,
        font: ctx.fontRegular,
        color: C.textSecondary,
      })
      ctx.y -= 12

      ctx.page.drawText(edu.institution, {
        x: ctx.x,
        y: ctx.y,
        size: 9,
        font: ctx.fontRegular,
        color: C.textSecondary,
      })
      ctx.y -= 16
    }
  }

  // ── CERTIFICATIONS ──
  if (certificates.length > 0) {
    checkPage(50)
    sectionHeader(ctx, "Certifications")

    for (const cert of certificates) {
      checkPage(25)
      const certSize = 10
      const yearSize = 9
      const statusText = cert.status === "passed" ? `Passed ${cert.year}` : String(cert.year)
      const statusW = ctx.fontRegular.widthOfTextAtSize(statusText, yearSize)

      ctx.page.drawText(cert.name, {
        x: ctx.x,
        y: ctx.y,
        size: certSize,
        font: ctx.fontBold,
        color: C.text,
      })
      ctx.page.drawText(statusText, {
        x: ctx.x + CONTENT_WIDTH - statusW,
        y: ctx.y,
        size: yearSize,
        font: ctx.fontRegular,
        color: C.textSecondary,
      })
      ctx.y -= 12

      ctx.page.drawText(`${cert.issuer}`, {
        x: ctx.x,
        y: ctx.y,
        size: 9,
        font: ctx.fontRegular,
        color: C.textSecondary,
      })
      ctx.y -= 14

      if (cert.description) {
        drawText(ctx, cert.description, {
          size: 9,
          color: C.textSecondary,
          lineHeight: 12,
          maxWidth: CONTENT_WIDTH,
        })
        ctx.y -= 4
      }
      ctx.y -= 4
    }
  }

  // ── FOOTER (last page only) ──
  const lastPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1]
  const footerY = MARGIN - 14
  const footerSize = 8

  lastPage.drawText("adrianbonpin.com", {
    x: MARGIN,
    y: footerY,
    size: footerSize,
    font: ctx.fontRegular,
    color: C.textSecondary,
  })

  // Save
  const pdfBytes = await pdfDoc.save()
  const outputDir = dirname(OUTPUT_PATH)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  writeFileSync(OUTPUT_PATH, pdfBytes)

  const kb = (pdfBytes.length / 1024).toFixed(1)
  console.log(`📄 Resume PDF saved: ${OUTPUT_PATH} (${kb} KB, ${pdfDoc.getPages().length} page${pdfDoc.getPages().length > 1 ? "s" : ""})`)
}

buildResume().catch((err) => {
  console.error("❌ Failed to generate resume:", err)
  process.exit(1)
})
