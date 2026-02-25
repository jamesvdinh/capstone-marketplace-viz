import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import styled from "styled-components";
import ProjectCard from "./projectCard";

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
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjectsFromSheet();

    return () => {
      setLoading(false);
    };
  }, [loading]);

  return (
    <ParentContainer>
      <h2>Project List</h2>
      <ul>
        {projects.map((project, index) => (
          <li key={index}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
`;

export default ProjectList;
