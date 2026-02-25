import type { Project } from "../types/project";
import styled from "styled-components";

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <ParentContainer>
      <Thumbnail
        src="https://static.vecteezy.com/system/resources/thumbnails/050/798/644/small/detailed-view-of-interlocking-metallic-gears-in-motion-showcasing-the-complexity-and-precision-of-mechanical-engineering-and-machinery-photo.jpeg"
        alt="Project Thumbnail"
      />
      <ContentContainer>
        <Title>{project.name}</Title>
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

const ParentContainer = styled.div`
  display: flex;
  flex: 1 1 400px;
  flex-flow: column nowrap;
  border: 1px solid gray;
  border-radius: 5px;
  width: 300px;
  height: 100%;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  padding: 0.25rem 0.5rem;
`;

const Thumbnail = styled.img`
  width: 100%;
  min-height: 100px;
  max-height: 200px;
  height: 100%;
  object-fit: cover;
`;

const Title = styled.h2`
  font-size: 1rem;
  margin: 0.5em 0;
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
