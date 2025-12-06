import type { ImageMetadata } from "astro"

interface SideProject {
    title: string
    tags: string[]
    desc: string
    img: {
        src: ImageMetadata
        alt: string
    }
    link: string
}

import rantemper from "../assets/side-projects/rantemper.jpg"
import tremorWatch from "../assets/side-projects/tremor-watch.png"

export const sideProjects: SideProject[] = [
    {
        title: "RanTemper",
        tags: ["ZMK", "3D Modeling", "Split Keyboard"],
        desc: "A custom config and case for the temper by raeedcho.",
        img: {
            src: rantemper,
            alt: "RanTemper"
        },
        link: "https://github.com/AdrianBonpin/zmk-temper"
    },
    {
        title: "Tremor Watch",
        tags: ["Discord.js", "Mapbox", "Groq AI"],
        desc: "A Discord bot that notifies servers of the latest earthquakes from Phivolcs or USGS.",
        img: {
            src: tremorWatch,
            alt: "Tremor Watch Discord Bot"
        },
        link: "https://github.com/AdrianBonpin/tremor-watch"
    }
]