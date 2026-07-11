const fs = require('fs');

// We will test the parallax update function
const originalUpdate = `
    parallaxTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const progressValue = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const depth = Number(target.dataset.depth || 18) * intensity;
      const offset = Math.max(-Math.abs(depth), Math.min(Math.abs(depth), progressValue * -depth));
      target.style.setProperty("--parallax-y", `${offset}px`);
    });
`;
