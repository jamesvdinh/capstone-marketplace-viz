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
  // Forms duplicates some questions across branches (e.g. a UCB-org vs.
  // external-org advisor block) with near-identical titles that don't merge
  // into one column in the Apps Script export. Take the first matching
  // column that actually has a value, not just the first match.
  const keys = Object.keys(raw).filter((k) => pattern.test(k));
  for (const key of keys) {
    const val = String(raw[key] ?? "").trim();
    if (val) return val;
  }
  return "";
};

const findAdvisorNames = (raw: Record<string, unknown>): string[] => {
  const advisor1 = findValue(raw, /^NAME of Project Advisor\s*#1/i);
  const advisor2 = findValue(raw, /^NAME of Project Advisor #2/i);
  return [advisor1, advisor2].filter((v) => v);
};

// The main "Accepting Student Applications from the following Departments"
// field never lists EECS - EECS recruiting is captured by a separate
// yes/no-style question instead, so it has to be folded in manually.
const EECS_EXTERNAL_RECRUITING =
  "Your project is recruiting EECS students and is an external organization. (We will be in touch with next steps.)";
const EECS_LABEL = "Electrical Engineering and Computer Science (EECS)";

// "UCB - EECS" -> "eecs"; "External Organization" -> ""
const extractDeptCode = (ucbAffiliation: string): string => {
  const match = ucbAffiliation.match(/^UCB\s*-\s*(.+)$/i);
  return match ? match[1].trim().toLowerCase() : "";
};

// Form file-uploads land as Drive "open?id=" viewer links, which don't
// render as an <img src>. `drive.google.com/thumbnail` resolves those, but
// its redirect response is sent as no-store/must-revalidate, so the browser
// can never cache that hop and every page load re-hits Google's endpoint
// for every project (and gets rate-limited under real project counts).
// Its target, lh3.googleusercontent.com, is a stable, directly-fetchable
// URL derived purely from the file id, and *is* cacheable (~24h) - build it
// directly and skip the uncacheable redirect entirely.
const resolveThumbnail = (driveUrl: string): string => {
  const match = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match
    ? `https://lh3.googleusercontent.com/d/${match[1]}=w300`
    : driveUrl;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseProjectData = (raw: any): Project => {
  const ucbAffiliation = findValue(raw, /^Project Advisor Affiliation/i);
  const rawThumbnail = findValue(
    raw,
    /^Please supply a sample visual for this project/i
  );

  const acceptingMajors = splitTags(
    findValue(
      raw,
      /^Accepting Student Applications from the following Departments/i
    )
  );
  const eecsRecruiting = findValue(raw, /^EECS Student Applications/i);
  if (
    eecsRecruiting === EECS_EXTERNAL_RECRUITING &&
    !acceptingMajors.includes(EECS_LABEL)
  ) {
    acceptingMajors.push(EECS_LABEL);
  }

  return {
    projectId: Number(raw["project_id"]),
    name: findValue(raw, /^Project Title/i),
    url: findValue(raw, /^Project Doc URL/i),

    // Transform comma-separated strings into Arrays
    keywords: splitTags(findValue(raw, /^Keywords/i)),
    advisorNames: findAdvisorNames(raw),
    acceptingMajors,

    // Standard strings
    affiliation: findValue(raw, /^Organization Name/i),
    ucbAffiliation,

    // Primary comes from the sample-visual upload; department image is a
    // separate fallback in case the primary URL 404s / isn't viewable.
    thumbnail: rawThumbnail ? resolveThumbnail(rawThumbnail) : "",
    thumbnailFallback: assignThumbnail(extractDeptCode(ucbAffiliation)),
  };
};
