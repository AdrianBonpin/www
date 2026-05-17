// src/data/skills.ts
import type { SkillCategory } from "./types"

export const skillCategories: SkillCategory[] = [
  {
    category: "Languages",
    items: [
      { name: "TypeScript", level: 5 },
      { name: "JavaScript", level: 5 },
      { name: "HTML/CSS", level: 5 },
      { name: "Python", level: 3 },
      { name: "SQL", level: 3 },
    ],
  },
  {
    category: "Frameworks & Libraries",
    items: [
      { name: "React", level: 4 },
      { name: "Next.js", level: 5 },
      { name: "Astro", level: 5 },
      { name: "Tailwind CSS", level: 5 },
      { name: "Node.js", level: 3 },
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      { name: "Git", level: 5 },
      { name: "VS Code", level: 5 },
      { name: "Figma", level: 3 },
      { name: "Docker", level: 2 },
      { name: "Cloudflare", level: 4 },
    ],
  },
]
