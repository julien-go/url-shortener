import { appConfig } from "../config/app";

export function HomeLanding() {
  return (
    <section
      className={`mt-10 flex min-h-[60vh] min-w-0 flex-col justify-center space-y-6 sm:mt-12 md:mt-15 md:space-y-9`}
    >
      <div
        className={`relative mx-auto w-full min-w-0 max-w-3xl overflow-hidden px-1 py-3 text-center sm:px-2 sm:py-4 md:py-5`}
      >
        <div className="relative mx-auto w-full max-w-2xl space-y-4.5">
          <div className="mb-10">
            <h1 className="font-display mx-auto max-w-3xl text-[2rem] font-black tracking-[-0.045em] text-foreground sm:text-5xl md:text-[4.15rem] md:leading-[0.9]">
              Shorten URLs,
              <br />
              instantly.
            </h1>
            <p className="mt-5 mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create short URLs and manage them from a clean interface.
            </p>
          </div>
          <div className="mb-8 mt-4 flex justify-center">
            <div className="flex w-full flex-wrap items-center justify-center gap-2.5 sm:w-fit sm:gap-3">
              <div className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/8 px-3.5 py-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/14">
                Custom slugs
              </div>
              <div className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/8 px-3.5 py-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/14">
                Click tracking
              </div>
            </div>
          </div>

          <div
            className={`mx-auto mt-7 flex w-full min-w-0 max-w-2xl flex-col gap-2.5 rounded-xl border border-border bg-card/96 p-4 text-left shadow-(--shadow-surface) sm:p-5`}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              example
            </p>
            <p className="mt-1 min-w-0 truncate text-sm text-muted-foreground/72">
              https://example.com/a-long-example-link-that-could-be-shortened-to-make-sharing-easier
            </p>
            <p className="mt-1 text-base font-semibold leading-none text-foreground/85">
              ↓
            </p>
            <p className="mt-1 break-all font-mono text-[1.35rem] font-extrabold text-primary sm:text-[1.7rem]">
              {`${appConfig.siteUrl}/example`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              128 clicks · Last click 3m ago
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
