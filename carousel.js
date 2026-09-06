// WEBCORE EXPERIMENT CAROUSEL
(() => {
  const section = document.getElementById("experimentCarousel");
  if (!section) return;
  const viewport = section.querySelector(".wc-carousel-viewport");
  const track = section.querySelector(".wc-carousel-track");
  const previousButton = section.querySelector("[data-carousel-previous]");
  const nextButton = section.querySelector("[data-carousel-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let files = [];
  let offset = 0;
  let setWidth = 0;
  let direction = 1;
  let pauseUntil = 0;
  let dragging = false;
  let dragged = false;
  let suppressClick = false;
  let dragStart = 0;
  let dragOffset = 0;

  const readableName = (file) => file.split("/").pop().replace(/\.html?$/i, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const openFile = (file) => { const url = new URL(file, document.baseURI).href; console.log("Opening HTML experiment:", url); window.open(url, "_blank"); };
  const pause = () => { pauseUntil = performance.now() + 3200; };
  const normalize = () => { if (!setWidth) return; offset = ((offset % setWidth) + setWidth) % setWidth; };
  const updateTrack = () => { normalize(); track.style.transform = `translate3d(${-setWidth + offset}px,0,0)`; };
  const updateFocus = () => {
    const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    const cards = [...track.querySelectorAll(".wc-carousel-card")];
    let closestCard = null;
    let closestDistance = Infinity;
    cards.forEach((card) => {
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - center);
      if (distance < closestDistance) { closestDistance = distance; closestCard = card; }
    });
    cards.forEach((card) => card.classList.toggle("is-focused", card === closestCard));
  };
  const refreshMeasurements = () => {
    const firstSet = [...track.children].slice(0, files.length);
    if (!firstSet.length) return;
    const first = firstSet[0].getBoundingClientRect();
    const last = firstSet[firstSet.length - 1].getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    setWidth = last.right - first.left + gap;
    updateTrack();
    requestAnimationFrame(updateFocus);
  };
  const createCard = (file) => {
    const card = document.createElement("article");
    card.className = "wc-carousel-card";
    card.dataset.htmlFile = file;
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Open ${readableName(file)} HTML experiment`);
    const preview = document.createElement("div"); preview.className = "wc-carousel-preview";
    const loader = document.createElement("div"); loader.className = "wc-carousel-loader";
    const frame = document.createElement("iframe"); frame.loading = "lazy"; frame.title = `Live preview of ${file}`; frame.sandbox = "allow-scripts allow-same-origin allow-forms allow-modals"; frame.src = new URL(file, document.baseURI).href; frame.style.pointerEvents = "none";
    frame.addEventListener("load", () => { loader.classList.add("is-hidden"); frame.classList.add("is-loaded"); }, { once: true });
    const info = document.createElement("div"); info.className = "wc-carousel-info";
    const name = document.createElement("span"); name.className = "wc-carousel-name"; name.textContent = readableName(file);
    const type = document.createElement("span"); type.className = "wc-carousel-type"; type.textContent = "HTML EXPERIMENT";
    info.append(name, type); preview.append(loader, frame); card.append(preview, info);
    const open = (event) => { if (dragged) { dragged = false; return; } if (suppressClick) { suppressClick = false; return; } if (event) event.preventDefault(); openFile(file); };
    card.addEventListener("click", open); card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(event); } });
    return card;
  };
  const render = () => {
    track.replaceChildren();
    if (!files.length) { section.querySelector(".wc-carousel-empty").hidden = false; return; }
    section.querySelector(".wc-carousel-empty").hidden = true;
    [...files, ...files, ...files].forEach((file) => track.append(createCard(file)));
    refreshMeasurements();
    window.setTimeout(() => { refreshMeasurements(); updateFocus(); }, 120);
  };
  const move = (distance) => { pause(); offset += distance; updateTrack(); updateFocus(); };
  let lastFocusUpdate = 0;
  const tick = (time) => { if (!reducedMotion && !dragging && time > pauseUntil) { offset += .22 * direction; updateTrack(); } if (time - lastFocusUpdate > 160) { updateFocus(); lastFocusUpdate = time; } requestAnimationFrame(tick); };
  previousButton.addEventListener("click", () => move(-setWidth / Math.max(files.length, 1)));
  nextButton.addEventListener("click", () => move(setWidth / Math.max(files.length, 1)));
  viewport.addEventListener("wheel", (event) => { if (Math.abs(event.deltaX) + Math.abs(event.deltaY) < 2) return; event.preventDefault(); move((event.deltaX || event.deltaY) * .7); }, { passive: false });
  viewport.addEventListener("pointerdown", (event) => { dragging = true; dragged = false; dragStart = event.clientX; dragOffset = offset; pause(); viewport.classList.add("is-dragging"); viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener("pointermove", (event) => { if (!dragging) return; if (Math.abs(event.clientX - dragStart) > 6) dragged = true; offset = dragOffset + dragStart - event.clientX; updateTrack(); updateFocus(); });
  const endDrag = (event) => { if (event?.pointerId != null && viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId); if (!dragged && event) { const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".wc-carousel-card"); if (target?.dataset.htmlFile) { suppressClick = true; openFile(target.dataset.htmlFile); } } const wasDragged = dragged; dragging = false; viewport.classList.remove("is-dragging"); if (wasDragged) window.setTimeout(() => { dragged = false; }, 0); };
  viewport.addEventListener("pointerup", endDrag); viewport.addEventListener("pointercancel", endDrag); viewport.addEventListener("pointerleave", () => { if (dragging) endDrag(); });
  new ResizeObserver(refreshMeasurements).observe(viewport);
  files = [
    "Digital_portfolio_library_ai_made/Capilot/pos.html",
    "Digital_portfolio_library_ai_made/Capilot/profile.html",
    "Digital_portfolio_library_ai_made/Claude/marc-namacpacan-portfolio.html",
    "Digital_portfolio_library_ai_made/Deepseek/Digital_profile/profile.html",
    "Digital_portfolio_library_ai_made/Deepseek/pos.html",
    "Digital_portfolio_library_ai_made/Gemini/profile.html",
    "Digital_portfolio_library_ai_made/glm5.3/pos.html",
    "Digital_portfolio_library_ai_made/Huggingface/pos.html",
    "Digital_portfolio_library_ai_made/Huggingface/profile.html",
    "Digital_portfolio_library_ai_made/kimi/pos.html",
    "Digital_portfolio_library_ai_made/Qwen/pos.html",
    "Digital_portfolio_library_ai_made/Qwen/profile.html",
    "Digital_portfolio_library_ai_made/Replit/profile.html",
    "Digital_portfolio_library_ai_made/Vibe/pos.html",
    "Digital_portfolio_library_ai_made/Vibe/profile.html",
    "example2.html",
    "Normal.hTml",
    "poster01.html",
    "profile2.html",
    "supreme.html",
    "supremeplus.html",
    "web3d.html"
  ];
  render();
  requestAnimationFrame(tick);
})();
