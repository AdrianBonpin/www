import { describe, it, expect } from "bun:test"
import { certificates } from "../certificates"

describe("certificates data", () => {
  it("should export a non-empty array", () => {
    expect(certificates).toBeDefined()
    expect(Array.isArray(certificates)).toBe(true)
    expect(certificates.length).toBeGreaterThan(0)
  })

  it("should contain a PhilNITS FE entry", () => {
    const philnits = certificates.find(
      (c) => c.name === "PhilNITS FE" && c.issuer === "Philippine National IT Standards Foundation"
    )
    expect(philnits).toBeDefined()
    expect(philnits!.year).toBe(2026)
    expect(philnits!.status).toBe("passed")
    expect(philnits!.url).toContain("philnits.org")
  })

  it("should have at most 1 entry (only PhilNITS FE for now)", () => {
    expect(certificates.length).toBe(1)
  })
})