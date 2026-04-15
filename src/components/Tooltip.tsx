import styled from "styled-components";

type TooltipProps = {
  text: string;
  children: React.ReactNode;
};

const Tooltip = ({ text, children }: TooltipProps) => {
  return <TooltipContainer data-tooltip={text}>{children}</TooltipContainer>;
};

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;

    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 14px;
    pointer-events: none;

    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    border: 6px solid transparent;
    border-top-color: #333;
    pointer-events: none;

    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
  }

  &:hover::after,
  &:hover::before {
    opacity: 1;
    visibility: visible;
  }
`;

export default Tooltip;
