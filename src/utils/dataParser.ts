import type { Project } from "../types/project";

const splitTags = (text: string): string[] => {
  if (typeof text !== "string") return [];
  return text.split(",").map((tag) => tag.trim());
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseProjectData = (raw: any): Project => {
  return {
    projectId: Number(raw["Project ID"]), // Ensure it's a number
    name: String(raw["Project Name"] || ""),
    url: String(raw.url || ""), // Need to extract hyperlink from sheets
    videoIntro: String(raw["Project Video Introduction"] || ""),

    // Transform comma-separated strings into Arrays
    keywords: splitTags(String(raw.Keywords || "")),
    advisorNames: splitTags(String(raw["Advisor Name(s)"] || "")),
    advisorEmails: splitTags(String(raw["Advisor Emails"] || "")),
    acceptingMajors: splitTags(String(raw["Accepting Students From"] || "")),

    // Standard strings
    scope: String(raw["Project Scope"] || ""),
    affiliation: String(raw.Affiliation || ""),
    ucbAffiliation: String(raw["UCB Department Affiliation"] || ""),
    IOR: String(raw["Instructor of Record"] || ""),
    eecsComponentDesc: String(raw["EECS Component Description"] || ""),
    additionalUcbFaculty: String(
      raw["Names of Additional UCB Faculty Involved"] || ""
    ),
    additionalUcbFacultyEmails: String(
      raw["Emails of Additional UCB Faculty Involved"] || ""
    ),
    additionalPeopleEmails: String(
      raw["Emails of Additional Involved People"] || ""
    ),
    additionalDesc: String(
      raw["Anything else you would like to share with us?"] || ""
    ),
    additionalInfo: String(raw["Additional Info/Notes"] || ""),
  };
};
