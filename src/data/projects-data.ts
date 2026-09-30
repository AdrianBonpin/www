// src/data/projects-data.ts
// Text-only project data. Kept free of Astro image imports so it can be safely
// consumed by Node build scripts (resume/CV PDF generators) as well as Astro.
// `src/data/projects.ts` attaches the matching screenshot metadata.

export interface ProjectText {
  title: string;
  type: "client" | "personal";
  desc: string;
  /** Key into the image map in `projects.ts` */
  image: string;
  link: string;
  framework: string;
  techTags: string[];
  role: string;
  year: number;
}

export const projectTexts: ProjectText[] = [
  {
    title: "Wild Rounds Pilipinas Open",
    type: "client",
    desc: "Competitive Gaming Tournament Platform — #RoadToSmash",
    image: "wildrounds",
    link: "https://wildroundspilipinasopen.com",
    framework: "Astro",
    techTags: ["Tailwind"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "SerialKitten",
    type: "client",
    desc: "Major Production Company based in Manila",
    image: "serialkittenv2",
    link: "https://serialkitten.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "DeckyVault",
    type: "personal",
    desc: "A fast, modern browser for finding game benchmarks, settings, and guides for Steam Deck OLED & LCD",
    image: "deckyvault",
    link: "https://deckyvault.xyz",
    framework: "Next.js",
    techTags: ["React", "Next.js", "Tailwind", "PostgreSQL", "Elysia"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "Gridline",
    type: "personal",
    desc: "A lightweight, open-source database GUI for PostgreSQL, MySQL, SQLite, and Redis",
    image: "gridline",
    link: "https://getgridline.app",
    framework: "Tauri",
    techTags: ["Rust", "React", "SQLite"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "DEVGO Website",
    type: "personal",
    desc: "Website for our software development agency, DEVGO",
    image: "devgo",
    link: "https://devgo.studio",
    framework: "Astro",
    techTags: ["Astro", "Tailwind", "PixiJs", "Anime.js"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "GroundsPH",
    type: "personal",
    desc: "Community-driven cafe discovery platform featuring leaderboards, reviews, and curated Filipino coffee culture",
    image: "grounds",
    link: "https://grounds.ph",
    framework: "Next.js",
    techTags: ["React", "Next.js", "Tailwind", "Mapbox"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "InkSight",
    type: "client",
    desc: "Tattoo portfolio management and booking suite built for RDMD Studio artists and clients",
    image: "inksight",
    link: "https://inksight.rdmdstudio.com",
    framework: "Next.js",
    techTags: ["React", "Next.js", "Tailwind"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "RDMD Studio",
    type: "client",
    desc: "Multi-location tattoo and piercing studio with branches in Cebu and Manila, plus an in-house apparel line",
    image: "rdmd",
    link: "https://rdmdstudio.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "Palms Agency Global",
    type: "client",
    desc: "Creator growth agency specializing in content strategy, personal branding, and monetization",
    image: "palms",
    link: "https://palms-agency-global.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2025,
  },
  {
    title: "SerialKitten",
    type: "client",
    desc: "Major Production Company based in Manila",
    image: "serialkitten",
    link: "https://serialkitten.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "Derma Doc Skin Specialist",
    type: "client",
    desc: "Dermatology store in the Philippines",
    image: "dermadoc",
    link: "https://dermadocskinspecialist.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "KLBHS",
    type: "client",
    desc: "School website",
    image: "klbhs",
    link: "https://klbhs.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "WhatsCookin?",
    type: "personal",
    desc: "Recipe Storage w/ AI integration",
    image: "whatscookin",
    link: "https://adrianbonpin.com",
    framework: "Next.js",
    techTags: ["React", "Next.js", "Tailwind", "OpenAI"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "Sync2VA",
    type: "client",
    desc: "Virtual Assistant and Book Keeping Training Agency",
    image: "sync2va",
    link: "https://sync2va.com",
    framework: "Next.js",
    techTags: ["React", "Next.js", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
];
