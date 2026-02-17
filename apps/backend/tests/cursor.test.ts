import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "../src/graphql/cursor";

describe("graphql cursor", () => {
  it("encodes and decodes a valid cursor", () => {
    const inputDate = "2025-01-12T10:11:12.000Z";
    const inputId = "123e4567-e89b-12d3-a456-426614174000";

    const encoded = encodeCursor(inputDate, inputId);
    const decoded = decodeCursor(encoded);

    expect(decoded).toEqual({ createdAt: inputDate, id: inputId });
  });

  it("throws when cursor payload is malformed", () => {
    const malformed = "bm90fGVub3VnaHxwYXJ0cw==";
    expect(() => decodeCursor(malformed)).toThrowError("Invalid cursor");
  });

  it("throws when date or id are invalid", () => {
    const badDate =
      "ZGVmaW5pdGVseS1ub3QtYS1kYXRlfDEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMA==";

    const badUuid = "MjAyNS0wMS0xMlQxMDoxMToxMi4wMDBafG5vdC1hLXV1aWQ=";

    expect(() => decodeCursor(badDate)).toThrowError("Invalid cursor");
    expect(() => decodeCursor(badUuid)).toThrowError("Invalid cursor");
  });
});
