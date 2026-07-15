import type { ReactNode } from "react";
import { appConfig } from "../config/app";
import { useDocumentTitle } from "../lib/hooks/useDocumentTitle";

function FeatureTag({ children }: { children: ReactNode }) {
  return (
    <span className="border-b border-foreground pb-0.5 text-sm font-semibold text-foreground">
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
    <div className="mx-auto w-full max-w-[32.5rem] overflow-hidden rounded-xl border border-border bg-card text-left shadow-(--shadow-surface)">
      <div className="border-b border-border/70 px-6 py-4 sm:px-7">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Example
        </p>
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
          <p className="font-display mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
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
    <section className="mt-10 flex min-h-[60vh] min-w-0 flex-col justify-center space-y-6 sm:mt-12 md:mt-15 md:space-y-9">
      <div className="relative mx-auto w-full min-w-0 max-w-3xl px-1 py-3 text-center sm:px-2 sm:py-4 md:py-5">
        <h1 className="font-display mx-auto max-w-3xl text-[2rem] font-extrabold leading-[1.05] text-foreground sm:text-5xl md:text-[3.75rem]">
          Shorten URLs,
          <br />
          <span className="text-primary">instantly.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[27.5rem] text-base leading-relaxed text-muted-foreground sm:text-lg">
          Create short URLs and manage them from a clean interface.
        </p>

        <div className="mb-11 mt-8 flex flex-wrap items-center justify-center gap-6">
          <FeatureTag>Custom slugs</FeatureTag>
          <FeatureTag>Click tracking</FeatureTag>
        </div>

        <ExamplePreview />
      </div>
    </section>
  );
}
