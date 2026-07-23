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
// single-select question instead, so it has to be folded in manually.
// That question branches on advisor affiliation and has a distinct
// "recruiting" answer for each branch (external org / UCB-EECS advisor /
// UCB non-EECS advisor with an EECS collaborator) plus one "not recruiting"
// answer - all three "recruiting" variants must be treated as EECS-accepting.
const EECS_RECRUITING_ANSWERS = new Set([
  "Your project is recruiting EECS students and is an external organization. (We will be in touch with next steps.)",
  "Your project is recruiting EECS students and the PRIMARY or SECONDARY Advisor is in the EECS Dept.",
  "Your project is recruiting EECS students and you’ve identified an EECS faculty collaborator.",
]);
const EECS_LABEL = "Electrical Engineering and Computer Science (EECS)";

// "UCB - EECS" -> "eecs"; "External Organization" -> ""
const extractDeptCode = (ucbAffiliation: string): string => {
  const match = ucbAffiliation.match(/^UCB\s*-\s*(.+)$/i);
  return match ? match[1].trim().toLowerCase() : "";
};

// The industry question is a checkbox (multi-select) field, and Google Forms
// exports checkbox answers as a plain comma-joined string of the selected
// labels - but several of the labels themselves contain commas (e.g. "Arts,
// Media, Entertainment"), so a naive split(",") shreds those into bogus
// fragments. Since the option set is fixed and known, greedily match the
// longest known option at the front of the remaining text instead.
const INDUSTRY_OPTIONS = [
  "Aerospace",
  "Agriculture",
  "Artificial Intelligence",
  "Apparel",
  "Arts, Media, Entertainment",
  "Automotive",
  "Biotechnology",
  "Building and Construction",
  "Chemical and Advanced Materials",
  "Computer Hardware",
  "Consulting",
  "Consumer Electronics",
  "Education",
  "Energy, Environment, and Utilities",
  "Finance, Insurance, and Banking",
  "Food and Beverage",
  "Government",
  "Healthcare",
  "Hospitality, Tourism, and Recreation",
  "Information Technology",
  "Insurance",
  "Machinery",
  "Manufacturing",
  "Medical Devices / Services",
  "Not for Profit",
  "Retail and Ecommerce",
  "Robotics",
  "Software",
  "Space Exploration and Technology",
  "Sustainability",
  "Telecommunications",
  "Transportation and Logisitics",
  "Other",
].sort((a, b) => b.length - a.length); // longest first, so no option's prefix wins over a longer one that also matches

const splitIndustries = (text: string): string[] => {
  const result: string[] = [];
  let rest = text.trim();

  while (rest) {
    const match = INDUSTRY_OPTIONS.find((opt) => rest.startsWith(opt));
    if (!match) break; // unrecognized leftover text - stop rather than guess
    result.push(match);
    rest = rest.slice(match.length).replace(/^[,;]\s*/, "");
  }

  return result;
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
    EECS_RECRUITING_ANSWERS.has(eecsRecruiting) &&
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

    // Only asked of external organizations - blank for UCB-advised projects.
    organizationType: findValue(raw, /^Type of Organization/i),
    industries: splitIndustries(
      findValue(raw, /^Please share the primary field or industry/i)
    ),
    companySize: findValue(raw, /^Company size/i),
    teamSizes: splitTags(findValue(raw, /^Team Size - Specific or Range/i)),
    usCitizenshipRequired:
      findValue(raw, /^Do you require US citizenship for participation/i) ===
      "Yes",
    ndaRequired:
      findValue(raw, /^Will you require students to sign a NDA form/i) ===
      "Yes",

    // Primary comes from the sample-visual upload; department image is a
    // separate fallback in case the primary URL 404s / isn't viewable.
    thumbnail: rawThumbnail ? resolveThumbnail(rawThumbnail) : "",
    thumbnailFallback: assignThumbnail(extractDeptCode(ucbAffiliation)),
  };
};
