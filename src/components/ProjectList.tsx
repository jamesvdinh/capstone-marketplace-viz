import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import styled from "styled-components";
import ProjectCard from "./ProjectCard";
import { parseProjectData } from "../utils/dataParser";

const API_URL =
  "https://script.google.com/macros/s/AKfycbywxo9WPmgDkomn1W51lB89p6qczti2PBHtc9gGjxx97oM71BHTIinJ23UNbqNvpQFUBQ/exec";

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjectsFromSheet = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedData: Project[] = data.map((item: any) =>
          parseProjectData(item)
        );
        console.log(formattedData[0]);
        setProjects(formattedData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjectsFromSheet();

    return () => {
      setLoading(false);
    };
  }, []);

  return (
    <ParentContainer>
      <h2>Project List</h2>
      <ListContainer>
        {!loading &&
          projects.map((project, index) => (
            <ProjectItem key={index}>
              <ProjectCard project={project} />
            </ProjectItem>
          ))}
      </ListContainer>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 2rem auto;
  max-width: 1200px;
`;

const ListContainer = styled.ul`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: left;
  list-style: none;
  margin: none;
  padding: unset;
  gap: 1.5rem;
`;

const ProjectItem = styled.li``;

export default ProjectList;
