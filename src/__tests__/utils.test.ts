import { generateId, slugify, truncate, sleep, pick } from "../lib/utils";

describe("generateId", () => {
  it("should return a UUID string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("slugify", () => {
  it("should convert text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("Task & Project #1!")).toBe("task-project-1");
  });

  it("should collapse multiple dashes", () => {
    expect(slugify("Multiple   Spaces")).toBe("multiple-spaces");
  });

  it("should trim leading and trailing dashes", () => {
    expect(slugify("  -trim-  ")).toBe("trim");
  });
});

describe("truncate", () => {
  it("should not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("should truncate long strings with ellipsis", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("should handle exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("sleep", () => {
  it("should resolve after specified milliseconds", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

describe("pick", () => {
  it("should pick specified keys from object", () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("should ignore missing keys", () => {
    const obj = { a: 1 };
    expect(pick(obj, ["a", "z"] as any)).toEqual({ a: 1 });
  });
});
