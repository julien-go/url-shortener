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
import type { ClickPoint, StatsGranularity } from "../../api/types";
import { formatBucketLabel } from "./trend";

export type ClickSeriesItem = ClickPoint;

type ClicksBarChartProps = {
  series: ClickSeriesItem[];
  granularity: StatsGranularity;
  height?: number;
};

export function ClicksBarChart({
  series,
  granularity,
  height = 260,
}: ClicksBarChartProps) {
  const chartData = React.useMemo(() => {
    return series.map((seriesItem) => ({
      bucketStart: seriesItem.bucketStart,
      bucketLabel: formatBucketLabel(seriesItem.bucketStart, granularity),
      clicks: seriesItem.clicks,
    }));
  }, [series, granularity]);

  return (
    <div style={{ width: "100%", height }} className="min-w-0">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="bucketLabel"
            stroke="var(--muted-foreground)"
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--muted-foreground)"
            tickMargin={8}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
              borderRadius: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Bar dataKey="clicks" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
