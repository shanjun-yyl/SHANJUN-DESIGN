const root = document.documentElement;
const heroScroll = document.querySelector(".hero-scroll");
const showcaseSection = document.querySelector(".showcase-section");
const projectsReel = document.querySelector("[data-projects-reel]");
const experienceSection = document.querySelector(".experience-section");
const experienceTitle = document.querySelector(".experience-title");
const experienceItems = Array.from(document.querySelectorAll(".experience-item"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let scrollTicking = false;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const navigationEntry = performance.getEntriesByType("navigation")[0];
const shouldResetToHome = navigationEntry ? navigationEntry.type === "reload" : true;

if (shouldResetToHome && window.location.hash) {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

if (shouldResetToHome) {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHeroMotion() {
  if (!heroScroll || reduceMotion.matches) {
    return;
  }

  const rect = heroScroll.getBoundingClientRect();
  const distance = heroScroll.offsetHeight - window.innerHeight;
  const progress = clamp(Math.abs(rect.top) / distance, 0, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  root.style.setProperty("--art-rotate", `${eased * 110}deg`);
  root.style.setProperty("--art-scale", `${1 + eased * 1.1}`);
  root.style.setProperty("--art-opacity", `${clamp(1 - progress * 1.18, 0, 1)}`);

  let copyOpacity = 1;
  let copyScale = 1;

  if (showcaseSection) {
    const showcaseRect = showcaseSection.getBoundingClientRect();
    const fadeStart = -window.innerHeight * 0.2 + 240;
    const fadeEnd = -window.innerHeight * 0.38 + 220;
    copyOpacity = clamp((showcaseRect.top - fadeEnd) / (fadeStart - fadeEnd), 0, 1);
    copyScale = 0.96 + copyOpacity * 0.04;
  }

  root.style.setProperty("--hero-copy-shift-x", `0px`);
  root.style.setProperty("--hero-copy-shift-y", `0px`);
  root.style.setProperty("--hero-copy-scale", `${copyScale}`);
  root.style.setProperty("--hero-copy-opacity", `${copyOpacity}`);
}

function updateExperienceMotion() {
  if (!experienceSection || !experienceTitle || experienceItems.length === 0) {
    return;
  }

  if (reduceMotion.matches) {
    root.style.setProperty("--experience-title-shift", "0px");
    experienceItems.forEach((item) => {
      item.classList.add("is-visible", "is-active");
    });
    return;
  }

  const sectionRect = experienceSection.getBoundingClientRect();
  const sectionProgress = clamp(
    (window.innerHeight - sectionRect.top) / (window.innerHeight + sectionRect.height),
    0,
    1
  );
  const titleShift = (sectionProgress - 0.5) * -24;
  root.style.setProperty("--experience-title-shift", `${titleShift.toFixed(2)}px`);

  const focusLine = window.innerHeight * 0.38;
  let activeItem = null;
  let smallestDistance = Number.POSITIVE_INFINITY;

  experienceItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const midpoint = rect.top + rect.height * 0.42;
    const distance = Math.abs(midpoint - focusLine);
    const isVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.16;

    item.classList.toggle("is-visible", isVisible);

    if (isVisible && distance < smallestDistance) {
      smallestDistance = distance;
      activeItem = item;
    }
  });

  experienceItems.forEach((item) => {
    item.classList.toggle("is-active", item === activeItem);
  });
}

function setupProjectsReel() {
  if (!projectsReel) {
    return;
  }

  const track = projectsReel.querySelector(".projects-reel-track");
  const sourceSet = projectsReel.querySelector(".projects-reel-set");

  if (!track || !sourceSet) {
    return;
  }

  for (let i = 0; i < 2; i += 1) {
    const clone = sourceSet.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a").forEach((link) => {
      link.removeAttribute("href");
      link.setAttribute("tabindex", "-1");
    });
    track.appendChild(clone);
  }

  let setWidth = 0;
  let position = 0;
  let hasMeasured = false;
  let pointerId = null;
  let dragStartX = 0;
  let dragStartPosition = 0;
  let lastDragX = 0;
  let lastDragTime = 0;
  let velocity = 0;
  let lastFrameTime = 0;
  let isReelActive = true;
  let reelFrame = 0;
  const autoSpeed = 44;

  function wrapPosition(value) {
    if (!setWidth) {
      return value;
    }

    let next = value;

    while (next <= -setWidth) {
      next += setWidth;
    }

    while (next > 0) {
      next -= setWidth;
    }

    return next;
  }

  function applyPosition() {
    track.style.transform = `translate3d(${position}px, 0, 0)`;
  }

  function measureReel() {
    setWidth = sourceSet.getBoundingClientRect().width;

    if (!hasMeasured) {
      position = -Math.min(setWidth * 0.18, 620);
      hasMeasured = true;
    } else {
      position = wrapPosition(position);
    }

    applyPosition();
  }

  function startTicker() {
    if (reelFrame) {
      return;
    }

    reelFrame = window.requestAnimationFrame(tick);
  }

  function tick(time) {
    reelFrame = 0;

    if (!lastFrameTime) {
      lastFrameTime = time;
    }

    const delta = Math.min((time - lastFrameTime) / 1000, 0.05);
    lastFrameTime = time;

    if (isReelActive && pointerId === null) {
      position = wrapPosition(position - autoSpeed * delta + velocity * delta);
      velocity *= Math.pow(0.9, delta * 60);

      if (Math.abs(velocity) < 1) {
        velocity = 0;
      }

      applyPosition();
    }

    if (isReelActive || pointerId !== null) {
      startTicker();
    } else {
      lastFrameTime = 0;
    }
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartPosition = position;
    lastDragX = event.clientX;
    lastDragTime = performance.now();
    velocity = 0;
    projectsReel.classList.add("is-dragging");
    startTicker();

    if (projectsReel.setPointerCapture) {
      projectsReel.setPointerCapture(pointerId);
    }
  }

  function onPointerMove(event) {
    if (pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartX;
    const now = performance.now();
    const frameDelta = Math.max(now - lastDragTime, 1);

    velocity = clamp(((event.clientX - lastDragX) / frameDelta) * 1000, -1400, 1400);
    position = wrapPosition(dragStartPosition + deltaX);
    lastDragX = event.clientX;
    lastDragTime = now;
    applyPosition();
  }

  function releasePointer(event) {
    if (pointerId !== event.pointerId) {
      return;
    }

    projectsReel.classList.remove("is-dragging");

    if (projectsReel.releasePointerCapture) {
      projectsReel.releasePointerCapture(pointerId);
    }

    pointerId = null;
  }

  function handleWheel(event) {
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (!horizontalIntent && !event.shiftKey) {
      return;
    }

    event.preventDefault();
    const amount = horizontalIntent ? event.deltaX : event.deltaY;
    position = wrapPosition(position - amount);
    velocity = clamp(-amount * 8, -900, 900);
    applyPosition();
    startTicker();
  }

  sourceSet.querySelectorAll("img").forEach((image) => {
    if (!image.complete) {
      image.addEventListener("load", measureReel, { once: true });
      image.addEventListener("error", measureReel, { once: true });
    }
  });

  measureReel();
  window.addEventListener("resize", measureReel);

  if (!reduceMotion.matches) {
    if ("IntersectionObserver" in window) {
      isReelActive = false;
      const reelObserver = new IntersectionObserver((entries) => {
        isReelActive = entries.some((entry) => entry.isIntersecting);
        if (isReelActive) {
          startTicker();
        }
      }, { rootMargin: "35% 0px" });
      reelObserver.observe(projectsReel);
    }

    projectsReel.addEventListener("pointerdown", onPointerDown);
    projectsReel.addEventListener("pointermove", onPointerMove);
    projectsReel.addEventListener("pointerup", releasePointer);
    projectsReel.addEventListener("pointercancel", releasePointer);
    projectsReel.addEventListener("wheel", handleWheel, { passive: false });
    startTicker();
  } else {
    projectsReel.classList.add("is-static");
  }
}

function setupKineticMotion() {
  if (reduceMotion.matches || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  document.body.classList.add("motion-enhanced");

  const revealEase = "expo.out";
  const slowEase = "power4.out";
  const revealStart = "top 78%";

  function clearAfter(targets, props = "transform,opacity,visibility,clipPath") {
    return () => gsap.set(targets, { clearProps: props });
  }

  function revealText(targets, trigger, options = {}) {
    const elements = gsap.utils.toArray(targets);
    if (!elements.length || !trigger) return;

    gsap.set(elements, {
      autoAlpha: 0,
      yPercent: options.yPercent ?? 120,
      x: options.x ?? 0,
      scaleX: options.scaleX ?? 1.12,
      scaleY: options.scaleY ?? 0.78,
      transformOrigin: options.origin ?? "left bottom",
      clipPath: options.clipPath ?? "inset(100% 0 0 0)"
    });

    gsap.to(elements, {
      autoAlpha: 1,
      yPercent: 0,
      x: 0,
      scaleX: 1,
      scaleY: 1,
      clipPath: "inset(0% 0 0 0)",
      duration: options.duration ?? 1.45,
      stagger: options.stagger ?? 0.1,
      ease: options.ease ?? revealEase,
      scrollTrigger: options.scrollTrigger ?? {
        trigger,
        start: options.start ?? revealStart,
        once: true
      },
      onComplete: options.clear === false ? undefined : clearAfter(elements)
    });
  }

  function revealCards(targets, trigger, options = {}) {
    const elements = gsap.utils.toArray(targets);
    if (!elements.length || !trigger) return;

    gsap.set(elements, {
      autoAlpha: 0,
      y: options.y ?? 120,
      scale: options.scale ?? 0.92,
      scaleY: options.scaleY ?? 0.86,
      transformOrigin: "50% 100%",
      clipPath: options.clipPath ?? "inset(18% 0 18% 0)"
    });

    gsap.to(elements, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      scaleY: 1,
      clipPath: "inset(0% 0 0% 0)",
      duration: options.duration ?? 1.28,
      stagger: options.stagger ?? 0.08,
      ease: options.ease ?? slowEase,
      scrollTrigger: {
        trigger,
        start: options.start ?? "top 76%",
        once: true
      },
      onComplete: options.clear === false ? undefined : clearAfter(elements)
    });
  }

  gsap.from(".site-header", {
    yPercent: -120,
    autoAlpha: 0,
    duration: 1.15,
    ease: revealEase,
    delay: 0.12,
    clearProps: "transform,opacity,visibility"
  });

  gsap.set([".hero-title-image", ".hero-manifesto", ".hero-years"], {
    autoAlpha: 0,
    yPercent: 120,
    scaleY: 0.74,
    clipPath: "inset(100% 0 0 0)",
    transformOrigin: "50% 100%"
  });

  gsap.timeline({ defaults: { ease: revealEase } })
    .to(".hero-title-image", {
      autoAlpha: 1,
      yPercent: 0,
      scaleY: 1,
      clipPath: "inset(0% 0 0 0)",
      duration: 1.55,
      delay: 0.22
    })
    .to(".hero-manifesto", {
      autoAlpha: 1,
      yPercent: 0,
      scaleY: 1,
      clipPath: "inset(0% 0 0 0)",
      duration: 1.18
    }, "-=0.72")
    .to(".hero-years", {
      autoAlpha: 1,
      yPercent: 0,
      scaleY: 1,
      clipPath: "inset(0% 0 0 0)",
      duration: 0.96,
      onComplete: clearAfter([".hero-title-image", ".hero-manifesto", ".hero-years"])
    }, "-=0.66");

  revealText(".about-name-lockup", ".about-section", {
    x: -120,
    yPercent: 85,
    scaleX: 1.22,
    duration: 1.35,
    start: "top 70%"
  });
  revealText(".about-copy h2", ".about-section", {
    x: -180,
    yPercent: 120,
    scaleX: 1.32,
    scaleY: 0.72,
    duration: 1.55,
    start: "top 67%"
  });
  revealCards(".profile-portrait", ".about-section", {
    y: 160,
    scale: 0.9,
    duration: 1.45,
    start: "top 67%"
  });
  revealCards(".about-copy > p, .stat-row article", ".about-section", {
    y: 80,
    scale: 0.98,
    scaleY: 0.94,
    stagger: 0.09,
    duration: 1.1,
    start: "top 58%"
  });

  revealText(".experience-title p", ".experience-section", {
    x: -180,
    yPercent: 90,
    scaleX: 1.26,
    scaleY: 0.78,
    stagger: 0.09,
    duration: 1.35,
    start: "top 72%"
  });
  revealCards(".experience-item", ".experience-section", {
    y: 92,
    scale: 0.99,
    scaleY: 0.9,
    stagger: 0.11,
    duration: 1.18,
    start: "top 66%"
  });

  revealText(".projects-heading h2 > span", ".projects-section", {
    x: -220,
    yPercent: 110,
    scaleX: 1.32,
    scaleY: 0.72,
    stagger: 0.09,
    duration: 1.45,
    start: "top 70%"
  });
  revealCards(".projects-mark", ".projects-section", {
    y: -40,
    scale: 0.72,
    duration: 1.1,
    start: "top 70%"
  });
  revealCards(".project-reel-card", ".projects-section", {
    y: 180,
    scale: 0.82,
    scaleY: 0.78,
    stagger: 0.035,
    duration: 1.35,
    start: "top 54%"
  });

  revealCards(".wordmark-lockup", ".wordmark-section", {
    y: 120,
    scale: 1.18,
    scaleY: 0.72,
    duration: 1.45,
    start: "top 72%"
  });
  revealCards(".wordmark-section p", ".wordmark-section", {
    y: 54,
    scale: 0.98,
    scaleY: 0.92,
    duration: 1.05,
    start: "top 68%"
  });

  revealCards(".detail-gallery-card", ".detail-gallery-section", {
    y: 170,
    scale: 0.86,
    scaleY: 0.78,
    stagger: 0.1,
    duration: 1.32,
    start: "top 76%"
  });

  revealCards(".contact-panel > *", ".contact-section", {
    y: 88,
    scale: 0.96,
    scaleY: 0.88,
    stagger: 0.09,
    duration: 1.16,
    start: "top 84%"
  });

  revealCards(".site-footer > *", ".site-footer", {
    y: 80,
    scale: 0.98,
    stagger: 0.08,
    duration: 1.08,
    start: "top 86%"
  });

  gsap.utils.toArray(".profile-portrait img, .detail-gallery-card img").forEach((image) => {
    gsap.fromTo(image,
      { yPercent: -5, scale: 1.08 },
      {
        yPercent: 5,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: image.closest("figure, a, section") || image,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8
        }
      }
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

function onScroll() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    updateHeroMotion();
    updateExperienceMotion();
    scrollTicking = false;
  });
}

updateHeroMotion();
updateExperienceMotion();
setupProjectsReel();
setupKineticMotion();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  updateHeroMotion();
  updateExperienceMotion();
});
