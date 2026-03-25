import GlobalStyles from "./styles/GlobalStyles";
import "./styles/styles.css";

import ProjectList from "./components/ProjectList";
import styled from "styled-components";
import Instructions from "./components/Instructions";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <GlobalStyles />
      <Toaster position="top-center" reverseOrder={false} />
      <ParentContainer>
        <Instructions />
        <ProjectList />
      </ParentContainer>
    </>
  );
}

const ParentContainer = styled.div`
  justify-content: center;
  padding: 2rem;
`;

export default App;
