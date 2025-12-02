import type { ImageMetadata } from 'astro'

export interface Project {
    title: string
    tag: string
    desc: string
    img: ImageMetadata
    link: string
    framework: string
}

import inksight from '../assets/websites/inksight.png'
import rdmd from '../assets/websites/rdmdstudio.webp'
import palms from '../assets/websites/palmsagency.webp'
import serialkitten from '../assets/websites/serialkitten.webp'
import dermadoc from '../assets/websites/dermadoc.webp'
import klbhs from '../assets/websites/klbhs.webp'
import whatscookin from '../assets/websites/whatscookin.webp'
import sync2va from '../assets/websites/sync2va.webp'

export const projects: Project[] = [
    {
        title: "InkSight",
        tag: 'client',
        desc: 'Tattoo Suite for RDMD Studio',
        img: inksight,
        link: 'https://inksight.rdmdstudio.com',
        framework: 'NextJs'
    },
    {
        title: "RDMD Studio",
        tag: 'client',
        desc: 'Tattoo Studio based in Cebu City',
        img: rdmd,
        link: 'https://rdmdstudio.com',
        framework: 'Astro'
    },
    {
        title: "Palms Agency Global",
        tag: 'client',
        desc: '',
        img: palms,
        link: 'https://palms-agency-global.com',
        framework: 'Astro'
    },
    {
        title: "SerialKitten",
        tag: 'client',
        desc: 'Major Production Company based in Manila',
        img: serialkitten,
        link: 'https://serialkitten.com',
        framework: 'Astro'
    },
    {
        title: "Derma Doc Skin Specialist",
        tag: 'client',
        desc: 'Dermatology store in the Philippines',
        img: dermadoc,
        link: 'https://dermadocskinspecialist.com',
        framework: 'NextJs'
    },
    {
        title: "KLBHS",
        tag: 'client',
        desc: '',
        img: klbhs,
        link: 'https://klbhs.com',
        framework: 'Astro'
    },
    {
        title: "WhatsCookin?",
        tag: 'personal',
        desc: 'Recipe Storage w/ AI integration',
        img: whatscookin,
        link: 'https://adrianbonpin.com',
        framework: 'NextJs'
    },
    {
        title: "Sync2VA",
        tag: 'client',
        desc: 'Virtual Assistant and Book Keeping Training Agency',
        img: sync2va,
        link: 'https://sync2va.com',
        framework: 'NextJs'
    },
]