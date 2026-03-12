import { useState, useEffect } from "react";
import styled from "styled-components";
import * as palette from ".././styles/GlobalStyles";
import type { Project } from "../types/project";

interface FilterProps {
  projects: Project[];
  setDisplayedProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const FilterOptions = ({ projects, setDisplayedProjects }: FilterProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [deptInput, setDeptInput] = useState("");
  const [depts, setDepts] = useState<string[]>([]);

  useEffect(() => {
    const getDepts = () => {
      const uniqueDepts = new Set<string>();
      projects.forEach((project) => {
        if (project.ucbAffiliation) {
          uniqueDepts.add(project.ucbAffiliation.trim());
        }
      });
      setDepts(Array.from(uniqueDepts));
    };

    getDepts();
  }, [projects]);

  useEffect(() => {
    const handleFilterChange = () => {
      let filtered = projects;

      if (searchInput) {
        const searchLower = searchInput.toLowerCase();
        filtered = filtered.filter(
          (project) =>
            project.name.toLowerCase().includes(searchLower) ||
            project.keywords.some((keyword) =>
              keyword.toLowerCase().includes(searchLower)
            ) ||
            project.IOR.toLowerCase().includes(searchLower) ||
            project.advisorNames.some((name) =>
              name.toLowerCase().includes(searchLower)
            ) ||
            project.affiliation.toLowerCase().includes(searchLower)
        );
      }

      if (deptInput) {
        filtered = filtered.filter((project) =>
          project.ucbAffiliation.toLowerCase().includes(deptInput.toLowerCase())
        );
      }

      setDisplayedProjects(filtered);
    };

    handleFilterChange();
  }, [projects, setDisplayedProjects, searchInput, deptInput]);

  return (
    <ParentContainer>
      <SearchInput
        type="text"
        placeholder="Search by title, keywords, advisor..."
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <SelectWrapper>
        <Dropdown id="category" onChange={(e) => setDeptInput(e.target.value)}>
          <option value="">- Any Department -</option>
          {depts.map((dept) => (
            <option value={dept.toLowerCase()} key={dept.toLowerCase()}>
              {dept}
            </option>
          ))}
        </Dropdown>
      </SelectWrapper>
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
  flex: 2; /* Takes twice the space of other items */
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

const SelectWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    color: #666;
    white-space: nowrap;
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
