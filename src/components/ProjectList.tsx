import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import styled from "styled-components";
import ProjectCard from "./ProjectCard";
import * as palette from ".././styles/GlobalStyles";
import { parseProjectData } from "../utils/dataParser";
import FilterOptions from "./FilterOptions";

const API_URL =
  "https://script.google.com/macros/s/AKfycbywxo9WPmgDkomn1W51lB89p6qczti2PBHtc9gGjxx97oM71BHTIinJ23UNbqNvpQFUBQ/exec";

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayedProjects, setDisplayedProjects] =
    useState<Project[]>(projects);
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
        setDisplayedProjects(formattedData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsFromSheet();
  }, []);

  return (
    <ParentContainer>
      {loading && (
        <LoadingContainer>
          <LoadingIcon />
        </LoadingContainer>
      )}
      <FilterOptions
        projects={projects}
        setDisplayedProjects={setDisplayedProjects}
      />
      <ListContainer>
        {!loading && displayedProjects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          displayedProjects.map((project) => (
            <ProjectItem key={project.projectId}>
              <ProjectCard project={project} />
            </ProjectItem>
          ))
        )}
      </ListContainer>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 2rem auto;
  max-width: 1200px;
  justify-content: left;
`;

const ListContainer = styled.ul`
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  justify-content: center;
  list-style: none;
  margin: none;
  padding: unset;
  gap: 1.5rem;
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
`;

const LoadingIcon = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid ${palette.accent}; /* The "spinning" color */
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ProjectItem = styled.li``;

export default ProjectList;
