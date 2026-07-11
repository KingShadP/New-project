## 2024-05-18 - Caching element dimensions to avoid layout thrashing during scroll events
**Learning:** Querying element spatial properties like `getBoundingClientRect()` within a high-frequency scroll event handler causes forced synchronous layout (layout thrashing), which degrades performance significantly.
**Action:** Extract the queries into a setup/resize function. Cache values like relative offset, height, and computed depth into an array of objects. In the scroll event handler, only reference the cached values combined with the fast-to-read `window.scrollY` to apply transforms/offsets.
