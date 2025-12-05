// Footer year
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// ===== Typewriter Animation =====
(() => {
  const paragraph = document.getElementById('typewriter-paragraph');
  if (!paragraph) return;

  const TYPING_SPEED = 35; // ms per character
  const text = paragraph.dataset.text;
  let hasStarted = false;

  function typeText() {
    let index = 0;
    paragraph.textContent = '';
    
    // Add cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    
    function type() {
      if (index < text.length) {
        paragraph.textContent = text.substring(0, index + 1);
        paragraph.appendChild(cursor);
        index++;
        setTimeout(type, TYPING_SPEED);
      } else {
        // Keep cursor blinking at the end
        paragraph.appendChild(cursor);
      }
    }
    
    type();
  }

  // Start typewriter when section is in view
  const storySection = document.getElementById('story');
  if (storySection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true;
          typeText();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(storySection);
  }
})();

// ===== Sliding Panel System =====
// Handles both content panels (in the grid) and side panels (Index/Info)

(() => {
  const overlay = document.querySelector(".panel-overlay");
  const contentPanels = document.querySelectorAll(".panel");
  const slidePanels = document.querySelectorAll(".slide-panel");
  const navLinks = document.querySelectorAll(".nav-link[data-panel]");

  let activePanel = null;
  let activeSidePanel = null;

  // ===== Content Panel Interactions =====
  
  function openPanel(panel) {
    if (activePanel === panel) return;
    
    // Close any previously open panel
    closeAllPanels();
    
    activePanel = panel;
    panel.classList.add("is-expanded");
    overlay.classList.add("is-active");
    
    // Prevent body scroll when panel is open
    document.body.style.overflow = "hidden";
  }

  function closePanel(panel) {
    if (!panel) return;
    
    panel.classList.remove("is-expanded");
    activePanel = null;
    
    // Only remove overlay if no side panels are open
    if (!activeSidePanel) {
      overlay.classList.remove("is-active");
      document.body.style.overflow = "";
    }
  }

  function closeAllPanels() {
    contentPanels.forEach(panel => {
      panel.classList.remove("is-expanded");
    });
    activePanel = null;
  }

  // Attach click handlers to content panels
  contentPanels.forEach(panel => {
    // Click on panel preview to expand
    panel.addEventListener("click", (e) => {
      // Don't trigger if clicking the close button
      if (e.target.classList.contains("panel__close-btn")) return;
      
      if (!panel.classList.contains("is-expanded")) {
        openPanel(panel);
      }
    });

    // Close button inside expanded view
    const closeBtn = panel.querySelector(".panel__close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closePanel(panel);
      });
    }
  });

  // ===== Side Panel Interactions (Index/Info) =====

  function openSidePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // Close any open side panel first
    closeSidePanels();

    activeSidePanel = panel;
    panel.classList.add("is-open");
    overlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeSidePanels() {
    slidePanels.forEach(panel => {
      panel.classList.remove("is-open");
    });
    activeSidePanel = null;

    // Only remove overlay if no content panels are open
    if (!activePanel) {
      overlay.classList.remove("is-active");
      document.body.style.overflow = "";
    }
  }

  // Nav link click handlers
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const panelId = link.getAttribute("data-panel");
      
      // Toggle behavior - if clicking same panel, close it
      if (activeSidePanel && activeSidePanel.id === panelId) {
        closeSidePanels();
      } else {
        openSidePanel(panelId);
      }
    });
  });

  // Close buttons on side panels
  slidePanels.forEach(panel => {
    const closeBtn = panel.querySelector(".slide-panel__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeSidePanels();
      });
    }

    // Close side panel when clicking a nav link inside it
    const links = panel.querySelectorAll(".slide-panel__link");
    links.forEach(link => {
      link.addEventListener("click", () => {
        closeSidePanels();
      });
    });
  });

  // ===== Overlay Click to Close =====
  
  overlay.addEventListener("click", () => {
    closeAllPanels();
    closeSidePanels();
    overlay.classList.remove("is-active");
    document.body.style.overflow = "";
  });

  // ===== Escape Key to Close =====
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (activeSidePanel) {
        closeSidePanels();
      }
      if (activePanel) {
        closePanel(activePanel);
      }
      overlay.classList.remove("is-active");
      document.body.style.overflow = "";
    }
  });

  // ===== Touch Support for Mobile =====
  
  let touchStartX = 0;
  let touchStartY = 0;

  slidePanels.forEach(panel => {
    panel.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    panel.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Swipe right to close (for right-side panels)
      if (deltaX > 50 && deltaY < 50 && panel.classList.contains("slide-panel--right")) {
        closeSidePanels();
      }
      
      // Swipe left to close (for left-side panels)
      if (deltaX < -50 && deltaY < 50 && panel.classList.contains("slide-panel--left")) {
        closeSidePanels();
      }
    }, { passive: true });
  });

})();

// ===== Smooth Scroll for Anchor Links =====

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});
