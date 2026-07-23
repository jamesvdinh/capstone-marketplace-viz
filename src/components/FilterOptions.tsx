import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import * as palette from ".././styles/GlobalStyles";
import type { Project } from "../types/project";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

interface FilterProps {
  projects: Project[];
  setDisplayedProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  searchInput: string;
  setSearchInput: (value: string) => void;
}

// Only asked of external organizations on the intake form, so it's a fixed
// list rather than something derived from responses (see dataParser.ts).
const ORGANIZATION_TYPES = [
  "Non-profit",
  "Start-Up (External) - You must have already developed an MVP",
  "Start-Up (UC Berkeley Alumni)  - You must have already developed an MVP",
  "For-profit",
  "Government or Public Sector",
];

const TRI_STATE_OPTIONS = ["All", "No", "Yes"] as const;
type TriState = (typeof TRI_STATE_OPTIONS)[number];

// Shared control for the two Yes/No sheet fields (US citizenship, NDA) -
// same three-position slider, just a different label/value/handler.
const TriStateSlider = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
}) => (
  <SelectWrapper>
    <Label as="span">{label}</Label>
    <SliderTrack role="radiogroup" aria-label={label}>
      <SliderThumb $index={TRI_STATE_OPTIONS.indexOf(value)} />
      {TRI_STATE_OPTIONS.map((option) => (
        <SliderOption
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          $active={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </SliderOption>
      ))}
    </SliderTrack>
  </SelectWrapper>
);

const FilterOptions = ({
  projects,
  setDisplayedProjects,
  searchInput,
  setSearchInput,
}: FilterProps) => {
  const [advisorDeptInput, setAdvisorDeptInput] = useState("");
  const [acceptingStudentsFromInput, setAcceptingStudentsFromInput] =
    useState("");
  const [teamSizeInput, setTeamSizeInput] = useState("");
  const [organizationTypeInput, setOrganizationTypeInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");
  const [companySizeInput, setCompanySizeInput] = useState("");
  const [citizenshipInput, setCitizenshipInput] = useState<TriState>("All");
  const [ndaInput, setNdaInput] = useState<TriState>("All");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const {
    advisorDepts,
    acceptingStudentsFrom,
    teamSizes,
    industries,
    companySizes,
  } = useMemo(() => {
    const uniqueAdvisorDepts = new Set<string>();
    const uniqueAcceptingStudentsFrom = new Set<string>();
    const uniqueTeamSizes = new Set<string>();
    const uniqueIndustries = new Set<string>();
    const uniqueCompanySizes = new Set<string>();

    projects.forEach((project) => {
      if (project.ucbAffiliation) {
        uniqueAdvisorDepts.add(project.ucbAffiliation.trim());
      }
      project.acceptingMajors?.forEach((major) => {
        if (major) uniqueAcceptingStudentsFrom.add(major.trim());
      });
      project.teamSizes?.forEach((size) => {
        if (size) uniqueTeamSizes.add(size.trim());
      });
      project.industries?.forEach((industry) => {
        if (industry) uniqueIndustries.add(industry.trim());
      });
      if (project.companySize) {
        uniqueCompanySizes.add(project.companySize.trim());
      }
    });

    return {
      advisorDepts: Array.from(uniqueAdvisorDepts).sort(),
      acceptingStudentsFrom: Array.from(uniqueAcceptingStudentsFrom).sort(),
      teamSizes: Array.from(uniqueTeamSizes).sort(),
      industries: Array.from(uniqueIndustries).sort(),
      companySizes: Array.from(uniqueCompanySizes).sort(),
    };
  }, [projects]);

  const hasActiveMoreFilters =
    organizationTypeInput !== "" ||
    industryInput !== "" ||
    companySizeInput !== "" ||
    citizenshipInput !== "All" ||
    ndaInput !== "All";

  const handleReset = () => {
    setSearchInput("");
    setAdvisorDeptInput("");
    setAcceptingStudentsFromInput("");
    setTeamSizeInput("");
    setOrganizationTypeInput("");
    setIndustryInput("");
    setCompanySizeInput("");
    setCitizenshipInput("All");
    setNdaInput("All");
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

    if (teamSizeInput) {
      filtered = filtered.filter((project) =>
        project.teamSizes.some((size) => size.toLowerCase() === teamSizeInput)
      );
    }

    if (organizationTypeInput) {
      filtered = filtered.filter(
        (project) =>
          project.organizationType.toLowerCase() === organizationTypeInput
      );
    }

    if (industryInput) {
      filtered = filtered.filter((project) =>
        project.industries.some(
          (industry) => industry.toLowerCase() === industryInput
        )
      );
    }

    if (companySizeInput) {
      filtered = filtered.filter(
        (project) => project.companySize.toLowerCase() === companySizeInput
      );
    }

    if (citizenshipInput !== "All") {
      const requiresCitizenship = citizenshipInput === "Yes";
      filtered = filtered.filter(
        (project) => project.usCitizenshipRequired === requiresCitizenship
      );
    }

    if (ndaInput !== "All") {
      const requiresNda = ndaInput === "Yes";
      filtered = filtered.filter(
        (project) => project.ndaRequired === requiresNda
      );
    }

    return filtered;
  }, [
    projects,
    searchInput,
    advisorDeptInput,
    acceptingStudentsFromInput,
    teamSizeInput,
    organizationTypeInput,
    industryInput,
    companySizeInput,
    citizenshipInput,
    ndaInput,
  ]);

  useEffect(() => {
    setDisplayedProjects(displayedProjects);
  }, [displayedProjects, setDisplayedProjects]);

  return (
    <ParentContainer>
      <FilterRow>
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
          <Label htmlFor="accepting_students_from">
            Accepting Students From
          </Label>
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

        <SelectWrapper>
          <Label htmlFor="team_size">Team Size</Label>
          <Dropdown
            id="team_size"
            value={teamSizeInput}
            onChange={(e) => setTeamSizeInput(e.target.value)}
          >
            <option value="">- Any -</option>
            {teamSizes.map((item) => (
              <option value={item.toLowerCase()} key={item.toLowerCase()}>
                {item}
              </option>
            ))}
          </Dropdown>
        </SelectWrapper>

        <MoreFiltersToggle
          type="button"
          onClick={() => setShowMoreFilters((prev) => !prev)}
        >
          {showMoreFilters ? "Fewer filters" : "More filters"}
          {hasActiveMoreFilters && !showMoreFilters && <ActiveDot />}
          <FontAwesomeIcon
            icon={["fas", showMoreFilters ? "chevron-up" : "chevron-down"]}
          />
        </MoreFiltersToggle>

        <ResetButton onClick={handleReset}>Reset</ResetButton>
      </FilterRow>

      {showMoreFilters && (
        <FilterRow>
          <SelectWrapper>
            <Label htmlFor="organization_type">Organization Type</Label>
            <Dropdown
              id="organization_type"
              value={organizationTypeInput}
              onChange={(e) => setOrganizationTypeInput(e.target.value)}
            >
              <option value="">- Any -</option>
              {ORGANIZATION_TYPES.map((item) => (
                <option value={item.toLowerCase()} key={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Dropdown>
          </SelectWrapper>

          <SelectWrapper>
            <Label htmlFor="industry">Industry</Label>
            <Dropdown
              id="industry"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
            >
              <option value="">- Any -</option>
              {industries.map((item) => (
                <option value={item.toLowerCase()} key={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Dropdown>
          </SelectWrapper>

          <SelectWrapper>
            <Label htmlFor="company_size">Company Size</Label>
            <Dropdown
              id="company_size"
              value={companySizeInput}
              onChange={(e) => setCompanySizeInput(e.target.value)}
            >
              <option value="">- Any -</option>
              {companySizes.map((item) => (
                <option value={item.toLowerCase()} key={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Dropdown>
          </SelectWrapper>

          <TriStateSlider
            label="US Citizenship Required"
            value={citizenshipInput}
            onChange={setCitizenshipInput}
          />

          <TriStateSlider
            label="NDA Required"
            value={ndaInput}
            onChange={setNdaInput}
          />
        </FilterRow>
      )}
    </ParentContainer>
  );
};

const ParentContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 0.5rem;
  padding: 1rem 0;
  width: 100%;
`;

const FilterRow = styled.div`
  display: flex;
  flex-flow: row wrap; /* Allows items to wrap on mobile */
  gap: 0.75rem;
  align-items: end;
  line-height: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${palette.borderColor};
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  height: 42px;
  background-color: white;

  &:focus {
    border-color: ${palette.accent};
  }
`;

const ResetButton = styled.button`
  padding: 0 15px;
  border: none;
  border-radius: 8px;
  background-color: ${palette.accent};
  color: white;
  font-size: 0.9rem;
  height: 42px;
  cursor: pointer;
  transition: filter 0.3s ease;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`;

const MoreFiltersToggle = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid ${palette.borderColor};
  border-radius: 8px;
  background-color: white;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  height: 42px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f7f7f7;
  }
`;

const ActiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${palette.accent};
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  font-weight: bold;
`;

const SelectWrapper = styled.div`
  flex: 1 1 80px;
  max-width: 220px;
  display: flex;
  flex-flow: column nowrap;
  gap: 0.35rem;

  &.search {
    flex: 2 1 260px;
    max-width: none;
  }

  @media (max-width: 600px) {
    max-width: none;
  }
`;

const Dropdown = styled.select`
  width: 100%;
  height: 42px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${palette.borderColor};
  background-color: white;
  cursor: pointer;
  font-size: 0.85rem;
`;

const SliderTrack = styled.div`
  position: relative;
  display: flex;
  height: 42px;
  border: 1px solid ${palette.borderColor};
  border-radius: 8px;
  background-color: white;
  padding: 3px;
`;

const SliderThumb = styled.div<{ $index: number }>`
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc((100% - 6px) / 3);
  height: calc(100% - 6px);
  border-radius: 6px;
  background-color: ${palette.accent};
  transform: translateX(${(p) => p.$index * 100}%);
  transition: transform 0.2s ease;
`;

const SliderOption = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(p) => (p.$active ? "white" : "#666")};
  transition: color 0.2s ease;
`;

export default FilterOptions;
