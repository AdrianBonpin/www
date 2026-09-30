// src/data/resume-projects.ts
// Curated project list for the resume & CV (web page + PDF exports).
//
// Starts from the same featured set curated on the home page, then adds
// resume-only work that isn't on the portfolio (e.g. broadcast suites).
// Text-only — safe for Node build scripts (no Astro image imports).
import { projectTexts, type ProjectText } from "./projects-data";

/** Curated, highest-signal projects — shared with the home page. Order matters. */
export const featuredProjectTitles = [
  "Wild Rounds Pilipinas Open",
  "GroundsPH",
  "Gridline",
  "DeckyVault",
];

export interface ResumeProject {
  title: string;
  year: number;
  type: "client" | "personal";
  role: string;
  desc: string;
  techTags: string[];
  link?: string;
}

/** Resume-only copy for featured projects whose portfolio blurb is too thin. */
const resumeDescOverrides: Record<string, string> = {
  "Wild Rounds Pilipinas Open":
    "Official tournament website plus a broadcast suite for SerialKitten and DragonAI — realtime API transformation, game data capture, web-based stream assets, and tournament data.",
};

/** Work featured on the resume & CV but not listed on the portfolio. */
const resumeOnlyProjects: ResumeProject[] = [
  {
    title: "Philippine Kings League (Fall 2026)",
    year: 2026,
    type: "client",
    role: "Broadcast Suite Developer",
    desc: "Broadcast suite for SerialKitten and DragonAI with realtime API transformation, game data capture, web-based stream assets, and tournament data.",
    techTags: [],
  },
];

function toResumeProject(project: ProjectText): ResumeProject {
  return {
    title: project.title,
    year: project.year,
    type: project.type,
    role: project.role,
    desc: resumeDescOverrides[project.title] ?? project.desc,
    techTags: project.techTags,
    link: project.link,
  };
}

const featuredProjects = featuredProjectTitles
  .map((title) => projectTexts.find((p) => p.title === title))
  .filter((p): p is ProjectText => p !== undefined)
  .map(toResumeProject);

/**
 * Resume/CV projects in display order: flagship featured work first, then
 * resume-only work, then the remaining featured projects.
 */
export const resumeProjects: ResumeProject[] = [
  ...featuredProjects.slice(0, 1),
  ...resumeOnlyProjects,
  ...featuredProjects.slice(1),
];
