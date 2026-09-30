import { describe, it, expect, beforeAll } from "bun:test"
import { existsSync, unlinkSync } from "fs"
import { resolve } from "path"
import { $ } from "bun"
import { extractPdfText } from "./pdf-test-utils"

const OUTPUT_PATH = resolve(__dirname, "../../public/cv.pdf")
const SCRIPT_PATH = resolve(__dirname, "../generate-cv.ts")

describe("generate-cv script", () => {
  beforeAll(() => {
    if (existsSync(OUTPUT_PATH)) {
      unlinkSync(OUTPUT_PATH)
    }
  })

  it("should execute successfully and produce a PDF", async () => {
    const result = await $`bun ${SCRIPT_PATH}`.nothrow()
    expect(result.exitCode).toBe(0)
    expect(existsSync(OUTPUT_PATH)).toBe(true)
  })

  it("should produce a non-empty PDF file", () => {
    const file = Bun.file(OUTPUT_PATH)
    expect(file.size).toBeGreaterThan(1000)
  })

  it("should contain the shared header, summary and sections", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))

    expect(text).toContain("Adrian Bonpin")
    expect(text).toContain("Full-Stack Developer & Creative Technologist")
    expect(text).toContain("PROFESSIONAL SUMMARY")
    expect(text).toContain("PROFESSIONAL EXPERIENCE")
    expect(text).toContain("SELECTED PROJECTS")
    expect(text).toContain("TECHNICAL SKILLS")
    expect(text).toContain("CERTIFICATIONS")
  })

  it("should list the curated featured + resume projects", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))

    expect(text).toContain("Wild Rounds Pilipinas Open")
    expect(text).toContain("Philippine Kings League")
    expect(text).toContain("GroundsPH")
    expect(text).toContain("Gridline")
    expect(text).toContain("DeckyVault")

    // Gridline now points at its own domain
    expect(text).toContain("https://getgridline.app")

    // Unfeatured projects are no longer listed
    expect(text).not.toContain("Tattoo portfolio management and booking suite")
    expect(text).not.toContain("Multi-location tattoo and piercing studio")
  })

  it("should mark DEVGO Studio as a sideline", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))
    expect(text).toContain("DEVGO Studio (Sideline)")
  })

  it("should contain the PhilNITS FE certificate", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))
    expect(text).toContain("PhilNITS")
  })

  it("should show 'Expected 2027' for in-progress education", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))
    expect(text).toContain("Expected 2027")
  })

  it("should have a PDF with at least 1 page", async () => {
    const { PDFDocument } = await import("pdf-lib")
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    expect(pdfDoc.getPages().length).toBeGreaterThanOrEqual(1)
  })
})
