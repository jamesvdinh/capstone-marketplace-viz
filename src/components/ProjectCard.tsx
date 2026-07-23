import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../types/project";
import capstoneLogo from "../assets/Long Wrapped Logo (resized).png";
import styled, { css } from "styled-components";
import SkeletonBlock from "./Skeleton";
import * as palette from ".././styles/GlobalStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

type ProjectCardProps = {
  project: Project;
  viewMode: "grid" | "list";
};

const affiliationColors = {
  bioe: { bg: "#d0e8ff", text: "#1a4a7a" },
  cee: { bg: "#d4f0d4", text: "#1a5c1a" },
  eecs: { bg: "#fde8c8", text: "#7a3d00" },
  ieor: { bg: "#e8d4f8", text: "#4a1a7a" },
  me: { bg: "#ffd6d6", text: "#7a1a1a" },
  mse: { bg: "#d6f5f0", text: "#1a5c50" },
  ne: { bg: "#fff3cc", text: "#7a5500" },
  external: { bg: "#f0d6e8", text: "#6a1a4a" },
};

function getAffiliationChip(
  ucbAffiliation: string,
  affiliation: string
): { label: string; color: (typeof affiliationColors)["bioe"] } | null {
  if (ucbAffiliation == "External Organization") {
    return {
      label: affiliation || "External",
      color: affiliationColors.external,
    };
  }

  // ucbAffiliation is formatted like "UCB - EECS"; extract the dept code
  const deptCode = ucbAffiliation.replace(/^UCB\s*-\s*/i, "").trim();
  const color =
    affiliationColors[
      deptCode.toLowerCase() as keyof typeof affiliationColors
    ] || palette.unknownAffiliationColor;
  return { label: deptCode || ucbAffiliation, color };
}

const ProjectThumbnail = ({
  project,
  viewMode,
}: {
  project: Project;
  viewMode: "grid" | "list";
}) => {
  const [imgSrc, setImgSrc] = useState(
    project.thumbnail || project.thumbnailFallback || capstoneLogo
  );
  const [loaded, setLoaded] = useState(false);

  // Cached images can be `complete` the instant the node mounts, before any
  // load event would fire, which would otherwise leave the skeleton stuck.
  const checkAlreadyLoaded = (node: HTMLImageElement | null) => {
    if (node?.complete) {
      setLoaded(true);
    }
  };

  const handleImgError = () => {
    setLoaded(false);
    if (imgSrc === project.thumbnail && project.thumbnailFallback) {
      setImgSrc(project.thumbnailFallback);
    } else if (imgSrc !== capstoneLogo) {
      setImgSrc(capstoneLogo);
    }
  };

  return (
    <ThumbnailWrapper $viewMode={viewMode}>
      {!loaded && <Skeleton />}
      <Thumbnail
        ref={checkAlreadyLoaded}
        $hasThumb={imgSrc !== capstoneLogo}
        $loaded={loaded}
        src={imgSrc}
        loading="lazy"
        alt="Project Thumbnail"
        onLoad={() => setLoaded(true)}
        onError={handleImgError}
      />
    </ThumbnailWrapper>
  );
};

const MAX_KEYWORD_LINES = 5;
const ROW_TOLERANCE = 2; // px slack for grouping chips into the same visual row
const GAP = 5; // matches KeywordContainer's `gap`

// The card is `overflow: hidden` (needed to clip the thumbnail to its
// rounded corners), which would clip this tooltip too if it were a normal
// absolutely-positioned child - so it's portaled to <body> and positioned
// from the chip's live screen coordinates instead.
const MoreChipWithTooltip = ({
  hiddenKeywords,
}: {
  hiddenKeywords: string[];
}) => {
  const chipRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null
  );

  const show = () => {
    const rect = chipRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({ top: rect.top - 6, left: rect.left });
  };
  const hide = () => setAnchor(null);

  return (
    <>
      <MoreChip ref={chipRef} onMouseEnter={show} onMouseLeave={hide}>
        +{hiddenKeywords.length}
      </MoreChip>
      {anchor &&
        createPortal(
          <MoreTooltip
            style={{ top: anchor.top, left: anchor.left }}
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            {hiddenKeywords.map((keyword, i) => (
              <span key={i}>{keyword}</span>
            ))}
          </MoreTooltip>,
          document.body
        )}
    </>
  );
};

const KeywordList = ({
  affiliationChip,
  keywords,
}: {
  affiliationChip: React.ReactNode;
  keywords: string[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostRef = useRef<HTMLDivElement>(null);
  // Every chip (affiliation + keywords), used only for measuring rows -
  // kept off-screen so the visible list can be trimmed independently.
  const allChips = affiliationChip ? [affiliationChip, ...keywords] : keywords;
  const [visibleCount, setVisibleCount] = useState(allChips.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const ghost = ghostRef.current;
    const items = itemRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );

    const measure = () => {
      if (!container || !ghost || items.length === 0) {
        setVisibleCount(allChips.length);
        return;
      }

      const rows: HTMLDivElement[][] = [];
      items.forEach((item) => {
        const row = rows[rows.length - 1];
        if (
          row &&
          Math.abs(item.offsetTop - row[0].offsetTop) <= ROW_TOLERANCE
        ) {
          row.push(item);
        } else {
          rows.push([item]);
        }
      });

      if (rows.length <= MAX_KEYWORD_LINES) {
        setVisibleCount(allChips.length);
        return;
      }

      let visible = rows.slice(0, MAX_KEYWORD_LINES).flat();
      const containerWidth = container.clientWidth;

      // Leave room on the last visible row for the "+N" badge; if it
      // doesn't fit, keep dropping the last chip until it does.
      while (visible.length > 0) {
        const lastItem = visible[visible.length - 1];
        const usedRight = lastItem.offsetLeft + lastItem.offsetWidth;
        if (usedRight + GAP + ghost.offsetWidth <= containerWidth) break;
        visible = visible.slice(0, -1);
      }

      setVisibleCount(visible.length);
    };

    measure();

    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords, affiliationChip]);

  const hiddenKeywords = keywords.slice(
    Math.max(visibleCount - (affiliationChip ? 1 : 0), 0)
  );
  const visibleKeywords = keywords.slice(
    0,
    Math.max(visibleCount - (affiliationChip ? 1 : 0), 0)
  );

  return (
    <KeywordContainer ref={containerRef}>
      <Measurer aria-hidden="true">
        {allChips.map((chip, i) =>
          typeof chip === "string" ? (
            <Keyword
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              {chip}
            </Keyword>
          ) : (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              {chip}
            </div>
          )
        )}
      </Measurer>
      <MoreChipGhost ref={ghostRef}>+99</MoreChipGhost>

      {affiliationChip}
      {visibleKeywords.map((keyword, i) => (
        <Keyword key={i}>{keyword}</Keyword>
      ))}
      {hiddenKeywords.length > 0 && (
        <MoreChipWithTooltip hiddenKeywords={hiddenKeywords} />
      )}
    </KeywordContainer>
  );
};

const ProjectCard = ({ project, viewMode }: ProjectCardProps) => {
  return (
    <ParentContainer $viewMode={viewMode} href={project.url} target="_blank">
      <ProjectId>ID: {project.projectId}</ProjectId>
      <ProjectThumbnail
        key={`${project.thumbnail}|${project.thumbnailFallback}`}
        project={project}
        viewMode={viewMode}
      />
      <ContentContainer>
        <Title title={project.name}>{project.name}</Title>
        <AdvisorContainer>
          <FontAwesomeIcon className="small-icon" icon={["far", "user"]} />
          <span>
            {project.advisorNames && project.advisorNames.length > 0
              ? project.advisorNames.join(", ")
              : "TBD"}
          </span>
        </AdvisorContainer>
        <KeywordList
          affiliationChip={(() => {
            const chip = getAffiliationChip(
              project.ucbAffiliation,
              project.affiliation
            );
            return chip ? (
              <AffiliationChip $bg={chip.color.bg} $text={chip.color.text}>
                {chip.label}
              </AffiliationChip>
            ) : null;
          })()}
          keywords={project.keywords}
        />
      </ContentContainer>
    </ParentContainer>
  );
};

const truncateText = css`
  display: -webkit-box;
  -webkit-line-clamp: 4; /* default */
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: calc(1.5em * 4);
`;

const ParentContainer = styled.a<{ $viewMode: string }>`
  display: flex;
  flex-direction: ${(props) => (props.$viewMode === "grid" ? "column" : "row")};
  border: 1px solid ${palette.borderColor};
  border-radius: 5px;
  overflow: hidden;
  width: ${(props) => (props.$viewMode === "grid" ? "280px;" : "100%")};
  height: ${(props) => (props.$viewMode === "grid" ? "100%" : "auto")};
  line-height: 1.4;
  animation: fade-in 0.3s ease;
  position: relative;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-5px);

    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }

  &.excess {
    display: none;
  }

  &.open {
    display: block;
    animation: fade-in 0.3s ease;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 100;
      transform: translateY(0px);
    }
  }
`;

const ContentContainer = styled.div`
  padding: 0.25rem 0.75rem 0.5rem;
`;

const ProjectId = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.5); /* Opaque white */
  // backdrop-filter: blur(4px); /* Optional: adds a nice glass effect */
  border-radius: 0 0 5px 0;
  padding: 4px 8px;
  min-width: 30px;
  text-align: center;
  z-index: 10;
`;

const ThumbnailWrapper = styled.div<{ $viewMode: string }>`
  position: relative;
  width: ${(props) => (props.$viewMode === "grid" ? "100%" : "250px")};
  height: 150px;
  flex-shrink: 0;
  overflow: hidden;
`;

const Skeleton = styled(SkeletonBlock)`
  position: absolute;
  inset: 0;
  border-radius: 0;
`;

const Thumbnail = styled.img<{ $hasThumb: boolean; $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: ${(props) => (props.$hasThumb ? "cover" : "contain")};
  padding: ${(props) => (props.$hasThumb ? "0" : "1rem")};
  background-color: ${(props) => (props.$hasThumb ? "#f0f0f0" : "white")};
  opacity: ${(props) => (props.$loaded ? 1 : 0)};
  transition: opacity 0.25s ease;

  /* Centers the alt text (and browser's broken-image glyph) in the box */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1rem;
  margin: 0.5em 0;
  ${truncateText}
`;

const AdvisorContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 0.75rem;
  gap: 5px;
  margin: 5px 0 10px;
`;

const KeywordContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  gap: 5px;
`;

// Off-screen clone of every chip, used only to measure which row each one
// falls into - decoupled from the visible (trimmed) list so re-measuring
// after a resize always starts from the full set again.
const Measurer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  visibility: hidden;
  display: flex;
  flex-flow: row wrap;
  gap: 5px;
  pointer-events: none;
  z-index: -1;
`;

const AffiliationChip = styled.div<{ $bg: string; $text: string }>`
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$text};
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Keyword = styled.div`
  background-color: ${palette.chipBg};
  color: ${palette.chipText};
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
`;

const MoreChipGhost = styled(Keyword)`
  position: absolute;
  visibility: hidden;
  top: -9999px;
  left: -9999px;
  white-space: nowrap;
`;

const MoreChip = styled.div`
  background-color: ${palette.chipBgStrong};
  color: ${palette.chipTextStrong};
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: default;
`;

// Positioned via inline `top`/`left` (viewport coordinates) and anchored to
// grow upward from that point, since it's portaled to <body> rather than
// nested in the card - see MoreChipWithTooltip.
const MoreTooltip = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 4px;
  position: fixed;
  transform: translateY(-100%);
  background: white;
  border: 1px solid ${palette.borderColor};
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 140px;
  max-width: 220px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 20;
  font-size: 0.75rem;
  font-weight: 400;
  color: #333;
  white-space: normal;
`;

export default ProjectCard;
