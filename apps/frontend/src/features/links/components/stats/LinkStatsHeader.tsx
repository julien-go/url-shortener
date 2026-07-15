import { Link } from "react-router-dom";
import { Separator } from "../../../../components/ui/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../../components/ui/toggle-group";
import type { StatsRange } from "../../hooks/useLinkStats";

export function LinkStatsHeader({
  range,
  onRangeChange,
}: {
  range: StatsRange;
  onRangeChange: (value: StatsRange) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-[2.15rem]">
            Link statistics
          </h1>
          <p className="text-sm text-muted-foreground">
            <Link
              to="/links"
              className="font-semibold text-primary underline transition-opacity hover:opacity-70"
            >
              Back to my links
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <ToggleGroup
            type="single"
            value={range}
            aria-label="Statistics period"
            onValueChange={(rangeValue: string) => {
              if (!rangeValue) return;
              onRangeChange(rangeValue as StatsRange);
            }}
          >
            <ToggleGroupItem
              value="DAYS_7"
              className="data-[state=on]:bg-primary/12 data-[state=on]:text-primary"
            >
              7 days
            </ToggleGroupItem>
            <ToggleGroupItem
              value="DAYS_30"
              className="data-[state=on]:bg-primary/12 data-[state=on]:text-primary"
            >
              30 days
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <Separator className="bg-border/80" />
    </div>
  );
}
