const test = require("node:test");
const assert = require("node:assert");
const { base64url, sign } = require("./auth.js");

test("base64url encoding", async (t) => {
  await t.test("encodes basic string correctly", () => {
    assert.strictEqual(base64url("hello world"), "aGVsbG8gd29ybGQ");
  });

  await t.test("replaces + with -", () => {
    // String containing \xfb\xef encoded in base64 is ++8=, in base64url is --8
    assert.strictEqual(base64url(Buffer.from([0xfb, 0xef])), "--8");
  });

  await t.test("replaces / with _", () => {
    // String containing \xff encoded in base64 is /w==, in base64url is _w
    assert.strictEqual(base64url(Buffer.from([0xff])), "_w");
  });

  await t.test("removes padding (=)", () => {
    // "hello" encoded in base64 is aGVsbG8=, in base64url is aGVsbG8
    assert.strictEqual(base64url("hello"), "aGVsbG8");
  });
});

test("sign function", async (t) => {
  await t.test("generates correct HMAC SHA-256 base64url digest", () => {
    const value = "test_value";
    const secret = "test_secret";

    // We can rely on built-in testing of the expected string against node crypto generated signature.
    assert.strictEqual(sign(value, secret), "NrdCs7KTvxbAO2bbehc8PH2ApBRNxKGLqSN4-6C-8kw");
  });
});
