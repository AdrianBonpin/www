import { inflateSync } from "zlib"

/**
 * Extract readable text from a PDF by decompressing FlateDecode streams and
 * decoding hex-encoded PDF strings (`<41647269616E>` → `Adrian`).
 * Shared by the resume and CV generator tests.
 */
export function extractPdfText(pdfBytes: Uint8Array): string {
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
