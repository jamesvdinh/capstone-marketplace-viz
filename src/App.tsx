import GlobalStyles from "./styles/GlobalStyles";
import "./styles/styles.css";

import ProjectList from "./components/ProjectList";
import styled from "styled-components";
import Instructions from "./components/Instructions";
import { Toaster } from "react-hot-toast";
import { useCallback, useState } from "react";
import type { Project } from "./types/project";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const handleProjectsLoaded = useCallback((p: Project[]) => setProjects(p), []);
  const handleSearchInput = useCallback((v: string) => setSearchInput(v), []);

  return (
    <>
      <GlobalStyles />
      <Toaster position="top-center" reverseOrder={false} />
      <ParentContainer>
        <Instructions projects={projects} onKeywordClick={handleSearchInput} />
        <ProjectList onProjectsLoaded={handleProjectsLoaded} searchInput={searchInput} setSearchInput={handleSearchInput} />
      </ParentContainer>
    </>
  );
}

const ParentContainer = styled.div`
  justify-content: center;
  padding: 2rem;
`;

export default App;
