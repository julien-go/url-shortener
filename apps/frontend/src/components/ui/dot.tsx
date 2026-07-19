import { cn } from "../../lib/utils";

export function Dot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-1.75 w-1.75 rounded-full", className)}
    />
  );
}
