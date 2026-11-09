## 2024-05-24 - Layout Thrashing in Synchronous Scroll Handlers
**Learning:** Mixing DOM writes (`classList.toggle`, `style.setProperty`) with DOM reads (`getBoundingClientRect`, `offsetTop`) inside a synchronous `scroll` event handler without state caching causes severe layout thrashing (forced synchronous layouts). The browser is forced to recalculate layout multiple times per frame, destroying scroll performance.
**Action:** Always wrap scroll event handlers in `requestAnimationFrame`. Crucially, cache the current state (like `currentActiveId`) and check if it has actually changed before executing expensive DOM reads/writes, to completely bypass the layout recalculation loop when the section hasn't changed.
## 2024-05-24 - Layout Thrashing inside requestAnimationFrame
**Learning:** Even when scroll handlers are wrapped in `requestAnimationFrame`, performing a DOM read (`getBoundingClientRect`) followed immediately by a DOM write (`style.setProperty`) inside a loop (like `forEach` over parallax targets) causes layout thrashing. The write dirties the layout, and the read on the next iteration forces a recalculation, destroying performance.
**Action:** Always strictly separate DOM reads from DOM writes into two separate batches (loops). Read all necessary layout information first into an array or object, and only then perform all necessary DOM writes in a second pass.

## 2024-11-09 - Cache layout metrics for scroll handlers
**Learning:** During scroll events, continuously reading layout properties like `offsetTop` or `getBoundingClientRect()` forces synchronous layouts (layout thrashing) and causes significant jank.
**Action:** When working on scroll or `requestAnimationFrame` updates, always pre-calculate and cache static layout coordinates during `init` and `resize` events. Use arithmetic with `window.scrollY` against the cached metrics rather than polling the DOM directly on every tick.
