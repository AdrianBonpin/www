// src/data/experience.ts
import type { Experience } from "./types"

export const experiences: Experience[] = [
  {
    role: "Web Developer",
    company: "DEVGO Studio",
    companyUrl: "https://devgo.studio",
    startDate: "2024-01",
    highlights: [
      "Built 10+ custom websites and web applications for clients across industries",
      "Developed with Next.js, Astro, Tailwind CSS, and Cloudflare deployments",
      "Managed full project lifecycle from client onboarding to production launch",
      "Delivered responsive, accessible, and performant sites with Lighthouse scores ≥ 95",
    ],
    type: "freelance",
  },
  {
    role: "Full-Stack Developer",
    company: "Independent",
    companyUrl: undefined,
    startDate: "2023-06",
    endDate: "2023-12",
    highlights: [
      "Built personal projects including WhatsCookin? (AI recipe app) and GroundsPH (cafe catalog)",
      "Integrated OpenAI API, Mapbox, and Supabase into production applications",
      "Explored modern stacks: Next.js App Router, Astro SSG, and serverless architecture",
    ],
    type: "freelance",
  },
]
