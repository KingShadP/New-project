## 2024-07-11 - Parallelize readDesign Async Calls
**Learning:** Sequential async operations that don't depend on each other (like loading default config and loading stored config) can be parallelized using Promise.all to reduce overall I/O wait time. We can maintain short-circuit evaluation in `Promise.all` by using `.then()` chains, e.g., `readBlobDesign().then(blob => blob || readLocalDesign())`.
**Action:** Always look for sequential `await` calls that don't share data dependencies and bundle them in `Promise.all` for performance optimization.
