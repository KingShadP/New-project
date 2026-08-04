const test = require("node:test");
const assert = require("node:assert");
const { mergeDeep } = require("./storage");

test("mergeDeep", async (t) => {
  await t.test("merges two plain objects deeply", () => {
    const base = { a: 1, b: { c: 2 } };
    const override = { b: { d: 3 }, e: 4 };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  await t.test("overwrites primitive with primitive", () => {
    const base = { a: 1 };
    const override = { a: 2 };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: 2 });
  });

  await t.test("overwrites object with primitive", () => {
    const base = { a: { b: 1 } };
    const override = { a: 2 };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: 2 });
  });

  await t.test("overwrites primitive with object", () => {
    const base = { a: 1 };
    const override = { a: { b: 2 } };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: { b: 2 } });
  });

  await t.test(
    "handles arrays by overwriting the base array with the override array",
    () => {
      const base = { arr: [1, 2] };
      const override = { arr: [3, 4, 5] };
      const result = mergeDeep(base, override);
      assert.deepStrictEqual(result, { arr: [3, 4, 5] });
    },
  );

  await t.test(
    "handles arrays by leaving base array if override is not an array (but base is)",
    () => {
      const base = { arr: [1, 2] };
      const override = { arr: undefined }; // In this case override is undefined, which is not plain obj
      const result = mergeDeep(base, override);
      assert.deepStrictEqual(result, { arr: [1, 2] });
    },
  );

  await t.test("returns override array if base is not an array", () => {
    const base = { arr: "string" };
    const override = { arr: [1, 2] };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { arr: [1, 2] });
  });

  await t.test("handles null values by overwriting", () => {
    const base = { a: { b: 1 } };
    const override = { a: null };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: null });
  });

  await t.test("retains base if override is undefined", () => {
    const base = { a: 1 };
    const override = { a: undefined };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: 1 });
  });

  await t.test("preserves base properties not in override", () => {
    const base = { a: 1, b: 2 };
    const override = { a: 3 };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: 3, b: 2 });
  });

  await t.test("does not mutate the base object", () => {
    const base = { a: { b: 1 } };
    const override = { a: { c: 2 } };
    const result = mergeDeep(base, override);
    assert.deepStrictEqual(result, { a: { b: 1, c: 2 } });
    assert.deepStrictEqual(base, { a: { b: 1 } });
  });
});
