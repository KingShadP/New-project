## 2024-07-08 - Layout Thrashing in Scroll Handlers
**Learning:** Performing synchronous DOM measurements like `offsetTop`, `getBoundingClientRect`, and `window.scrollY` directly inside a `scroll` event listener causes layout thrashing and blocks the main thread, resulting in poor scroll performance.
**Action:** Always wrap DOM measurements inside `scroll` event handlers within a `requestAnimationFrame` block to ensure they only execute once per frame, improving performance and avoiding unnecessary layout recalculations.
