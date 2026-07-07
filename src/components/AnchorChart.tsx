"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ANCHOR_INFO, ANCHOR_TYPES, type AnchorScores, type AnchorType } from "@/lib/analysis/anchors";

export default function AnchorChart({
  scores,
  dominant,
}: {
  scores: AnchorScores;
  dominant: AnchorType;
}) {
  const data = ANCHOR_TYPES.map((type) => ({
    type,
    label: ANCHOR_INFO[type].label,
    score: scores[type] ?? 0,
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 8 }}>
          <XAxis type="number" domain={[0, 10]} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--chart-ink)", fontSize: 12 }}
          />
          <Bar dataKey="score" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell
                key={entry.type}
                fill={entry.type === dominant ? "var(--chart-line)" : "var(--chart-line-muted)"}
              />
            ))}
            <LabelList
              dataKey="score"
              position="right"
              style={{ fill: "var(--chart-ink)", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
