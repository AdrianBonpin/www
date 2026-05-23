// src/data/projects.ts
import type { ImageMetadata } from "astro";

export interface Project {
  title: string;
  type: "client" | "personal";
  desc: string;
  img: ImageMetadata;
  link: string;
  framework: string;
  techTags: string[];
  role: string;
  year: number;
}

import devgo from "../assets/websites/devgo.png";
import grounds from "../assets/websites/groundsph.jpeg";
import inksight from "../assets/websites/inksight.png";
import rdmd from "../assets/websites/rdmdstudio.webp";
import palms from "../assets/websites/palmsagency.webp";
import serialkitten from "../assets/websites/serialkitten.webp";
import dermadoc from "../assets/websites/dermadoc.webp";
import klbhs from "../assets/websites/klbhs.webp";
import whatscookin from "../assets/websites/whatscookin.webp";
import sync2va from "../assets/websites/sync2va.webp";
import deckyvault from "../assets/websites/deckyvault.png";
import serialkittenv2 from "../assets/websites/serialkitten-v2.png";

export const projects: Project[] = [
  {
    title: "SerialKitten",
    type: "client",
    desc: "Major Production Company based in Manila",
    img: serialkittenv2,
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
    img: deckyvault,
    link: "https://deckyvault.xyz",
    framework: "NextJs",
    techTags: ["React", "Next.js", "Tailwind", "PostgreSQL", "Elysia"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "DEVGO Website",
    type: "personal",
    desc: "Website for our software development agency, DEVGO",
    img: devgo,
    link: "https://devgo.studio",
    framework: "Astro",
    techTags: ["Astro", "Tailwind", "PixiJs", "Anime.js"],
    role: "Solo Developer",
    year: 2026,
  },
  {
    title: "GroundsPH",
    type: "personal",
    desc: "Community Driven Cafe Catalog for the Philippines",
    img: grounds,
    link: "https://grounds.ph",
    framework: "NextJs",
    techTags: ["React", "Next.js", "Tailwind", "Mapbox"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "InkSight",
    type: "client",
    desc: "Tattoo Suite for RDMD Studio",
    img: inksight,
    link: "https://inksight.rdmdstudio.com",
    framework: "NextJs",
    techTags: ["React", "Next.js", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "RDMD Studio",
    type: "client",
    desc: "Tattoo Studio based in Cebu City",
    img: rdmd,
    link: "https://rdmdstudio.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "Palms Agency Global",
    type: "client",
    desc: "Global agency website",
    img: palms,
    link: "https://palms-agency-global.com",
    framework: "Astro",
    techTags: ["Astro", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "SerialKitten",
    type: "client",
    desc: "Major Production Company based in Manila",
    img: serialkitten,
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
    img: dermadoc,
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
    img: klbhs,
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
    img: whatscookin,
    link: "https://adrianbonpin.com",
    framework: "NextJs",
    techTags: ["React", "Next.js", "Tailwind", "OpenAI"],
    role: "Solo Developer",
    year: 2024,
  },
  {
    title: "Sync2VA",
    type: "client",
    desc: "Virtual Assistant and Book Keeping Training Agency",
    img: sync2va,
    link: "https://sync2va.com",
    framework: "NextJs",
    techTags: ["React", "Next.js", "Tailwind"],
    role: "Solo Developer",
    year: 2024,
  },
];
