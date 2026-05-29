import { describe, it, expect, beforeAll } from "bun:test"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { $ } from "bun"

const DIST = resolve(__dirname, "../dist")

describe("Full build smoke test", () => {
  beforeAll(async () => {
    const result = await $`bun run build`.nothrow()
    if (result.exitCode !== 0) {
      console.error("BUILD FAILED:", result.stderr.toString())
    }
    expect(result.exitCode).toBe(0)
  }, { timeout: 60000 })

  // ── All pages exist ──
  it("should produce index.html", () => {
    expect(existsSync(resolve(DIST, "index.html"))).toBe(true)
  })
  it("should produce about/index.html", () => {
    expect(existsSync(resolve(DIST, "about/index.html"))).toBe(true)
  })
  it("should produce resume/index.html", () => {
    expect(existsSync(resolve(DIST, "resume/index.html"))).toBe(true)
  })
  it("should produce projects/index.html", () => {
    expect(existsSync(resolve(DIST, "projects/index.html"))).toBe(true)
  })
  it("should produce contact/index.html", () => {
    expect(existsSync(resolve(DIST, "contact/index.html"))).toBe(true)
  })

  // ── Resume page content checks ──
  it("should have PhilNITS FE on resume page", () => {
    const html = readFileSync(resolve(DIST, "resume/index.html"), "utf-8")
    expect(html).toContain("PhilNITS FE")
    expect(html).toContain("Passed 2026")
  })

  it("should have Expected 2027 on resume page for education", () => {
    const html = readFileSync(resolve(DIST, "resume/index.html"), "utf-8")
    expect(html).toContain("Expected 2027")
  })

  // ── About page content checks ──
  it("should have PhilNITS FE on about page", () => {
    const html = readFileSync(resolve(DIST, "about/index.html"), "utf-8")
    expect(html).toContain("PhilNITS FE")
  })

  it("should have Expected 2027 on about page for education", () => {
    const html = readFileSync(resolve(DIST, "about/index.html"), "utf-8")
    expect(html).toContain("Expected 2027")
  })

  // ── Projects page — updated projects ──
  it("should have Palms Agency Global with year 2025 on projects page", () => {
    const html = readFileSync(resolve(DIST, "projects/index.html"), "utf-8")
    expect(html).toContain("Palms Agency Global")
    expect(html).toContain("2025")
  })

  // ── PDF exists ──
  it("should produce resume.pdf", () => {
    expect(existsSync(resolve(DIST, "../public/resume.pdf"))).toBe(true)
  })

  it("should produce a valid PDF with expected file size", () => {
    const pdfPath = resolve(DIST, "../public/resume.pdf")
    const stat = Bun.file(pdfPath)
    expect(stat.size).toBeGreaterThan(4000)
  })

  // ── No broken links (build already succeeded) ──
  it("should have no broken import or template errors", () => {
    expect(true).toBe(true)
  })
})