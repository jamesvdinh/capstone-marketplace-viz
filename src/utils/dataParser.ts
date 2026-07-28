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
// rather than an exact string match. Only used for the handful of fields
// still joined in from the response sheet - everything else now comes
// straight off the Project Marketplace sheet, whose headers are exact.
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

// On the Project Marketplace sheet, "UCB Department Affiliation" is already
// a bare dept code (e.g. "EECS", "BIOE") or the literal "External
// Organization" for non-UCB projects - no prefix stripping needed.
const extractDeptCode = (ucbAffiliation: string): string => {
  const normalized = ucbAffiliation.trim();
  if (normalized.toLowerCase() === "external organization") return "";
  return normalized.toLowerCase();
};

type ResponseJoinFields = {
  thumbnail: string;
  organizationType: string;
  industries: string[];
  companySize: string;
};

// The Project Marketplace sheet is the source of truth for a project's
// existence and most of its fields; these four are still only collected on
// the original response sheet, so they're looked up by Project ID and left
// blank if a matching response row isn't found.
const parseResponseJoinFields = (
  raw: Record<string, unknown> | undefined
): ResponseJoinFields => {
  if (!raw) {
    return { thumbnail: "", organizationType: "", industries: [], companySize: "" };
  }

  const rawThumbnail = findValue(
    raw,
    /^Please supply a sample visual for this project/i
  );

  return {
    thumbnail: rawThumbnail ? resolveThumbnail(rawThumbnail) : "",
    organizationType: findValue(raw, /^Type of Organization/i),
    industries: splitIndustries(
      findValue(raw, /^Please share the primary field or industry/i)
    ),
    companySize: findValue(raw, /^Company size/i),
  };
};

const parseProjectData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marketplaceRow: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseRow: any | undefined
): Project => {
  const ucbAffiliation = String(
    marketplaceRow["UCB Department Affiliation"] ?? ""
  ).trim();

  const advisorNames = [
    marketplaceRow["Primary Advisor"],
    marketplaceRow["Additional Faculty Advisor, if Applicable"],
  ]
    .map((v) => String(v ?? "").trim())
    .filter((v) => v);

  const { thumbnail, organizationType, industries, companySize } =
    parseResponseJoinFields(responseRow);

  return {
    projectId: Number(marketplaceRow["Project ID"]),
    name: String(marketplaceRow["Project Title"] ?? "").trim(),
    url: String(marketplaceRow["Project Title_url"] ?? "").trim(),

    keywords: splitTags(marketplaceRow["Keywords"]),
    advisorNames,
    acceptingMajors: splitTags(marketplaceRow["Accepting Students From"]),

    affiliation: String(marketplaceRow["Affiliation"] ?? "").trim(),
    ucbAffiliation,

    // Joined in from the response sheet - see parseResponseJoinFields.
    organizationType,
    industries,
    companySize,

    teamSizes: splitTags(marketplaceRow["Target Team Size"]),
    usCitizenshipRequired:
      String(marketplaceRow["Is US Citizenship Required?"] ?? "").trim() ===
      "Yes",

    // Primary comes from the joined response row's sample-visual upload;
    // department image is a separate fallback in case the primary URL
    // 404s / isn't viewable.
    thumbnail,
    thumbnailFallback: assignThumbnail(extractDeptCode(ucbAffiliation)),
  };
};

// Left join: the Project Marketplace sheet is the source of truth for which
// projects exist (deleting a row there drops the project from the list),
// with a handful of fields joined in from the original response sheet by
// Project ID.
//
// The response sheet's Apps Script derives "project_id" from row position
// (i + 1), which is a safe stand-in there since response rows are an
// append-only form log that's never reordered or deleted. The marketplace
// sheet's own "project_id" is derived the same row-position way, but that
// sheet DOES have rows deleted (that's the whole point - dropping a row
// removes the project from the list), which desyncs row position from the
// real Project ID for every row after a deletion. Its actual "Project ID"
// column is the stable value that survives deletions, so that's the join
// key used on the marketplace side - never its computed "project_id".
export const mergeProjectData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marketplaceRows: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseRows: any[]
): Project[] => {
  const responseById = new Map(
    responseRows.map((row) => [Number(row["project_id"]), row])
  );

  // Trailing blank rows in the sheet (no Project ID) aren't real projects -
  // Number("") coerces to 0, which would otherwise collide with every other
  // blank row on the `key={project.projectId}` in ProjectList and corrupt
  // React's reconciliation for the whole list.
  return marketplaceRows
    .filter((row) => String(row["Project ID"] ?? "").trim() !== "")
    .map((row) =>
      parseProjectData(row, responseById.get(Number(row["Project ID"])))
    );
};
