import { useId } from "react";

function pathFor(values: number[], width: number, height: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / span) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${pts.join(" L")}`;
}

export function Sparkline({
  values,
  width = 96,
  height = 28,
  positive,
}: {
  values: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const id = useId();
  const color = positive === undefined ? "#4d9fff" : positive ? "#0ecb81" : "#f6465d";
  const d = pathFor(values, width, height);
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
