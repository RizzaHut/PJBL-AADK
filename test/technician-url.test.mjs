import assert from "node:assert/strict";
import { test } from "node:test";
import {
  galatUrlBukti,
  tandaTanganGambarSesuaiMime,
} from "../src/lib/validasi.ts";

test("accepts HTTPS evidence links", () => {
  assert.equal(galatUrlBukti(" https://drive.google.com/file/d/example "), "");
  assert.equal(galatUrlBukti("https://portfolio.example/path?view=work#repair"), "");
});

test("rejects links that are unsafe or malformed", () => {
  for (const url of [
    "",
    "not-a-url",
    "http://portfolio.example",
    "javascript:alert(1)",
    "https://user:password@portfolio.example",
    `https://portfolio.example/${"a".repeat(2048)}`,
  ]) {
    assert.notEqual(galatUrlBukti(url), "", `Expected ${url.slice(0, 40)} to be rejected`);
  }
});

test("validates the image signature against the declared MIME type", () => {
  assert.equal(
    tandaTanganGambarSesuaiMime(
      "image/png",
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    true,
  );
  assert.equal(
    tandaTanganGambarSesuaiMime(
      "image/png",
      new TextEncoder().encode('<svg version="1.1">'),
    ),
    false,
  );
  assert.equal(
    tandaTanganGambarSesuaiMime(
      "image/webp",
      Uint8Array.from([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
        0x50,
      ]),
    ),
    true,
  );
});
