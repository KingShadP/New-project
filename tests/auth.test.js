const test = require("node:test");
const assert = require("node:assert");
const { parseCookies } = require("../api/_lib/auth.js");

test("parseCookies", async (t) => {
  await t.test("handles missing cookie header", () => {
    const req = { headers: {} };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, {});
  });

  await t.test("handles empty cookie header", () => {
    const req = { headers: { cookie: "" } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, {});
  });

  await t.test("parses a single cookie", () => {
    const req = { headers: { cookie: "ksp_admin_session=test_value" } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, { ksp_admin_session: "test_value" });
  });

  await t.test("parses multiple cookies", () => {
    const req = { headers: { cookie: "ksp_admin_session=test_value; foo=bar" } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, { ksp_admin_session: "test_value", foo: "bar" });
  });

  await t.test("handles leading/trailing whitespace around semicolons", () => {
    const req = { headers: { cookie: " a=1 ; b=2 ;c=3 " } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, { a: "1", b: "2", c: "3" });
  });

  await t.test("decodes URL encoded keys and values", () => {
    const req = { headers: { cookie: "my%20key=my%20value%3D" } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, { "my key": "my value=" });
  });

  await t.test("handles multiple equal signs in value", () => {
    const req = { headers: { cookie: "key=value1=value2" } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, { key: "value1=value2" });
  });

  await t.test("ignores empty parts between semicolons", () => {
    const req = { headers: { cookie: "a=1;;b=2; ;c=3" } };
    const cookies = parseCookies(req);
    assert.deepStrictEqual(cookies, { a: "1", b: "2", c: "3" });
  });
});
