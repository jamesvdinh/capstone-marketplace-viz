export type Project = {
  projectId: number;
  name: string;
  url: string;
  videoIntro: string;
  keywords: string[];
  scope: string;
  affiliation: string;
  ucbAffiliation: string;
  advisorNames: string[];
  advisorEmails: string[];
  IOR: string;
  acceptingMajors: string[];
  eecsComponentDesc: string;
  additionalUcbFaculty: string;
  additionalUcbFacultyEmails: string;
  additionalPeopleEmails: string;
  additionalDesc: string;
  additionalInfo: string;
};

export const projectScopes = {
  Broad:
    "there is a good sense of the problem; it's up to the team to find the solution.",
  Narrow: "the problem is well-defined, the solution is fairly clear.",
  "Very narrow": "the problem is well-defined, the solution is clear.",
};
