const test = require("node:test");
const assert = require("node:assert");
const { safeEqual } = require("./auth.js");

test("safeEqual", async (t) => {
  await t.test("returns true for identical strings", () => {
    assert.strictEqual(safeEqual("identical_string", "identical_string"), true);
  });

  await t.test("returns true for empty strings", () => {
    assert.strictEqual(safeEqual("", ""), true);
  });

  await t.test("returns false for strings of different lengths", () => {
    assert.strictEqual(safeEqual("short", "longer_string"), false);
  });

  await t.test(
    "returns false for strings of same length but different content",
    () => {
      assert.strictEqual(safeEqual("abc", "def"), false);
    },
  );

  await t.test("coerces non-string inputs to strings", () => {
    assert.strictEqual(safeEqual(12345, "12345"), true);
    assert.strictEqual(safeEqual(true, "true"), true);
    assert.strictEqual(safeEqual(null, "null"), true);
    assert.strictEqual(safeEqual(undefined, "undefined"), true);
    assert.strictEqual(safeEqual(12345, 54321), false);
  });

  await t.test("returns false for subtly different strings", () => {
    assert.strictEqual(safeEqual("password123", "password124"), false);
  });
});
