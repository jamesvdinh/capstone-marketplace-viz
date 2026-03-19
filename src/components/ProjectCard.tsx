import type { Project } from "../types/project";
import styled, { css } from "styled-components";
import * as palette from ".././styles/GlobalStyles";

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <ParentContainer href={project.url} target="_blank">
      <ProjectId>ID: {project.projectId}</ProjectId>
      <Thumbnail
        src="https://static.vecteezy.com/system/resources/thumbnails/050/798/644/small/detailed-view-of-interlocking-metallic-gears-in-motion-showcasing-the-complexity-and-precision-of-mechanical-engineering-and-machinery-photo.jpeg"
        alt="Project Thumbnail"
      />
      <ContentContainer>
        <Title title={project.name}>{project.name}</Title>
        <KeywordContainer>
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

const ParentContainer = styled.a`
  display: flex;
  flex-flow: column nowrap;
  border: 1px solid ${palette.borderColor};
  border-radius: 5px;
  overflow: hidden;
  width: 280px;
  height: 100%;
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
  background-color: rgba(255, 255, 255, 0.2); /* Opaque white */
  backdrop-filter: blur(4px); /* Optional: adds a nice glass effect */
  border-radius: 0 0 15px 0;
  padding: 4px 8px;
  min-width: 30px;
  text-align: center;
  z-index: 10;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const Title = styled.h2`
  font-size: 1rem;
  margin: 0.5em 0;
  ${truncateText}
`;

const KeywordContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 5px;
`;

const Keyword = styled.div`
  background-color: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
`;

export default ProjectCard;
