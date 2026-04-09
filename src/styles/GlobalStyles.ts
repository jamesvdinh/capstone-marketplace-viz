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

export const accent = "#0b5394";
export const bgColor = "#f5f5f5";
export const borderColor = "#ddd";
export const headingColor = "#6E85B2";
export const titleColor = "#b399dc";
export const subtitleColor = "#939aad";
export const textColor = "#dcdcdc";

export const Link = styled.a`
  color: ${accent};
  transition: 0.3s all ease;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

export default GlobalStyles;
