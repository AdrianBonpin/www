// src/data/side-projects.ts
import type { SideProject } from "./types"
import type { ImageMetadata } from "astro"

import rantemper from "../assets/side-projects/rantemper.jpg"
import tremorWatch from "../assets/side-projects/tremor-watch.png"

export const sideProjects: SideProject[] = [
  {
    title: "RanTemper",
    tags: ["ZMK", "3D Modeling", "Split Keyboard"],
    desc: "A custom config and case for the temper by raeedcho.",
    img: {
      src: rantemper as ImageMetadata,
      alt: "RanTemper split keyboard",
    },
    link: "https://github.com/AdrianBonpin/temper-case-and-config",
  },
  {
    title: "Tremor Watch",
    tags: ["Discord.js", "Mapbox", "Groq AI"],
    desc: "A Discord bot that notifies servers of the latest earthquakes from Phivolcs or USGS.",
    img: {
      src: tremorWatch as ImageMetadata,
      alt: "Tremor Watch Discord Bot",
    },
    link: "https://github.com/AdrianBonpin/tremor-watch",
  },
]
