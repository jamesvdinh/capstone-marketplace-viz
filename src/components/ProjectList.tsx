import { useEffect, useState } from "react";
import type { Project } from "../types/project";
import styled from "styled-components";
import ProjectCard from "./ProjectCard";
import * as palette from ".././styles/GlobalStyles";
import { parseProjectData } from "../utils/dataParser";
import FilterOptions from "./FilterOptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";

library.add(fas, far);

const API_URL =
  "https://script.google.com/macros/s/AKfycbxATY_2WcMndUutAJxMFCAW9M2C5Z--96FIN0rdHZ1_p7RBLkyDnpMb0nHjt5P_BU0Neg/exec";

const CACHE_KEY = "marketplace_projects_cache";
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 mins

const CACHE_REFRESH_KEY = "marketplace_projects_last_refresh";

const ProjectList = ({
  onProjectsLoaded,
  searchInput,
  setSearchInput,
}: {
  onProjectsLoaded?: (projects: Project[]) => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [displayedProjects, setDisplayedProjects] =
    useState<Project[]>(projects);
  const [loading, setLoading] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setViewMode("grid");
      } else if (window.innerWidth < 650) {
        setViewMode("list");
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const cachedRefresh = localStorage.getItem(CACHE_REFRESH_KEY);
    // set the current time as last refreshed time
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
        onProjectsLoaded?.(data);
        setLoading(false);

        // once cache is loaded, check if it's still fresh. If so, skip fetching
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
        onProjectsLoaded?.(formattedData);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: formattedData,
            timestamp: Date.now(),
          })
        );
        toast.success("Projects up to date!", {
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
          },
        });
      } catch (error) {
        toast.error("Failed to refresh projects. Please try again later.", {
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
          },
        });
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
        setLastRefreshed(new Date());
        localStorage.setItem(CACHE_REFRESH_KEY, Date.now().toString());
        setForceRefresh(false);
      }
    };

    fetchProjectsFromSheet();
  }, [forceRefresh, onProjectsLoaded]);

  return (
    <ParentContainer id="project-list">
      {loading && (
        <LoadingContainer>
          <LoadingIcon />
        </LoadingContainer>
      )}
      <FilterOptions
        projects={projects}
        setDisplayedProjects={setDisplayedProjects}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
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
          <ViewToggle>
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
            >
              <FontAwesomeIcon icon={["fas", "th-large"]} />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              <FontAwesomeIcon icon={["fas", "list"]} />
            </button>
          </ViewToggle>
        </RefreshContainer>
      </ListInfo>
      <Separator />
      <ListContainer $viewMode={viewMode}>
        {!loading && displayedProjects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          displayedProjects.map((project) => (
            <li key={project.projectId}>
              <ProjectCard project={project} viewMode={viewMode} />
            </li>
          ))
        )}
      </ListContainer>
      <ScrollTopButton
        $show={showScrollTop}
        onClick={scrollToTop}
        data-tooltip="Scroll to top"
      >
        <FontAwesomeIcon icon={["fas", "arrow-up"]} />
      </ScrollTopButton>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 2rem auto 10rem;
  max-width: 1200px;
  justify-content: left;
`;

const ListInfo = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
`;

const Separator = styled.hr`
  margin: 0.75rem 0;
`;

const ListContainer = styled.ul<{ $viewMode: "grid" | "list" }>`
  display: flex;
  flex-flow: ${(props) =>
    props.$viewMode === "grid" ? "row wrap" : "column nowrap"};
  align-items: stretch;
  justify-content: center;
  list-style: none;
  margin: none;
  padding: unset;
  gap: 1.5rem;

  li {
    width: ${(props) => (props.$viewMode === "grid" ? "auto" : "100%")};
    transition: width 0.3s ease;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    background: #f3f4f6;
    border: 1px solid #ddd;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: ${palette.accent};
      color: white;
      border-color: ${palette.accent};
    }
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

const RefreshContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 0.5rem;
  align-items: end;

  .update-text {
    font-size: 0.75rem;
    min-width: 90px;
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

const ScrollTopButton = styled.button<{ $show: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${palette.accent};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;

  /* Smooth entry/exit */
  opacity: ${(props) => (props.$show ? "1" : "0")};
  visibility: ${(props) => (props.$show ? "visible" : "hidden")};
  transform: translateY(${(props) => (props.$show ? "0" : "20px")});
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    filter: brightness(0.9);
  }

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    right: calc(100% + 10px);
    z-index: 2;
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 14px;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
  }

  &:hover::after {
    opacity: 1;
    visibility: visible;
  }
`;

export default ProjectList;
