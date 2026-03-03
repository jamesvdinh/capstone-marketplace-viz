import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
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
export const headingColor = "#6E85B2";
export const titleColor = "#b399dc";
export const subtitleColor = "#939aad";
export const textColor = "#dcdcdc";

export default GlobalStyles;
