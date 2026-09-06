// WEBCORE ANIMATION SYSTEM
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  function addAtmosphere() {
    const rotator = document.createElement("div");
    rotator.className = "wc-bg-rotator";
    const layerA = document.createElement("div");
    const layerB = document.createElement("div");
    layerA.className = "wc-bg-layer";
    layerB.className = "wc-bg-layer";
    const wash = document.createElement("div");
    wash.className = "wc-bg-wash";
    rotator.append(layerA, layerB, wash);
    document.body.prepend(rotator);

    const spotlight = document.createElement("div");
    spotlight.className = "wc-spotlight";
    const particles = document.createElement("div");
    particles.className = "wc-particles";
    document.body.prepend(spotlight, particles);

    const images = window.WEBCORE_BACKGROUND_IMAGES
      .map((file) => new URL(`./webichan_images/${file}`, document.baseURI).href);
    let active = 0;
    const layers = [layerA, layerB];
    const show = () => {
      const next = (active + 1 + Math.floor(Math.random() * Math.max(images.length - 1, 1))) % images.length;
      const layer = layers[next % 2];
      layer.style.backgroundImage = `url("${images[next]}")`;
      layer.classList.add("is-active");
      layers[active % 2].classList.remove("is-active");
      active = next;
    };
    layerA.style.backgroundImage = `url("${images[0]}")`;
    layerA.classList.add("is-active");
    if (images.length > 1) window.setInterval(show, 9000);
  }

  function addEntrance() {
    const elements = document.querySelectorAll(".hero > *");
    elements.forEach((element, index) => {
      element.classList.add("wc-entrance");
      element.style.setProperty("--wc-delay", `${Math.min(index * 70, 560)}ms`);
    });
  }

  function addSpotlight() {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    window.addEventListener("pointermove", (event) => {
      root.style.setProperty("--wc-mx", `${event.clientX}px`);
      root.style.setProperty("--wc-my", `${event.clientY}px`);
    }, { passive: true });
  }

  function addCardTilt() {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    document.addEventListener("pointermove", (event) => {
      const card = event.target.closest?.(".preview-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.classList.add("wc-tilting");
      card.style.setProperty("--card-x", `${(x + .5) * 100}%`);
      card.style.setProperty("--card-y", `${(y + .5) * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${y * -2.2}deg) rotateY(${x * 2.8}deg) translateY(-5px) scale(1.008)`;
    }, { passive: true });
    document.addEventListener("pointerout", (event) => {
      const card = event.target.closest?.(".preview-card");
      if (!card || card.contains(event.relatedTarget)) return;
      card.classList.remove("wc-tilting");
      card.style.transform = "";
    }, { passive: true });
  }

  function observeReveals() {
    if (!("IntersectionObserver" in window)) return;
    const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        reveal.unobserve(entry.target);
      }
    }), { threshold: .12 });
    const addReveal = (element, index = 0) => {
      element.classList.add("wc-scroll-reveal");
      element.style.setProperty("--wc-reveal-delay", `${Math.min(index * 80, 320)}ms`);
      reveal.observe(element);
    };
    document.querySelectorAll(".work, .library, .section-head, .section-title, .description, .preview-card, .library-inner, .footer, .wc-carousel-section, .wc-carousel-heading").forEach((element, index) => addReveal(element, index));
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.matches(".preview-card, .wc-carousel-card")) addReveal(node, [...node.parentElement.children].indexOf(node));
    })));
    const grids = document.querySelectorAll("#previewGrid, .wc-carousel-track");
    grids.forEach((grid) => mutations.observe(grid, { childList: true }));
    const revealNearby = () => document.querySelectorAll(".wc-scroll-reveal:not(.is-visible)").forEach((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight + 160 && bounds.bottom > -160) {
        element.classList.add("is-visible");
        reveal.unobserve(element);
      }
    });
    window.addEventListener("scroll", revealNearby, { passive: true });
    window.setTimeout(revealNearby, 700);
  }

  function observeText() {
    if (!("IntersectionObserver" in window)) return;
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: .15 });
    const register = (element, index = 0) => {
      if (seen.has(element)) return;
      seen.add(element);
      element.classList.add("wc-text-fade");
      element.style.setProperty("--wc-text-delay", `${Math.min(index * 45, 240)}ms`);
      observer.observe(element);
    };
    document.querySelectorAll(".wordmark, .hero-copy, .wc-carousel-title, .wc-carousel-subtitle, .wc-carousel-name, .wc-carousel-type, .library-title, .library-label").forEach((element, index) => register(element, index));
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches(".wc-carousel-name, .wc-carousel-type")) register(node);
      node.querySelectorAll?.(".wc-carousel-name, .wc-carousel-type").forEach((element) => register(element));
    })));
    mutations.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    addAtmosphere();
    addEntrance();
    addSpotlight();
    addCardTilt();
    observeReveals();
    observeText();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
