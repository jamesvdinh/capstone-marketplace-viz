import { styled } from "styled-components";
import { Link } from "../styles/GlobalStyles";
import type { Project } from "../types/project";
import KeywordBubbleChart from "./KeywordBubbleChart";

const Hero = ({
  projects,
  onKeywordClick,
}: {
  projects: Project[];
  onKeywordClick?: (keyword: string) => void;
}) => {
  return (
    <ParentContainer>
      <TextContent>
        <h2>Explore the Capstone Project Marketplace!</h2>
        <p>
          Browse available projects to find opportunities that match your
          interests and goals.
        </p>
        <p>
          Each capstone project provides hands-on experience to strengthen
          skills in leadership, teamwork, communication, and problem-solving —
          essential for your success in the MEng program and beyond. Projects
          are designed to build both technical and leadership skills that are
          transferable across career paths.
        </p>
        <p>
          As you begin reviewing opportunities in the Project Marketplace below,
          start by selecting the tab for your home department{" "}
          <span className="font-bold">
            (e.g., BIOE Project List, CEE Project List
          </span>
          , etc.).These lists contain the projects available to you.
        </p>
        <p>
          Within your department's list, consider key factors such as{" "}
          <span className="font-bold">
            keywords, project scope, and affiliation
          </span>{" "}
          (faculty-led vs. industry-sponsored). For more in-depth information,
          be sure to click on individual project links to explore detailed
          descriptions of the work involved.
        </p>
        <p className="font-bold">
          Use this information to start narrowing your choices so you can:
        </p>
        <ol className="list-decimal">
          <li>
            <span className="font-bold">Decide</span> which Capstone Advisor
            Office Hour sessions to attend.
          </li>
          <li>
            <span className="font-bold">Develop</span> a short list of your top
            20 or so preferences to help you begin to narrow down to your final
            6 top choices.
          </li>
        </ol>
        <p>
          Jump in below or go here for a version to search or filter:{" "}
          <Link
            href="https://docs.google.com/spreadsheets/d/1H6_iAmTeatsI0fKzxLVOAIRjzf-d03d9fq5IhRXKhCk/edit?gid=0#gid=0"
            target="_blank"
          >
            AY25-26 Project Marketplace Overview.
          </Link>
        </p>
      </TextContent>
      <ChartContainer>
        <KeywordBubbleChart
          projects={projects}
          onKeywordClick={onKeywordClick}
        />
        <p>Click a keyword to search!</p>
      </ChartContainer>
    </ParentContainer>
  );
};

const TextContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 15px 0;
  flex: 1 1 0;
  min-width: 550px;

  h2 {
    font-weight: bold;
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }

  @media (max-width: 600px) {
    min-width: unset;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 600px;
  flex-shrink: 0;
  margin: 1.75rem auto;
  text-align: center;
  font-size: 1.2rem;
  color: gray;
  gap: 0.75rem;

  @media (max-width: 600px) {
    display: none;
  }
`;

const ParentContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
  align-items: flex-start;
  max-width: 1200px;
  margin: auto;
`;

export default Hero;
