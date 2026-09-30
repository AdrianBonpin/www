// src/data/projects.ts
// Attaches screenshot metadata to the text-only project data in
// `projects-data.ts`. Keeping the text separate lets Node build scripts
// (resume/CV generators) reuse the data without importing image assets.
import type { ImageMetadata } from "astro";
import { projectTexts, type ProjectText } from "./projects-data";

import wildrounds from "../assets/websites/wildrounds.png";
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
import gridline from "../assets/websites/gridline.png";

export type { ProjectText };

const images: Record<string, ImageMetadata> = {
  wildrounds,
  devgo,
  grounds,
  inksight,
  rdmd,
  palms,
  serialkitten,
  dermadoc,
  klbhs,
  whatscookin,
  sync2va,
  deckyvault,
  serialkittenv2,
  gridline,
};

export interface Project extends ProjectText {
  img: ImageMetadata;
}

export const projects: Project[] = projectTexts.map((project) => {
  const img = images[project.image];
  if (!img) {
    throw new Error(
      `No screenshot registered for project "${project.title}" (image: "${project.image}")`
    );
  }
  return { ...project, img };
});
