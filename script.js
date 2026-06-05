(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const billingToggle = document.querySelector("[data-billing-toggle]");
  const priceNodes = document.querySelectorAll("[data-price]");
  const faqItems = document.querySelectorAll(".faq-item");
  const revealNodes = document.querySelectorAll(".reveal");
  const yearNode = document.querySelector("[data-current-year]");

  const storageKeys = {
    theme: "nexaflow-theme",
    billing: "nexaflow-billing"
  };

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(storageKeys.theme);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    const isDark = theme === "dark";

    root.setAttribute("data-theme", theme);

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    }

    localStorage.setItem(storageKeys.theme, theme);
  }

  function toggleTheme() {
    const currentTheme = root.getAttribute("data-theme") || "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }

  function closeNavigation() {
    body.classList.remove("nav-open");

    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    }
  }

  function toggleNavigation() {
    const isOpen = body.classList.toggle("nav-open");

    if (navToggle) {
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    }
  }

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function setBillingCycle(isAnnual) {
    priceNodes.forEach((node) => {
      const monthlyPrice = node.getAttribute("data-monthly");
      const yearlyPrice = node.getAttribute("data-yearly");
      node.textContent = isAnnual ? yearlyPrice : monthlyPrice;
    });

    if (billingToggle) {
      billingToggle.checked = isAnnual;
    }

    localStorage.setItem(storageKeys.billing, isAnnual ? "annual" : "monthly");
  }

  function initializeFaq() {
    faqItems.forEach((item) => {
      const button = item.querySelector(".faq-question");
      if (!button) return;

      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        faqItems.forEach((otherItem) => {
          const otherButton = otherItem.querySelector(".faq-question");
          otherItem.classList.remove("is-open");
          if (otherButton) otherButton.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initializeRevealAnimations() {
    if (!revealNodes.length) return;

    if (!("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.14,
        rootMargin: "0px 0px -60px 0px"
      }
    );

    revealNodes.forEach((node, index) => {
      node.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
      observer.observe(node);
    });
  }

  function initializeAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        closeNavigation();
      });
    });
  }

  function initializeKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNavigation();
      }
    });
  }

  function initializeOutsideClick() {
    document.addEventListener("click", (event) => {
      if (!body.classList.contains("nav-open")) return;
      if (!navToggle) return;

      const nav = document.getElementById(navToggle.getAttribute("aria-controls"));
      const clickedInsideNav = nav && nav.contains(event.target);
      const clickedToggle = navToggle.contains(event.target);

      if (!clickedInsideNav && !clickedToggle) {
        closeNavigation();
      }
    });
  }

  function initializeResponsiveNav() {
    const desktopQuery = window.matchMedia("(min-width: 64rem)");

    function handleViewportChange(event) {
      if (event.matches) {
        closeNavigation();
      }
    }

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", handleViewportChange);
    } else {
      desktopQuery.addListener(handleViewportChange);
    }

    handleViewportChange(desktopQuery);
  }

  function initializeTheme() {
    setTheme(getPreferredTheme());

    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
  }

  function initializePricing() {
    const savedBilling = localStorage.getItem(storageKeys.billing);
    const isAnnual = savedBilling === "annual";

    setBillingCycle(isAnnual);

    if (billingToggle) {
      billingToggle.addEventListener("change", (event) => {
        setBillingCycle(event.target.checked);
      });
    }
  }

  function initializeHeader() {
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

  function initializeYear() {
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  function initializeNavigation() {
    if (navToggle) {
      navToggle.addEventListener("click", toggleNavigation);
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    initializeAnchorLinks();
    initializeKeyboardControls();
    initializeOutsideClick();
    initializeResponsiveNav();
  }

  function init() {
    initializeTheme();
    initializeYear();
    initializeHeader();
    initializeNavigation();
    initializePricing();
    initializeFaq();
    initializeRevealAnimations();
  }

  init();
})();
