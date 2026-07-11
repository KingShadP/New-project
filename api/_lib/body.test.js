const { test, describe } = require("node:test");
const assert = require("node:assert");
const { readJson } = require("./body.js");

describe("readJson", () => {
  test("returns req.body if it's already an object", async () => {
    const req = { body: { key: "value" } };
    const result = await readJson(req);
    assert.deepStrictEqual(result, { key: "value" });
  });

  test("parses req.body if it's a valid JSON string", async () => {
    const req = { body: '{"key": "value"}' };
    const result = await readJson(req);
    assert.deepStrictEqual(result, { key: "value" });
  });

  test("throws 400 error if req.body is an invalid JSON string", async () => {
    const req = { body: '{"key": "value"' };
    await assert.rejects(
      async () => await readJson(req),
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Request body must be valid JSON.");
        return true;
      }
    );
  });

  test("reads request as a stream, collects chunks, and parses valid JSON", async () => {
    const req = {
      async *[Symbol.asyncIterator]() {
        yield Buffer.from('{"key": ');
        yield Buffer.from('"value"}');
      }
    };
    const result = await readJson(req);
    assert.deepStrictEqual(result, { key: "value" });
  });

  test("throws 413 error if the stream exceeds the size limit", async () => {
    const req = {
      async *[Symbol.asyncIterator]() {
        yield Buffer.from('{"key": ');
        yield Buffer.from('"value"}');
      }
    };
    // The payload is 16 bytes long, so limit of 10 should trigger 413
    await assert.rejects(
      async () => await readJson(req, 10),
      (err) => {
        assert.strictEqual(err.statusCode, 413);
        assert.strictEqual(err.message, "Request body is too large.");
        return true;
      }
    );
  });

  test("throws 400 error if the stream is invalid JSON", async () => {
    const req = {
      async *[Symbol.asyncIterator]() {
        yield Buffer.from('{"key": ');
        yield Buffer.from('"value"');
      }
    };
    await assert.rejects(
      async () => await readJson(req),
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Request body must be valid JSON.");
        return true;
      }
    );
  });

  test("returns empty object if stream has no chunks", async () => {
    const req = {
      async *[Symbol.asyncIterator]() {}
    };
    const result = await readJson(req);
    assert.deepStrictEqual(result, {});
  });
});
