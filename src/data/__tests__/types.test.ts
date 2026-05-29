// src/data/__tests__/types.test.ts
import { describe, it, expect } from "bun:test"
import type { Certificate, Education } from "../types"

describe("Certificate type", () => {
  it("should allow a valid Certificate object with all fields", () => {
    const cert: Certificate = {
      name: "PhilNITS FE",
      issuer: "Philippine National IT Standards Foundation",
      year: 2026,
      url: "https://philnits.org/passers-fe/",
      description: "Fundamental Engineer certification",
      status: "passed",
    }
    expect(cert.name).toBe("PhilNITS FE")
    expect(cert.year).toBe(2026)
    expect(cert.status).toBe("passed")
  })

  it("should allow a Certificate with only required fields", () => {
    const cert: Certificate = {
      name: "Test Cert",
      issuer: "Test Issuer",
      year: 2025,
    }
    expect(cert.name).toBe("Test Cert")
    expect(cert.url).toBeUndefined()
    expect(cert.status).toBeUndefined()
  })
})

describe("Education type — backward compatibility", () => {
  it("should accept an Education without status (backward compat)", () => {
    const edu: Education = {
      institution: "Test University",
      credential: "BS",
      field: "CS",
      year: 2022,
    }
    expect(edu.year).toBe(2022)
    expect(edu.status).toBeUndefined()
  })

  it("should accept an Education with status: 'expected'", () => {
    const edu: Education = {
      institution: "Test University",
      credential: "BS",
      field: "CS",
      year: 2027,
      status: "expected",
    }
    expect(edu.year).toBe(2027)
    expect(edu.status).toBe("expected")
  })

  it("should accept status: 'in-progress'", () => {
    const edu: Education = {
      institution: "Test University",
      credential: "BS",
      field: "CS",
      year: 2027,
      status: "in-progress",
    }
    expect(edu.status).toBe("in-progress")
  })

  it("should accept status: 'completed'", () => {
    const edu: Education = {
      institution: "Test University",
      credential: "BS",
      field: "CS",
      year: 2022,
      status: "completed",
    }
    expect(edu.status).toBe("completed")
  })
})