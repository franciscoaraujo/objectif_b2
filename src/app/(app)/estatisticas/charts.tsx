"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = { fontSize: 12, fill: "var(--md-sys-color-on-surface-variant)" };
const GRID = "var(--md-sys-color-outline-variant)";
const tooltipStyle = {
  background: "var(--md-sys-color-inverse-surface)",
  color: "var(--md-sys-color-inverse-on-surface)",
  border: "none",
  borderRadius: 8,
  fontSize: 12,
};

export function WeeklyHoursChart({ data, goal }: { data: { week: string; horas: number }[]; goal: number }) {
  return (
    <div role="img" aria-label="Gráfico de barras com horas estudadas por semana" className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="week" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--md-sys-color-surface-container-high)" }} formatter={(v) => [`${v} h`, "Horas"]} labelFormatter={(l) => `Semana ${l}`} />
          <ReferenceLine y={goal} stroke="var(--md-sys-color-tertiary)" strokeDasharray="4 4" label={{ value: `meta ${goal} h`, position: "insideTopRight", fontSize: 11, fill: "var(--md-sys-color-tertiary)" }} />
          <Bar dataKey="horas" fill="var(--md-sys-color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillHoursChart({ data }: { data: { skill: string; horas: number; color: string }[] }) {
  return (
    <div role="img" aria-label="Gráfico de barras com horas por habilidade" className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="skill" tick={AXIS} tickLine={false} axisLine={false} width={96} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--md-sys-color-surface-container-high)" }} formatter={(v) => [`${v} h`, "Horas"]} />
          <Bar dataKey="horas" radius={[0, 4, 4, 0]}>
            {data.map((d) => (
              <Cell key={d.skill} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExamChart({
  data,
  keys,
  max,
  colors,
}: {
  data: Record<string, string | number | null>[];
  keys: string[];
  max: number;
  colors: string[];
}) {
  return (
    <div role="img" aria-label={`Evolução dos simulados: ${keys.join(" e ")}`} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tick={AXIS} tickLine={false} axisLine={false} />
          <YAxis domain={[0, max]} tick={AXIS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          {keys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

