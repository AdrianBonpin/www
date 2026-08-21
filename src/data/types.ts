// src/data/types.ts
// Shared type definitions for all data files

import type { ImageMetadata } from "astro"

export interface Skill {
  name: string
  /** Proficiency: 1 = beginner, 5 = expert */
  level: 1 | 2 | 3 | 4 | 5
}

export interface SkillCategory {
  category: string // "Languages", "Frameworks", "Tools", "Design"
  items: Skill[]
}

export interface Experience {
  role: string
  company: string
  companyUrl?: string
  startDate: string // "YYYY-MM"
  endDate?: string   // "YYYY-MM" or undefined if current
  highlights: string[]
  type: "work" | "freelance" | "education"
}

export interface Education {
  institution: string
  credential: string
  field: string
  /** Graduation year or expected graduation year */
  year: number
  /** Status: "completed" | "in-progress" | "expected". Defaults to "completed" when absent */
  status?: "completed" | "in-progress" | "expected"
  /** Optional description or additional context */
  description?: string
}

export interface Certificate {
  name: string
  issuer: string
  year: number
  /** Optional URL to verify the certificate (e.g., PhilNITS passers list) */
  url?: string
  /** Optional description or additional context */
  description?: string
  /** Whether the certificate has been physically received */
  status?: "passed" | "awarded"
}

export interface SiteConfig {
  name: string
  title: string
  email: string
  location: string
  socials: {
    gitea: string
    linkedin: string
  }
  navItems: NavItem[]
  contactFormEnabled: boolean
}

export interface NavItem {
  label: string
  href: string
}

export interface SideProject {
  title: string
  tags: string[]
  desc: string
  link: string
  img: {
    src: ImageMetadata
    alt: string
  }
}
