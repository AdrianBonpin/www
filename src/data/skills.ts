// src/data/skills.ts
import type { SkillCategory } from "./types";

export const skillCategories: SkillCategory[] = [
  {
    category: "Languages",
    items: [
      { name: "TypeScript", level: 5 },
      { name: "JavaScript", level: 5 },
      { name: "HTML/CSS", level: 5 },
      { name: "Python", level: 3 },
      { name: "Rust", level: 2 },
      { name: "SQL", level: 3 },
    ],
  },
  {
    category: "Frameworks & Libraries",
    items: [
      { name: "Astro", level: 5 },
      { name: "Next.js", level: 5 },
      { name: "React", level: 4 },
      { name: "Tailwind CSS", level: 5 },
      { name: "Elysia", level: 4 },
      { name: "Bun", level: 4 },
      { name: "Node.js", level: 3 },
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      { name: "Git", level: 5 },
      { name: "Zed", level: 5 },
      { name: "Figma", level: 3 },
      { name: "Docker", level: 4 },
      { name: "Dokploy", level: 5 },
      { name: "Cloudflare", level: 4 },
    ],
  },
];
