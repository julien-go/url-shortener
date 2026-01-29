export function encodeCursor(createdAt: string, id: string) {
  return Buffer.from(`${createdAt}|${id}`, "utf8").toString("base64");
}

export function decodeCursor(cursor: string) {
  const raw = Buffer.from(cursor, "base64").toString("utf8");
  const [createdAt, id] = raw.split("|");
  if (!createdAt || !id) throw new Error("Invalid cursor");
  return { createdAt, id };
}
