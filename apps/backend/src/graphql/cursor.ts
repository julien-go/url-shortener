import { z } from "zod";

const decodedCursorSchema = z.object({
  createdAt: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid cursor"),
  id: z.string().uuid("Invalid cursor"),
});

function toIsoCursorTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid cursor");
  }
  return date.toISOString();
}

export function encodeCursor(createdAt: string | Date, id: string) {
  return Buffer.from(
    `${toIsoCursorTimestamp(createdAt)}|${id}`,
    "utf8",
  ).toString("base64");
}

export function decodeCursor(cursor: string) {
  let raw: string;

  try {
    raw = Buffer.from(cursor, "base64").toString("utf8");
  } catch {
    throw new Error("Invalid cursor");
  }

  const parts = raw.split("|");
  if (parts.length !== 2) throw new Error("Invalid cursor");

  const parsed = decodedCursorSchema.safeParse({
    createdAt: parts[0],
    id: parts[1],
  });

  if (!parsed.success) {
    throw new Error("Invalid cursor");
  }

  return {
    createdAt: toIsoCursorTimestamp(parsed.data.createdAt),
    id: parsed.data.id,
  };
}
