import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ClickSeriesItem = {
  dayUtc: string; // "YYYY-MM-DD"
  clicks: number;
};

function formatDayLabel(dayUtc: string) {
  const [year, month, day] = dayUtc.split("-");
  if (!year || !month || !day) return dayUtc;
  return `${day}/${month}`;
}

type ClicksBarChartProps = {
  series: ClickSeriesItem[];
  height?: number;
};

export function ClicksBarChart({ series, height = 260 }: ClicksBarChartProps) {
  const chartData = React.useMemo(() => {
    return series.map((seriesItem) => ({
      dayUtc: seriesItem.dayUtc,
      dayLabel: formatDayLabel(seriesItem.dayUtc),
      clicks: seriesItem.clicks,
    }));
  }, [series]);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dayLabel"
            tickMargin={8}
            interval="preserveStartEnd"
          />
          <YAxis allowDecimals={false} tickMargin={8} />
          <Tooltip
            formatter={(value) => {
              const numericValue =
                typeof value === "number" ? value : Number(value);
              return [numericValue, "Clicks"];
            }}
            labelFormatter={(label, payload) => {
              const payloadItem = payload?.[0]?.payload as
                | { dayUtc?: string }
                | undefined;

              const dayUtc = payloadItem?.dayUtc;
              return dayUtc ? `Day (UTC): ${dayUtc}` : String(label);
            }}
          />
          <Bar dataKey="clicks" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
