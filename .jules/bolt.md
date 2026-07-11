## 2024-06-25 - Single-pass loop optimization for cart calculation
**Learning:** Combining multiple `Array.prototype.reduce` array traversals into a single standard `for` loop significantly improves performance for basic numeric calculations, completing the operations in one pass while avoiding callback overhead.
**Action:** When calculating multiple aggregates (like total quantity and total price) from the same array, always perform all calculations in a single loop traversal rather than chaining multiple functional array methods.
