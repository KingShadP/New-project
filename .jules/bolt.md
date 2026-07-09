
## 2024-05-16 - Scroll Event Layout Thrashing
**Learning:** Found an anti-pattern in script.js where setupNavState and setupHeader were executing synchronous layout reads and writes on every unthrottled scroll event, causing layout thrashing.
**Action:** Always throttle scroll event listeners using requestAnimationFrame and cache state variables to minimize redundant DOM operations.
