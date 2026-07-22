import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s ease infinite;
  border-radius: 4px;
`;

export default Skeleton;
