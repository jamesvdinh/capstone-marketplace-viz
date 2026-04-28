import type { Project } from "../types/project";
import capstoneLogo from "../assets/Long Wrapped Logo (resized).png";
import styled, { css } from "styled-components";
import * as palette from ".././styles/GlobalStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

type ProjectCardProps = {
  project: Project;
  viewMode: "grid" | "list";
};

const affiliationColors = {
  bioe: { bg: "#d0e8ff", text: "#1a4a7a" },
  cee: { bg: "#d4f0d4", text: "#1a5c1a" },
  eecs: { bg: "#fde8c8", text: "#7a3d00" },
  ieor: { bg: "#e8d4f8", text: "#4a1a7a" },
  me: { bg: "#ffd6d6", text: "#7a1a1a" },
  mse: { bg: "#d6f5f0", text: "#1a5c50" },
  ne: { bg: "#fff3cc", text: "#7a5500" },
  external: { bg: "#f0d6e8", text: "#6a1a4a" },
};

function getAffiliationChip(
  ucbAffiliation: string,
  affiliation: string
): { label: string; color: (typeof affiliationColors)["bioe"] } | null {
  if (ucbAffiliation == "External Organization") {
    const regex = /-\s*(.*)/;

    return {
      label: affiliation.match(regex)?.[1] || affiliation,
      color: affiliationColors.external,
    };
  } else {
    const lowerAffiliation = ucbAffiliation.toLowerCase();
    const color =
      affiliationColors[lowerAffiliation as keyof typeof affiliationColors] ||
      affiliationColors.external;
    return { label: ucbAffiliation, color };
  }
  return null;
}

const ProjectCard = ({ project, viewMode }: ProjectCardProps) => {
  return (
    <ParentContainer $viewMode={viewMode} href={project.url} target="_blank">
      <ProjectId>ID: {project.projectId}</ProjectId>
      <Thumbnail
        $viewMode={viewMode}
        $hasThumb={!!project.thumbnail}
        src={project.thumbnail ? project.thumbnail : capstoneLogo}
        loading="lazy"
        alt="Project Thumbnail"
      />
      <ContentContainer>
        <Title title={project.name}>{project.name}</Title>
        <AdvisorContainer>
          <FontAwesomeIcon className="small-icon" icon={["far", "user"]} />
          <span>
            {project.advisorNames && project.advisorNames.length > 0
              ? project.advisorNames.join(", ")
              : "TBD"}
          </span>
        </AdvisorContainer>
        <KeywordContainer>
          {(() => {
            const chip = getAffiliationChip(
              project.ucbAffiliation,
              project.affiliation
            );
            return chip ? (
              <AffiliationChip $bg={chip.color.bg} $text={chip.color.text}>
                {chip.label}
              </AffiliationChip>
            ) : null;
          })()}
          {project.keywords.length > 0 &&
            project.keywords.map((keyword, i) => (
              <Keyword key={i}>{keyword}</Keyword>
            ))}
        </KeywordContainer>
      </ContentContainer>
    </ParentContainer>
  );
};

const truncateText = css`
  display: -webkit-box;
  -webkit-line-clamp: 4; /* default */
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: calc(1.5em * 4);
`;

const ParentContainer = styled.a<{ $viewMode: string }>`
  display: flex;
  flex-direction: ${(props) => (props.$viewMode === "grid" ? "column" : "row")};
  border: 1px solid ${palette.borderColor};
  border-radius: 5px;
  overflow: hidden;
  width: ${(props) => (props.$viewMode === "grid" ? "280px;" : "100%")};
  height: ${(props) => (props.$viewMode === "grid" ? "100%" : "auto")};
  line-height: 1.4;
  animation: fade-in 0.3s ease;
  position: relative;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);

    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }

  &.excess {
    display: none;
  }

  &.open {
    display: block;
    animation: fade-in 0.3s ease;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 100;
      transform: translateY(0px);
    }
  }
`;

const ContentContainer = styled.div`
  padding: 0.25rem 0.75rem 0.5rem;
`;

const ProjectId = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.5); /* Opaque white */
  // backdrop-filter: blur(4px); /* Optional: adds a nice glass effect */
  border-radius: 0 0 15px 0;
  padding: 4px 8px;
  min-width: 30px;
  text-align: center;
  z-index: 10;
`;

const Thumbnail = styled.img<{ $viewMode: string; $hasThumb: boolean }>`
  width: ${(props) => (props.$viewMode === "grid" ? "100%" : "250px")};
  height: 150px;
  object-fit: ${(props) => (props.$hasThumb ? "cover" : "contain")};
  padding: ${(props) => (props.$hasThumb ? "0" : "1rem")};
  text-align: center;
  background-color: ${(props) => (props.$hasThumb ? "#f0f0f0" : "white")};
`;

const Title = styled.h2`
  font-size: 1rem;
  margin: 0.5em 0;
  ${truncateText}

  @media (max-width: 600px) {
    -webkit-line-clamp: 3;
  }
`;

const AdvisorContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 0.75rem;
  gap: 5px;
  margin: 5px 0 10px;
`;

const KeywordContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 5px;
`;

const AffiliationChip = styled.div<{ $bg: string; $text: string }>`
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$text};
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Keyword = styled.div`
  background-color: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
`;

export default ProjectCard;
