import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import styled from "styled-components";
import ProjectCard from "./ProjectCard";
import * as palette from ".././styles/GlobalStyles";
import { parseProjectData } from "../utils/dataParser";
import FilterOptions from "./FilterOptions";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxATY_2WcMndUutAJxMFCAW9M2C5Z--96FIN0rdHZ1_p7RBLkyDnpMb0nHjt5P_BU0Neg/exec";

const CACHE_KEY = "marketplace_projects_cache";
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 mins

const CACHE_REFRESH_KEY = "marketplace_projects_last_refresh";

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayedProjects, setDisplayedProjects] =
    useState<Project[]>(projects);
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    const cachedRefresh = localStorage.getItem(CACHE_REFRESH_KEY);
    if (cachedRefresh) {
      setLastRefreshed(new Date(parseInt(cachedRefresh)));
    }

    const fetchProjectsFromSheet = async () => {
      // load from cache if available
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData && !forceRefresh) {
        const { data, timestamp } = JSON.parse(cachedData);

        setProjects(data);
        setDisplayedProjects(data);
        setLoading(false);

        if (Date.now() - timestamp < CACHE_EXPIRATION) {
          return;
        }
      }

      // if no fresh cache, fetch projects like normal and update cache
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedData: Project[] = data.map((item: any) =>
          parseProjectData(item)
        );
        setProjects(formattedData);
        setDisplayedProjects(formattedData);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: formattedData,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
        setLastRefreshed(new Date());
        localStorage.setItem(CACHE_REFRESH_KEY, Date.now().toString());
        setForceRefresh(false);
      }
    };

    fetchProjectsFromSheet();
  }, [forceRefresh]);

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
      <ListInfo>
        <span>
          {displayedProjects.length} / {projects.length} projects shown
        </span>
        <RefreshContainer>
          <p className="update-text">
            Last Refreshed:
            <br />
            {lastRefreshed
              ? `${lastRefreshed?.toLocaleDateString()}, 
            ${lastRefreshed?.toLocaleTimeString()}`
              : "n/a"}
          </p>
          <RefreshButton
            onClick={() => {
              setLoading(true);
              setForceRefresh((prev) => !prev);
            }}
          >
            Refresh Projects
          </RefreshButton>
        </RefreshContainer>
      </ListInfo>
      <Separator />
      <ListContainer>
        {!loading && displayedProjects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          displayedProjects.map((project) => (
            <li key={project.projectId}>
              <ProjectCard project={project} />
            </li>
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

const ListInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;
`;

const Separator = styled.hr`
  margin: 0.75rem 0;
`;

const ListContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  justify-content: center;
  list-style: none;
  margin: none;
  padding: unset;
  gap: 1.5rem;
`;

const RefreshContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
  align-items: end;

  .update-text {
    font-size: 0.75rem;
  }
`;

const RefreshButton = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 8px;
  background-color: gray;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  align-self: flex-end;
  transition: filter 0.3s ease;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
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

export default ProjectList;
