import GlobalStyles from "./styles/GlobalStyles";
import ProjectList from "./components/ProjectList";
import styled from "styled-components";

function App() {
  return (
    <>
      <GlobalStyles />
      <ParentContainer>
        <ProjectList />
      </ParentContainer>
    </>
  );
}

const ParentContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

export default App;
