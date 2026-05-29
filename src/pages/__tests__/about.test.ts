import { describe, it, expect, beforeAll } from "bun:test"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { $ } from "bun"

const DIST_ABOUT = resolve(__dirname, "../../../dist/about/index.html")

describe("About page build output", () => {
  beforeAll(async () => {
    const result = await $`bun run astro build`.nothrow()
    if (result.exitCode !== 0) {
      console.error("Build failed:", result.stderr.toString())
    }
  }, { timeout: 30000 })

  it("should produce the about HTML page", () => {
    expect(existsSync(DIST_ABOUT)).toBe(true)
  })

  it("should contain the PhilNITS FE certification", () => {
    const html = readFileSync(DIST_ABOUT, "utf-8")
    expect(html).toContain("PhilNITS FE")
  })

  it("should display 'Expected 2027' for in-progress education", () => {
    const html = readFileSync(DIST_ABOUT, "utf-8")
    expect(html).toContain("Expected 2027")
  })

  it("should still display Xavier SHS", () => {
    const html = readFileSync(DIST_ABOUT, "utf-8")
    expect(html).toContain("Xavier University Ateneo de Cagayan")
  })
})
