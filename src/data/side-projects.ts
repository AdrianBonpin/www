// src/data/side-projects.ts
import type { SideProject } from "./types"
import type { ImageMetadata } from "astro"

import rantemper from "../assets/side-projects/rantemper.jpg"

export const sideProjects: SideProject[] = [
  {
    title: "RanTemper",
    tags: ["ZMK", "3D Modeling", "Split Keyboard"],
    desc: "A custom config and case for the temper by raeedcho.",
    img: {
      src: rantemper as ImageMetadata,
      alt: "RanTemper split keyboard",
    },
    link: "https://git.ranio.xyz/adrianbonpin/temper-case-and-config",
  },
]
