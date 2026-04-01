import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import type { Project } from "../types/project";
import * as palette from "../styles/GlobalStyles";

interface BubbleNode extends d3.SimulationNodeDatum {
  keyword: string;
  count: number;
  r: number;
}

interface TooltipState {
  nodeX: number;
  nodeY: number;
  nodeR: number;
  keyword: string;
  count: number;
}

interface Props {
  projects: Project[];
  height?: number;
  onKeywordClick?: (keyword: string) => void;
}

function buildFrequencyMap(projects: Project[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const project of projects) {
    for (const kw of project.keywords) {
      const key = kw.trim().toLowerCase();
      if (key) freq.set(key, (freq.get(key) ?? 0) + 1);
    }
  }
  return freq;
}

const KeywordBubbleChart = ({ projects, height = 500, onKeywordClick }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [nodes, setNodes] = useState<BubbleNode[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(
    null
  );

  // Measure container width responsively
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Re-run simulation when data or dimensions change
  useEffect(() => {
    if (!projects.length || containerWidth === 0) return;

    const freq = buildFrequencyMap(projects);
    const maxCount = Math.max(...freq.values());

    const radiusScale = d3.scaleSqrt().domain([1, maxCount]).range([12, 60]);
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([1, maxCount]);

    const bubbleNodes: BubbleNode[] = Array.from(freq.entries())
      .filter(([, count]) => count >= 3)
      .map(([keyword, count]) => ({
        keyword,
        count,
        r: radiusScale(count),
        x: containerWidth / 2 + (Math.random() - 0.5) * 100,
        y: height / 2 + (Math.random() - 0.5) * 100,
        ...({ color: colorScale(count) } as object),
      }));

    simulationRef.current?.stop();

    const simulation = d3
      .forceSimulation(bubbleNodes)
      .force("charge", d3.forceManyBody().strength(2))
      .force("center", d3.forceCenter(containerWidth / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<BubbleNode>((d) => d.r + 2).strength(0.9)
      )
      .on("tick", () => {
        // Clamp every node inside the SVG bounds
        for (const node of bubbleNodes) {
          node.x = Math.max(node.r, Math.min(containerWidth - node.r, node.x!));
          node.y = Math.max(node.r, Math.min(height - node.r, node.y!));
        }
        setNodes([...bubbleNodes]);
      })
      .on("end", () => {
        setNodes([...bubbleNodes]);
      });

    simulationRef.current = simulation;
    return () => {
      simulation.stop();
    };
  }, [projects, containerWidth, height]);

  return (
    <ChartWrapper ref={wrapperRef}>
      {containerWidth > 0 && (
        <svg width={containerWidth} height={height}>
          {nodes.map((node) => {
            const color = (node as BubbleNode & { color: string }).color;
            const isDark =
              node.count > Math.max(...nodes.map((n) => n.count)) / 2;
            return (
              <g
                key={node.keyword}
                transform={`translate(${node.x ?? containerWidth / 2}, ${
                  node.y ?? height / 2
                })`}
                style={{ cursor: "pointer" }}
                onClick={() => onKeywordClick?.(node.keyword)}
                onMouseEnter={() => {
                  setTooltip({
                    nodeX: node.x ?? 0,
                    nodeY: node.y ?? 0,
                    nodeR: node.r,
                    keyword: node.keyword,
                    count: node.count,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle
                  r={node.r}
                  fill={color}
                  stroke={palette.accent}
                  strokeWidth={1.5}
                  fillOpacity={0.85}
                />
                {node.r >= 22 && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(node.r * 0.32, 13)}
                    fill={isDark ? "#fff" : "#1a3a5c"}
                    fontWeight={600}
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {node.keyword.length > 12
                      ? node.keyword.slice(0, 11) + "…"
                      : node.keyword}
                  </text>
                )}
              </g>
            );
          })}

          {tooltip &&
            (() => {
              const tipWidth = Math.max(tooltip.keyword.length * 7.5, 80) + 16;
              const rightEdge = tooltip.nodeX + tooltip.nodeR + 6 + tipWidth;
              const flipped = rightEdge > containerWidth;
              const tipX = flipped
                ? tooltip.nodeX - tooltip.nodeR - 6 - tipWidth
                : tooltip.nodeX + tooltip.nodeR + 6;
              return (
                <g
                  transform={`translate(${tipX}, ${tooltip.nodeY})`}
                  pointerEvents="none"
                >
                  <rect
                    x={0}
                    y={-18}
                    width={tipWidth}
                    height={42}
                    rx={6}
                    fill="#1a1a2e"
                    fillOpacity={0.92}
                  />
                  <text x={8} y={-2} fill="#fff" fontSize={12} fontWeight={600}>
                    {tooltip.keyword}
                  </text>
                  <text x={8} y={16} fill="#cdd6f4" fontSize={11}>
                    {tooltip.count} project{tooltip.count !== 1 ? "s" : ""}
                  </text>
                </g>
              );
            })()}
        </svg>
      )}
    </ChartWrapper>
  );
};

const ChartWrapper = styled.div`
  width: 100%;
  overflow: visible;

  svg {
    display: block;
  }
`;

export default KeywordBubbleChart;
