(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("#site-nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  const billingButtons = Array.from(document.querySelectorAll("[data-billing]"));
  const priceAmounts = Array.from(document.querySelectorAll(".price-amount"));
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const yearEl = document.querySelector("[data-year]");

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        return null;
      }
    }
  };

  const prefersDark = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const setTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", nextTheme);
    storage.set("northstar-theme", nextTheme);

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  };

  const initTheme = () => {
    const savedTheme = storage.get("northstar-theme");
    setTheme(savedTheme || (prefersDark() ? "dark" : "light"));
  };

  const closeMenu = () => {
    body.classList.remove("nav-open");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
    }
  };

  const toggleMenu = () => {
    const isOpen = body.classList.toggle("nav-open");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    }
  };

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const setActiveNavLink = () => {
    if (!navLinks.length) return;

    const scrollPosition = window.scrollY + 140;
    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute("href");
        if (!id || !id.startsWith("#")) return null;
        const section = document.querySelector(id);
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    let active = sections[0];

    for (const item of sections) {
      if (item.section.offsetTop <= scrollPosition) {
        active = item;
      }
    }

    navLinks.forEach((link) => link.removeAttribute("aria-current"));

    if (active) {
      active.link.setAttribute("aria-current", "true");
    }
  };

  const initFaq = () => {
    faqItems.forEach((item) => {
      const button = item.querySelector(".faq-question");
      if (!button) return;

      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        faqItems.forEach((otherItem) => {
          const otherButton = otherItem.querySelector(".faq-question");
          otherItem.classList.remove("is-open");
          if (otherButton) {
            otherButton.setAttribute("aria-expanded", "false");
          }
        });

        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  };

  const formatPrice = (value) => {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : String(numericValue);
  };

  const setBilling = (billing) => {
    billingButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.billing === billing));
    });

    priceAmounts.forEach((amount) => {
      const value = amount.dataset[billing];
      if (value) {
        amount.textContent = formatPrice(value);
      }
    });
  };

  const initPricingToggle = () => {
    billingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setBilling(button.dataset.billing || "monthly");
      });
    });
  };

  const initRevealAnimations = () => {
    if (!revealItems.length) return;

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -64px 0px"
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
      observer.observe(item);
    });
  };

  const initAnchorBehavior = () => {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
    });
  };

  const initNavOutsideClick = () => {
    document.addEventListener("click", (event) => {
      if (!body.classList.contains("nav-open")) return;
      if (!nav || !menuButton) return;

      const clickedInsideNav = nav.contains(event.target);
      const clickedMenuButton = menuButton.contains(event.target);

      if (!clickedInsideNav && !clickedMenuButton) {
        closeMenu();
      }
    });
  };

  const initEventListeners = () => {
    if (menuButton) {
      menuButton.addEventListener("click", toggleMenu);
    }

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        setTheme(currentTheme === "dark" ? "light" : "dark");
      });
    }

    window.addEventListener("scroll", () => {
      updateHeader();
      setActiveNavLink();
    }, { passive: true });
  };

  const initYear = () => {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  };

  const init = () => {
    initTheme();
    initYear();
    updateHeader();
    setActiveNavLink();
    initFaq();
    initPricingToggle();
    initRevealAnimations();
    initAnchorBehavior();
    initNavOutsideClick();
    initEventListeners();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
