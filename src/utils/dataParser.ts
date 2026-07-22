import type { Project } from "../types/project";
import { assignThumbnail } from "./assignThumbnail";

const splitTags = (
  text: string,
  ...mods: Array<(s: string) => string>
): string[] => {
  if (typeof text !== "string") return [];
  return text
    .split(/[;,]/)
    .map((tag) => {
      const processedTag = tag.trim();
      if (!processedTag) return null;

      return mods.reduce((acc, fn) => fn(acc), processedTag);
    })
    .filter((tag): tag is string => tag !== null); // Clean up nulls
};

// Response-sheet headers are long, occasionally multi-line, and get
// re-wrapped by Google Forms, so columns are located by a stable prefix
// rather than an exact string match.
const findValue = (raw: Record<string, unknown>, pattern: RegExp): string => {
  const key = Object.keys(raw).find((k) => pattern.test(k));
  return key ? String(raw[key] ?? "").trim() : "";
};

const findAdvisorNames = (raw: Record<string, unknown>): string[] => {
  const advisor1 = findValue(raw, /^NAME of Project Advisor\s*#1/i);
  const advisor2 = findValue(raw, /^NAME of Project Advisor #2/i);
  return [advisor1, advisor2].filter((v) => v);
};

// "UCB - EECS" -> "eecs"; "External Organization" -> ""
const extractDeptCode = (ucbAffiliation: string): string => {
  const match = ucbAffiliation.match(/^UCB\s*-\s*(.+)$/i);
  return match ? match[1].trim().toLowerCase() : "";
};

// Form file-uploads land as Drive "open?id=" viewer links, which don't
// render as an <img src>; rewrite to Drive's public thumbnail endpoint.
const resolveThumbnail = (driveUrl: string): string => {
  const match = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match
    ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w600`
    : driveUrl;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseProjectData = (raw: any): Project => {
  const ucbAffiliation = findValue(raw, /^Project Advisor Affiliation/i);
  const rawThumbnail = findValue(
    raw,
    /^Please supply a sample visual for this project/i
  );

  return {
    projectId: Number(raw["project_id"]),
    name: findValue(raw, /^Project Title/i),
    url: findValue(raw, /^Project Doc URL/i),

    // Transform comma-separated strings into Arrays
    keywords: splitTags(findValue(raw, /^Keywords/i)),
    advisorNames: findAdvisorNames(raw),
    acceptingMajors: splitTags(
      findValue(
        raw,
        /^Accepting Student Applications from the following Departments/i
      )
    ),

    // Standard strings
    affiliation: findValue(raw, /^Organization Name/i),
    ucbAffiliation,

    // Primary comes from the sample-visual upload; department image is a
    // separate fallback in case the primary URL 404s / isn't viewable.
    thumbnail: rawThumbnail ? resolveThumbnail(rawThumbnail) : "",
    thumbnailFallback: assignThumbnail(extractDeptCode(ucbAffiliation)),
  };
};
