## 2024-07-11 - parseCookies optimization
**Learning:** Replaced chained array methods (split, map, filter) with a single `reduce` loop for cookie parsing to avoid intermediate memory allocations and loop overhead.
**Action:** When encountering heavy chained array methods over small strings that are executed frequently (like headers/cookies parsing), consider refactoring them into `reduce` loops or direct string operations, but ensure to explicitly replicate quirky legacy behavior (like negative slice indices) if any.
