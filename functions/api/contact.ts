// functions/api/contact.ts
// Cloudflare Pages Function — handles POST /api/contact
// Requires Cloudflare secrets: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL

interface Env {
  RESEND_API_KEY: string
  CONTACT_TO_EMAIL: string
  CONTACT_FROM_EMAIL: string
}

// Simple in-memory rate limiter (resets on worker cold start — acceptable for low-traffic)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }

  entry.count++
  return entry.count > 3
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "")
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // Feature flag — contact form is disabled
  // Remove this block and uncomment the code below to re-enable
  return new Response(JSON.stringify({
    ok: false,
    error: "Contact form is temporarily unavailable. Please email adrianbonpin@gmail.com directly.",
  }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  })

  /* ── RE-ENABLE: remove the return above and uncomment this block ──
  const ip = request.headers.get("CF-Connecting-IP") || "unknown"

  // Rate limit
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ ok: false, error: "Too many submissions. Please wait a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    })
  }

  let body: FormData
  try {
    body = await request.formData()
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid form data." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Honeypot check — silently succeed for bots
  const honeypot = body.get("website")?.toString() ?? ""
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  // Extract and sanitize fields
  const name = stripHtml(body.get("name")?.toString() ?? "").slice(0, 100)
  const email = stripHtml(body.get("email")?.toString() ?? "").slice(0, 254)
  const subject = stripHtml(body.get("subject")?.toString() ?? "").slice(0, 200)
  const message = stripHtml(body.get("message")?.toString() ?? "").slice(0, 5000)

  // Validate
  const errors: string[] = []
  if (name.length < 2) errors.push("Name must be at least 2 characters.")
  if (!isValidEmail(email)) errors.push("Please provide a valid email.")
  if (subject.length < 2) errors.push("Subject must be at least 2 characters.")
  if (message.length < 10) errors.push("Message must be at least 10 characters.")

  if (errors.length > 0) {
    return new Response(JSON.stringify({ ok: false, error: errors.join(" ") }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Send via Resend
  try {
    const resendApiKey = env.RESEND_API_KEY
    const toEmail = env.CONTACT_TO_EMAIL || "adrianbonpin@gmail.com"
    const fromEmail = env.CONTACT_FROM_EMAIL || "contact@adrianbonpin.com"

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Contact Form <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${name} (${email})\n\n${message}`,
      }),
    })

    if (!res.ok) {
      console.error("Resend API error:", await res.text())
      return new Response(JSON.stringify({ ok: false, error: "Something went wrong. Please try again." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Contact form error:", err)
    return new Response(JSON.stringify({ ok: false, error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
  ── END RE-ENABLE BLOCK ── */
}
