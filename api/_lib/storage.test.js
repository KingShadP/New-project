const { test } = require("node:test");
const assert = require("node:assert");
const { sanitizeFileName } = require("./storage");

test("sanitizeFileName - undefined, null, or empty inputs", () => {
  assert.match(sanitizeFileName(), /^\d+-upload\.bin$/);
  assert.match(sanitizeFileName(null), /^\d+-upload\.bin$/);
  assert.match(sanitizeFileName(""), /^\d+-upload\.bin$/);
});

test("sanitizeFileName - basic file name with uppercase and spaces", () => {
  assert.match(sanitizeFileName("My Photo.jpg"), /^\d+-my-photo\.jpg$/);
});

test("sanitizeFileName - special characters", () => {
  assert.match(
    sanitizeFileName("image_with@special#chars!.png"),
    /^\d+-image-with-special-chars\.png$/,
  );
});

test("sanitizeFileName - trailing and leading hyphens removal", () => {
  assert.match(sanitizeFileName("---My-Photo---.jpg"), /^\d+-my-photo\.jpg$/);
});

test("sanitizeFileName - missing extension", () => {
  assert.match(sanitizeFileName("just_a_name"), /^\d+-just-a-name\.bin$/);
});

test("sanitizeFileName - path inputs", () => {
  assert.match(sanitizeFileName("/some/path/file.txt"), /^\d+-file\.txt$/);
});

test("sanitizeFileName - extreme cases", () => {
  // If base name becomes empty after replacement, it should default to upload
  assert.match(sanitizeFileName("!@#$%^&*()"), /^\d+-upload\.bin$/);
});
