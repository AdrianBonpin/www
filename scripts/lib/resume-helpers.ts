// scripts/lib/resume-helpers.ts
// Text helpers shared by the resume (styled) and CV (ATS plain) PDF generators.

/** Greedy word wrap using the embedded font's own metrics. */
export function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  size: number
): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const test = current ? current + " " + word : word
    const w = font.widthOfTextAtSize(test, size)
    if (w > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

/** "2024-01", "2025-06" -> "Jan 2024 - Jun 2025". Open-ended -> "Present". */
export function formatDateRange(start: string, end?: string): string {
  const fmt = (d: string) => {
    const [y, m] = d.split("-")
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    return `${months[parseInt(m) - 1]} ${y}`
  }
  return `${fmt(start)} - ${end ? fmt(end) : "Present"}`
}

/** Employment badge (e.g. "Sideline"), falling back to the type-derived label. */
export function employmentLabel(exp: {
  type: string
  employmentType?: string
}): string | null {
  if (exp.employmentType) {
    return exp.employmentType.charAt(0).toUpperCase() + exp.employmentType.slice(1)
  }
  return exp.type === "freelance" ? "Freelance" : null
}
