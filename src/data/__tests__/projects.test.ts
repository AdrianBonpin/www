import { describe, it, expect } from "bun:test"
import { projects } from "../projects"

describe("projects data", () => {
  it("should have Palms Agency Global with year 2025", () => {
    const p = projects.find((pr) => pr.title === "Palms Agency Global")
    expect(p).toBeDefined()
    expect(p!.year).toBe(2025)
  })

  it("should have RDMD Studio with year 2026", () => {
    const p = projects.find((pr) => pr.title === "RDMD Studio")
    expect(p).toBeDefined()
    expect(p!.year).toBe(2026)
  })

  it("should have InkSight with year 2026", () => {
    const p = projects.find((pr) => pr.title === "InkSight")
    expect(p).toBeDefined()
    expect(p!.year).toBe(2026)
  })

  it("should have GroundsPH with year 2026", () => {
    const p = projects.find((pr) => pr.title === "GroundsPH")
    expect(p).toBeDefined()
    expect(p!.year).toBe(2026)
  })

  it("should have improved Palms description", () => {
    const p = projects.find((pr) => pr.title === "Palms Agency Global")
    expect(p).toBeDefined()
    expect(p!.desc.includes("Creator")).toBe(true)
  })

  it("should have improved RDMD description mentioning Cebu", () => {
    const p = projects.find((pr) => pr.title === "RDMD Studio")
    expect(p).toBeDefined()
    expect(p!.desc.includes("Cebu")).toBe(true)
  })

  it("should have improved GroundsPH description mentioning discovery", () => {
    const p = projects.find((pr) => pr.title === "GroundsPH")
    expect(p).toBeDefined()
    expect(p!.desc.includes("discovery")).toBe(true)
  })

  it("should have at least 12 total projects", () => {
    expect(projects.length).toBeGreaterThanOrEqual(12)
  })
})