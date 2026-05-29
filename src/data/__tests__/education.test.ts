import { describe, it, expect } from "bun:test"
import { education } from "../education"

describe("education data", () => {
  it("should export a non-empty array", () => {
    expect(education).toBeDefined()
    expect(education.length).toBeGreaterThan(0)
  })

  it("should have USC BSIT with year 2027 and status 'expected'", () => {
    const usc = education.find(
      (e) => e.institution === "University of San Carlos"
    )
    expect(usc).toBeDefined()
    expect(usc!.year).toBe(2027)
    expect(usc!.status).toBe("expected")
  })

  it("should have Xavier SHS with year 2022", () => {
    const xavier = education.find(
      (e) => e.institution === "Xavier University Ateneo de Cagayan"
    )
    expect(xavier).toBeDefined()
    expect(xavier!.year).toBe(2022)
  })

  it("should have exactly 2 entries", () => {
    expect(education.length).toBe(2)
  })
})