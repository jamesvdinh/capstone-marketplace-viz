import type { Project } from "../types/project";
import styled from "styled-components";

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <ParentContainer>
      <Thumbnail
        src="https://via.placeholder.com/300x200"
        alt="Project Thumbnail"
      />
      <Title>{project.title}</Title>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
`;

const Thumbnail = styled.img`
  width: 100%;
  max-height: 200px;
  height: 100%;
`;

const Title = styled.h2`
  font-size: 1.5em;
  margin: 0.5em 0;
`;

export default ProjectCard;
