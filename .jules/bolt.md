## 2024-06-25 - Prevent Layout Thrashing in Vanilla JS Scroll Handlers
**Learning:** Vanilla JavaScript applications with multiple scroll listeners doing direct DOM manipulations (reads interspersed with writes) cause severe layout thrashing. This is especially prevalent in operations like parallax or navigation state updates on scroll.
**Action:** Group all DOM reads (e.g., `getBoundingClientRect`, `offsetTop`, `window.scrollY`), group all DOM writes (e.g., `style.setProperty`, `classList.toggle`), and throttle the update cycle using `requestAnimationFrame`.
