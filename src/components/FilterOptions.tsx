import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import * as palette from ".././styles/GlobalStyles";
import type { Project } from "../types/project";

interface FilterProps {
  projects: Project[];
  setDisplayedProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  searchInput: string;
  setSearchInput: (value: string) => void;
}

const FilterOptions = ({ projects, setDisplayedProjects, searchInput, setSearchInput }: FilterProps) => {
  const [advisorDeptInput, setAdvisorDeptInput] = useState("");
  const [acceptingStudentsFromInput, setAcceptingStudentsFromInput] =
    useState("");

  const { advisorDepts, acceptingStudentsFrom } = useMemo(() => {
    const uniqueAdvisorDepts = new Set<string>();
    const uniqueacceptingStudentsFrom = new Set<string>();
    projects.forEach((project) => {
      if (project.ucbAffiliation) {
        uniqueAdvisorDepts.add(project.ucbAffiliation.trim());
      }

      if (project.acceptingMajors) {
        project.acceptingMajors.forEach((major) => {
          if (major) uniqueacceptingStudentsFrom.add(major.trim());
        });
      }
    });

    return {
      advisorDepts: Array.from(uniqueAdvisorDepts).sort(),
      acceptingStudentsFrom: Array.from(uniqueacceptingStudentsFrom).sort(),
    };
  }, [projects]);

  const handleReset = () => {
    setSearchInput("");
    setAdvisorDeptInput("");
    setAcceptingStudentsFromInput("");
  };

  const displayedProjects = useMemo(() => {
    let filtered = projects;

    if (searchInput) {
      const searchRegex = new RegExp(
        "\\b" + searchInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filtered = filtered.filter((project) => {
        const test = (val: string) => searchRegex.test(val);
        return (
          test(project.projectId.toString()) ||
          test(project.name) ||
          project.keywords.some(test) ||
          test(project.IOR) ||
          project.advisorNames.some(test) ||
          test(project.affiliation)
        );
      });
    }

    if (advisorDeptInput) {
      filtered = filtered.filter((project) =>
        project.ucbAffiliation
          .toLowerCase()
          .includes(advisorDeptInput.toLowerCase())
      );
    }

    if (acceptingStudentsFromInput) {
      filtered = filtered.filter((project) =>
        project.acceptingMajors.some((major) =>
          major.toLowerCase().includes(acceptingStudentsFromInput.toLowerCase())
        )
      );
    }

    return filtered;
  }, [projects, searchInput, advisorDeptInput, acceptingStudentsFromInput]);

  useEffect(() => {
    setDisplayedProjects(displayedProjects);
  }, [displayedProjects, setDisplayedProjects]);

  return (
    <ParentContainer>
      <SelectWrapper className="search">
        <Label htmlFor="search">Search</Label>
        <SearchInput
          id="search"
          type="text"
          value={searchInput}
          placeholder="Search by id, title, keywords, advisor..."
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </SelectWrapper>

      <SelectWrapper>
        <Label htmlFor="advisor_dept">Advisor Department</Label>
        <Dropdown
          id="advisor_dept"
          value={advisorDeptInput}
          onChange={(e) => setAdvisorDeptInput(e.target.value)}
        >
          <option value="">- Any -</option>
          {advisorDepts.map((item) => (
            <option value={item.toLowerCase()} key={item.toLowerCase()}>
              {item}
            </option>
          ))}
        </Dropdown>
      </SelectWrapper>
      <SelectWrapper>
        <Label htmlFor="accepting_students_from">Accepting Students From</Label>
        <Dropdown
          id="accepting_students_from"
          value={acceptingStudentsFromInput}
          onChange={(e) => setAcceptingStudentsFromInput(e.target.value)}
        >
          <option value="">- Any -</option>
          {acceptingStudentsFrom.map((item) => (
            <option value={item.toLowerCase()} key={item.toLowerCase()}>
              {item}
            </option>
          ))}
        </Dropdown>
      </SelectWrapper>
      <ResetButton onClick={handleReset}>Reset</ResetButton>
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
  flex-flow: row wrap; /* Allows items to wrap on mobile */
  gap: 1rem;
  padding: 1rem 0;
  align-items: center;
  width: 100%;
  line-height: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  height: 45px;
  background-color: white;

  &:focus {
    border-color: ${palette.accent};
  }
`;

const ResetButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background-color: ${palette.accent};
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

const Label = styled.label`
  font-size: 1rem;
  color: #666;
  white-space: nowrap;
  font-weight: bold;
`;

const SelectWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;

  &.search {
    flex: 2; /* Takes twice the space of other items */
  }
`;

const Dropdown = styled.select`
  width: 100%;
  height: 45px;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
`;

export default FilterOptions;
