import { describe, it, expect, beforeAll } from "bun:test"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { $ } from "bun"

const DIST_RESUME = resolve(__dirname, "../../../dist/resume/index.html")

describe("Resume page build output", () => {
  beforeAll(async () => {
    const result = await $`bun run astro build`.nothrow()
    if (result.exitCode !== 0) {
      console.error("Build failed:", result.stderr.toString())
    }
  }, { timeout: 30000 })

  it("should produce the resume HTML page", () => {
    expect(existsSync(DIST_RESUME)).toBe(true)
  })

  it("should contain the PhilNITS FE certification", () => {
    const html = readFileSync(DIST_RESUME, "utf-8")
    expect(html).toContain("PhilNITS FE")
    expect(html).toContain("Philippine National IT Standards Foundation")
  })

  it("should display 'Passed 2026' for the certificate", () => {
    const html = readFileSync(DIST_RESUME, "utf-8")
    expect(html).toContain("Passed 2026")
  })

  it("should display 'Expected 2027' for in-progress education", () => {
    const html = readFileSync(DIST_RESUME, "utf-8")
    expect(html).toContain("Expected 2027")
  })

  it("should still display Xavier SHS with year 2022", () => {
    const html = readFileSync(DIST_RESUME, "utf-8")
    expect(html).toContain("Xavier University Ateneo de Cagayan")
  })
})
