import assert from "node:assert/strict";
import { getInternalIDFromURL } from "./tag.js";

// The scheme and the fragment are dropped, so both URLs share one tag
assert.equal(
  getInternalIDFromURL("https://example.com/docs/intro?v=2#section-3"),
  getInternalIDFromURL("http://example.com/docs/intro?v=2"),
);
assert.equal(
  getInternalIDFromURL("https://example.com/docs/intro?v=2#section-3"),
  "example.com//docs/intro?v=2",
);

// The query string distinguishes two pages
assert.notEqual(
  getInternalIDFromURL("https://example.com/search?q=a"),
  getInternalIDFromURL("https://example.com/search?q=b"),
);

console.log("tag.js ✓");
