/**
 * @file Sparkline.tsx
 * @description Minimal inline-SVG sparkline for seizure-trend series.
 */

interface Props {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
}

export function Sparkline({ data, color = "#6ea8fe", width = 130, height = 30 }: Props) {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;
    const points = data
        .map((d, i) => `${(i / (data.length - 1)) * width},${height - ((d - min) / span) * (height - 4) - 2}`)
        .join(" ");
    return (
        <svg className="wwv-drug-spark" width={width} height={height} aria-hidden="true">
            <polyline points={points} fill="none" stroke={color} strokeWidth={1.6} />
        </svg>
    );
}
