export type Project = {
  projectId: number;
  name: string;
  url: string;
  keywords: string[];
  affiliation: string;
  ucbAffiliation: string;
  advisorNames: string[];
  acceptingMajors: string[];
  thumbnail: string;
  thumbnailFallback: string;
};
