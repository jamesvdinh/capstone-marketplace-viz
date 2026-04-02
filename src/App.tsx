import GlobalStyles from "./styles/GlobalStyles";
import "./styles/styles.css";

import ProjectList from "./components/ProjectList";
import styled from "styled-components";
import Hero from "./components/Hero";
import { Toaster } from "react-hot-toast";
import { useCallback, useState } from "react";
import type { Project } from "./types/project";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const handleProjectsLoaded = useCallback(
    (p: Project[]) => setProjects(p),
    [],
  );
  const handleSearchInput = useCallback((v: string) => setSearchInput(v), []);
  const handleKeywordClick = useCallback((keyword: string) => {
    setSearchInput(keyword);
    document
      .getElementById("project-list")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <GlobalStyles />
      <Toaster position="top-center" reverseOrder={false} />
      <ParentContainer>
        <Hero projects={projects} onKeywordClick={handleKeywordClick} />
        <ProjectList
          onProjectsLoaded={handleProjectsLoaded}
          searchInput={searchInput}
          setSearchInput={handleSearchInput}
        />
      </ParentContainer>
    </>
  );
}

const ParentContainer = styled.div`
  justify-content: center;
  padding: 2rem;
`;

export default App;
