## 2024-05-24 - Layout Thrashing in Synchronous Scroll Handlers
**Learning:** Mixing DOM writes (`classList.toggle`, `style.setProperty`) with DOM reads (`getBoundingClientRect`, `offsetTop`) inside a synchronous `scroll` event handler without state caching causes severe layout thrashing (forced synchronous layouts). The browser is forced to recalculate layout multiple times per frame, destroying scroll performance.
**Action:** Always wrap scroll event handlers in `requestAnimationFrame`. Crucially, cache the current state (like `currentActiveId`) and check if it has actually changed before executing expensive DOM reads/writes, to completely bypass the layout recalculation loop when the section hasn't changed.

## 2024-07-12 - Prevent layout thrashing on scroll events
**Learning:** During high-frequency events like scrolling, interleaving DOM reads (`getBoundingClientRect`) and DOM writes (`style.setProperty`) inside a loop causes synchronous forced reflows (layout thrashing) and drops frame rates significantly. Additionally, calculating styles for off-screen elements wastes CPU.
**Action:** When animating multiple elements on scroll, batch all DOM reads into one loop, filter out off-screen elements, save the computed values, and apply all DOM writes in a separate subsequent loop.
