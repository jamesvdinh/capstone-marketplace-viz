import styled, { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    background-color: #f5f5f5;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  * {
    box-sizing: border-box;
  }
`;

export const accent = "#002676";
export const bgColor = "#f5f5f5";
export const borderColor = "#ddd";

// Warm-neutral surface for plain (non-affiliation) chips - keeps them from
// reading as flat gray-on-gray against the page background, without
// standing out enough to compete with the colored affiliation chips.
export const chipBg = "#eeece7";
export const chipText = "#6b665f";
export const chipBgStrong = "#e1ded6";
export const chipTextStrong = "#57524a";

// Fallback for advisor-dept codes that don't match a known department -
// deliberately distinct from any real affiliation color (including
// "external org") so bad/unmapped data is visually obvious, not disguised.
export const unknownAffiliationColor = { bg: "#e8e8e8", text: "#555555" };

export const Link = styled.a`
  color: ${accent};
  transition: 0.3s all ease;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

export default GlobalStyles;
