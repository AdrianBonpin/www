import { describe, it, expect, beforeAll } from "bun:test"
import { existsSync, unlinkSync } from "fs"
import { resolve } from "path"
import { $ } from "bun"
import { inflateSync } from "zlib"

const OUTPUT_PATH = resolve(__dirname, "../../public/resume.pdf")
const SCRIPT_PATH = resolve(__dirname, "../generate-resume.ts")

/** Extract readable text from a PDF by decompressing FlateDecode streams
 *  and decoding hex-encoded PDF strings (<41647269616E> → "Adrian") */
function extractPdfText(pdfBytes: Uint8Array): string {
  const pdf = Buffer.from(pdfBytes).toString("latin1")

  // Inflate all FlateDecode streams
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  let match: RegExpExecArray | null
  let allContent = ""
  while ((match = streamRegex.exec(pdf)) !== null) {
    try {
      const compressed = Buffer.from(match[1], "binary")
      const decompressed = inflateSync(compressed)
      allContent += decompressed.toString("latin1")
    } catch {
      // some streams are not valid deflate
    }
  }

  // Decode hex-encoded PDF strings: <41647269616E> → "Adrian"
  const decodedParts: string[] = []
  const hexRegex = /<([0-9A-Fa-f]+)>/g
  let hexMatch: RegExpExecArray | null
  while ((hexMatch = hexRegex.exec(allContent)) !== null) {
    const hex = hexMatch[1]
    let decoded = ""
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substring(i, i + 2), 16)
      if (byte >= 32 && byte <= 126) decoded += String.fromCharCode(byte)
    }
    if (decoded.length > 0) decodedParts.push(decoded)
  }

  return decodedParts.join(" ")
}

describe("generate-resume script", () => {
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

  it("should produce a valid PDF with synced project data", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))

    // Project names must appear
    expect(text).toContain("DeckyVault")
    expect(text).toContain("RDMD")
    expect(text).toContain("GroundsPH")

    // Year 2026 must appear in projects section
    expect(text.includes("2026")).toBe(true)

    // OLD descriptions should NOT appear (verifies sync with src/data/projects.ts)
    expect(text).not.toContain("Community Driven Cafe Catalog for the Philippines")
    expect(text).not.toContain("Tattoo Suite for RDMD Studio")
    expect(text).not.toContain("Tattoo Studio based in Cebu City")

    // NEW descriptions should appear
    expect(text).toContain("Community-driven cafe discovery platform")
    expect(text).toContain("Tattoo portfolio management and booking suite")
    expect(text).toContain("Multi-location tattoo and piercing studio")
  })

  it("should contain the PhilNITS FE certificate", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))
    expect(text).toContain("PhilNITS")
  })

  it("should contain the Cisco Networking Academy certificates", async () => {
    const pdfBytes = await Bun.file(OUTPUT_PATH).arrayBuffer()
    const text = extractPdfText(new Uint8Array(pdfBytes))
    expect(text).toContain("Cisco Networking Academy")
    expect(text).toContain("CCNAv7")
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