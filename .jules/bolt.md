## 2024-07-04 - [Scroll Event Throttling]
**Learning:** Scroll events can easily cause performance bottlenecks by reading layout properties (`offsetTop`, `getBoundingClientRect`) directly inside the event listener.
**Action:** Use `requestAnimationFrame` to debounce scroll events, and cache static layout properties on load and resize to prevent forced synchronous layouts during scrolling.
