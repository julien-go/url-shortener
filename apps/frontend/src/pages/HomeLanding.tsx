import type { ReactNode } from "react";
import { appConfig } from "../config/app";
import { useDocumentTitle } from "../lib/hooks/useDocumentTitle";
import { cn } from "../lib/utils";
import { Dot } from "../components/ui/dot";

function FeatureTag({
  children,
  dotClassName,
  hoverClassName,
}: {
  children: ReactNode;
  dotClassName: string;
  hoverClassName: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex cursor-default items-center gap-1.5 rounded-full border border-foreground/15 px-3.5 py-2 text-[0.8125rem] font-semibold text-foreground transition-colors duration-150 lg:px-4 lg:text-sm",
        hoverClassName,
      )}
    >
      <Dot className={dotClassName} />
      {children}
    </span>
  );
}

const CLICKS_PER_DAY = [15, 30, 20, 55, 35, 70, 45, 100];
const FULL_OPACITY_DAYS = new Set([3, 5, 7]);

function ExampleChart() {
  return (
    <div className="px-6 py-5 sm:px-7">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Clicks per day
      </p>
      <div className="flex h-16 items-end gap-2">
        {CLICKS_PER_DAY.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-[3px] bg-primary"
            style={{
              height: `${height}%`,
              opacity: FULL_OPACITY_DAYS.has(index)
                ? 1
                : index === 6
                  ? 0.4
                  : 0.25,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ExamplePreview() {
  return (
    <div className="mx-auto w-full max-w-130 overflow-hidden rounded-xl border-[1.5px] border-foreground/10 bg-card text-left shadow-[0_24px_48px_rgba(36,33,27,0.14)] transition-[border-color,box-shadow] duration-450 hover:border-primary hover:shadow-[0_18px_32px_rgba(31,111,92,0.12)] lg:mx-0 lg:max-w-none">
      <div className="flex items-center justify-between border-b border-border/70 px-6 py-4 sm:px-7">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Example
        </p>
        <Dot className="bg-primary" />
      </div>

      <div className="px-6 py-5 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Original URL
        </p>
        <p className="mt-1.5 truncate text-sm text-muted-foreground">
          https://example.com/a-long-example-link
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 bg-primary/6 px-6 py-5 sm:px-7">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Short link
          </p>
          <p className="font-display mt-1 truncate text-base font-extrabold text-primary sm:text-2xl">
            {`${appConfig.siteUrl}/example`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Clicks
          </p>
          <p className="font-display mt-1 text-xl font-extrabold tabular-nums text-ocre-strong sm:text-2xl">
            128
          </p>
        </div>
      </div>

      <ExampleChart />
    </div>
  );
}

export function HomeLanding() {
  useDocumentTitle(
    `${appConfig.appName} - URL Shortener`,
    "Create short links, manage them in a dashboard, and track daily clicks.",
  );

  return (
    <section className="bg-noise mt-10 flex min-h-[60vh] min-w-0 flex-col justify-center sm:mt-12 md:mt-15">
      <div className="relative mx-auto grid w-full min-w-0 max-w-3xl items-center gap-10 px-1 py-3 text-center sm:px-2 sm:py-4 md:py-5 lg:max-w-none lg:grid-cols-2 lg:gap-14 lg:px-40 lg:py-22 lg:text-left">
        <div>
          <h1 className="font-display mx-auto max-w-3xl text-[2rem] font-extrabold leading-[1.05] text-foreground sm:text-5xl md:text-[3.75rem] lg:mx-0 lg:text-[4rem]">
            Shorten URLs,
            <br />
            <span className="text-primary">instantly.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-110 text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 lg:max-w-116">
            Create short URLs and manage them from a clean interface.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <FeatureTag
              dotClassName="bg-primary"
              hoverClassName="hover:border-primary hover:text-primary"
            >
              Custom slugs
            </FeatureTag>
            <FeatureTag
              dotClassName="bg-ocre"
              hoverClassName="hover:border-ocre-strong hover:text-ocre-strong"
            >
              Click tracking
            </FeatureTag>
          </div>
        </div>

        <ExamplePreview />
      </div>
    </section>
  );
}
