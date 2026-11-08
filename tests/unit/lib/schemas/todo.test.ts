import { describe, expect, it } from "vite-plus/test";
import { uuidv7 } from "wcz-layout/utils";
import { TodoSchema } from "~/lib/schemas/todo";

describe("TodoSchema", () => {
  const id = uuidv7();

  it("accepts a valid todo and trims the name", () => {
    expect(TodoSchema.parse({ id, name: "  Buy milk  " })).toEqual({ id, name: "Buy milk" });
  });

  it("rejects a whitespace-only name as required", () => {
    const result = TodoSchema.safeParse({ id, name: "   " });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ["name"], code: "too_small" });
  });

  it("rejects a name longer than 255 characters", () => {
    expect(TodoSchema.safeParse({ id, name: "a".repeat(255) }).success).toBe(true);
    expect(TodoSchema.safeParse({ id, name: "a".repeat(256) }).success).toBe(false);
  });

  it("rejects an id that is not a uuid", () => {
    expect(TodoSchema.safeParse({ id: "1", name: "Buy milk" }).success).toBe(false);
  });
});
