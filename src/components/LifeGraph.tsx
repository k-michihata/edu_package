"use client";

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Answer } from "@/lib/types";

interface GraphPoint {
  age: number;
  value: 1 | -1;
  description: string;
  action_text: string;
}

const MAX_LABEL_LENGTH = 12;

function truncate(text: string): string {
  return text.length > MAX_LABEL_LENGTH ? `${text.slice(0, MAX_LABEL_LENGTH)}…` : text;
}

function PointLabel(props: { x?: number | string; y?: number | string; index?: number; data: GraphPoint[] }) {
  const { x, y, index, data } = props;
  if (x === undefined || y === undefined || index === undefined) return null;
  const point = data[index];
  const above = point.value > 0;
  return (
    <text
      x={Number(x)}
      y={Number(y) + (above ? -14 : 20)}
      textAnchor="middle"
      fontSize={11}
      fill="var(--chart-ink)"
    >
      {truncate(point.description)}
    </text>
  );
}

function GraphTooltip(props: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: GraphPoint }>;
}) {
  if (!props.active || !props.payload?.length) return null;
  const point = props.payload[0].payload;
  return (
    <div className="max-w-xs rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-semibold">
        {point.age}歳・{point.value > 0 ? "😊 ポジティブ" : "😔 ネガティブ"}
      </p>
      <p className="mt-1 leading-6">{point.description}</p>
      {point.action_text && (
        <p className="mt-1 leading-6 text-zinc-500 dark:text-zinc-400">行動：{point.action_text}</p>
      )}
    </div>
  );
}

export default function LifeGraph({ answers }: { answers: Answer[] }) {
  const data: GraphPoint[] = [...answers]
    .sort((a, b) => a.age_at_event - b.age_at_event)
    .map((a) => ({
      age: a.age_at_event,
      value: a.evaluation === "positive" ? 1 : -1,
      description: a.description,
      action_text: a.action_text,
    }));

  return (
    <div className="h-[340px] w-full sm:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 28, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="age"
            type="number"
            domain={[10, 90]}
            ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90]}
            unit="歳"
            tickLine={false}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tick={{ fill: "var(--chart-ink-muted)", fontSize: 12 }}
          />
          <YAxis
            domain={[-1.6, 1.6]}
            ticks={[-1, 0, 1]}
            tickFormatter={(v: number) => (v > 0 ? "ポジ +" : v < 0 ? "ネガ −" : "")}
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "var(--chart-ink-muted)", fontSize: 12 }}
          />
          <ReferenceLine y={0} stroke="var(--chart-axis)" strokeWidth={1} />
          <Tooltip content={<GraphTooltip />} cursor={{ stroke: "var(--chart-grid)" }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-line)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            dot={{ r: 5, fill: "var(--chart-line)", stroke: "var(--background)", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "var(--chart-line)", stroke: "var(--background)", strokeWidth: 2 }}
            isAnimationActive={false}
          >
            <LabelList content={(props) => <PointLabel {...props} data={data} />} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
