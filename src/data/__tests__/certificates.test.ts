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

  it("should include the Cisco Networking Academy certificates", () => {
    const cisco = certificates.filter((c) => c.issuer === "Cisco Networking Academy")
    expect(cisco.map((c) => c.name)).toEqual([
      "Cybersecurity Essentials",
      "Introduction to Cybersecurity",
      "CCNAv7: Switching, Routing, and Wireless Essentials",
      "CCNAv7: Introduction to Networks",
    ])
    for (const cert of cisco) {
      expect(cert.status).toBe("awarded")
      expect(cert.url).toMatch(/^\/certificates\/.+\.pdf$/)
    }
  })

  it("should give every certificate a name and a verify/view link", () => {
    for (const cert of certificates) {
      expect(cert.name.length).toBeGreaterThan(0)
      expect(cert.issuer.length).toBeGreaterThan(0)
      expect(cert.url).toBeTruthy()
    }
  })
})
