const test = require("node:test");
const assert = require("node:assert");
const { parseDataUrl } = require("./upload");

test("parseDataUrl - Happy paths", async (t) => {
  await t.test("parses a valid image data URL", () => {
    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const result = parseDataUrl(dataUrl);

    assert.strictEqual(result.contentType, "image/png");
    assert.ok(Buffer.isBuffer(result.buffer));
    assert.strictEqual(
      result.buffer.toString("base64"),
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    );
  });

  await t.test("parses a valid video data URL", () => {
    const dataUrl =
      "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA";
    const result = parseDataUrl(dataUrl);

    assert.strictEqual(result.contentType, "video/mp4");
    assert.ok(Buffer.isBuffer(result.buffer));
    assert.strictEqual(
      result.buffer.toString("base64"),
      "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAA",
    );
  });
});

test("parseDataUrl - Error condition 1 (Missing or invalid data URLs)", async (t) => {
  await t.test("throws 400 for empty input", () => {
    try {
      parseDataUrl("");
      assert.fail("Expected an error to be thrown");
    } catch (err) {
      assert.strictEqual(err.message, "Upload must be a base64 data URL.");
      assert.strictEqual(err.statusCode, 400);
    }
  });

  await t.test("throws 400 for null input", () => {
    try {
      parseDataUrl(null);
      assert.fail("Expected an error to be thrown");
    } catch (err) {
      assert.strictEqual(err.message, "Upload must be a base64 data URL.");
      assert.strictEqual(err.statusCode, 400);
    }
  });

  await t.test("throws 400 for plain string without data URI format", () => {
    try {
      parseDataUrl("just a regular string");
      assert.fail("Expected an error to be thrown");
    } catch (err) {
      assert.strictEqual(err.message, "Upload must be a base64 data URL.");
      assert.strictEqual(err.statusCode, 400);
    }
  });

  await t.test("throws 400 if missing base64 marker", () => {
    try {
      parseDataUrl("data:text/plain,Hello World");
      assert.fail("Expected an error to be thrown");
    } catch (err) {
      assert.strictEqual(err.message, "Upload must be a base64 data URL.");
      assert.strictEqual(err.statusCode, 400);
    }
  });
});

test("parseDataUrl - Error condition 2 (Unsupported content types)", async (t) => {
  await t.test("throws 415 for text/plain", () => {
    try {
      parseDataUrl("data:text/plain;base64,SGVsbG8gV29ybGQ=");
      assert.fail("Expected an error to be thrown");
    } catch (err) {
      assert.strictEqual(
        err.message,
        "Only image and video uploads are allowed.",
      );
      assert.strictEqual(err.statusCode, 415);
    }
  });

  await t.test("throws 415 for application/pdf", () => {
    try {
      parseDataUrl(
        "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoK",
      );
      assert.fail("Expected an error to be thrown");
    } catch (err) {
      assert.strictEqual(
        err.message,
        "Only image and video uploads are allowed.",
      );
      assert.strictEqual(err.statusCode, 415);
    }
  });
});
