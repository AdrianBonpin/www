// src/data/site-config.ts
import type { SiteConfig } from "./types"

export const siteConfig: SiteConfig = {
  name: "Adrian Bonpin",
  title: "Full-Stack Developer & Creative Technologist",
  email: "adrianbonpin@gmail.com",
  location: "Philippines",
  socials: {
    gitea: "https://git.ranio.xyz/adrianbonpin",
    linkedin: "https://linkedin.com/in/adrianbonpin",
  },
  navItems: [
    { label: "home", href: "/" },
    { label: "projects", href: "/projects" },
    { label: "about", href: "/about" },
    { label: "resume", href: "/resume" },
    { label: "contact", href: "/contact" },
  ],
  contactFormEnabled: false,
}
