// Footer year
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// Tooltip logic inspired by the Cargo tooltip system:
// - Delayed show
// - Hides on pointer leave
// - Positions relative to hovered element

(() => {
  const tooltipEl = document.getElementById("tooltip");
  const tooltipInner = tooltipEl?.querySelector(".tooltip-inner");

  if (!tooltipEl || !tooltipInner) return;

  let hideTimeout = null;
  let showTimeout = null;
  let activeTarget = null;

  const SHOW_DELAY = 450; // ms, adjust like Cargo's delay logic
  const OFFSET = 10; // px

  function showTooltip(target, event) {
    if (!target) return;

    const html = target.getAttribute("data-tooltip");
    if (!html) return;

    tooltipInner.innerHTML = html;

    // Basic positioning: center above element, fall back below if needed
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let y = rect.top - tooltipRect.height - OFFSET;

    // If tooltip would go off top, place under
    if (y < 8) {
      y = rect.bottom + OFFSET;
    }

    // Clamp within viewport horizontally
    const margin = 8;
    if (x < margin) x = margin;
    if (x + tooltipRect.width > viewportWidth - margin) {
      x = viewportWidth - tooltipRect.width - margin;
    }

    // If still off screen bottom, pull it back up a bit
    if (y + tooltipRect.height > viewportHeight - margin) {
      y = viewportHeight - tooltipRect.height - margin;
    }

    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y}px`;

    tooltipEl.classList.add("visible");
  }

  function scheduleShow(target, event) {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    activeTarget = target;

    showTimeout = setTimeout(() => {
      // Measure after content is set to better simulate the Cargo behavior
      tooltipEl.classList.add("visible");
      // Recompute layout right after CSS makes it visible
      requestAnimationFrame(() => {
        tooltipEl.classList.remove("visible");
        showTooltip(target, event);
      });
    }, SHOW_DELAY);
  }

  function hideTooltip() {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      tooltipEl.classList.remove("visible");
      activeTarget = null;
    }, 80);
  }

  // Attach events to elements with data-tooltip
  function attachTooltipHandlers() {
    const tooltipTargets = document.querySelectorAll(".has-tooltip");

    tooltipTargets.forEach((el) => {
      el.addEventListener("pointerenter", (e) => {
        scheduleShow(el, e);
      });

      el.addEventListener("pointerleave", () => {
        hideTooltip();
      });

      // If clicked, we can optionally hide the tooltip
      el.addEventListener("mousedown", () => {
        hideTooltip();
      });
    });
  }

  attachTooltipHandlers();

  // Optional: hide tooltip on scroll or resize to avoid weird positioning
  window.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize", hideTooltip);
})();
