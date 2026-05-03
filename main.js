import { CONTENT } from "./data.js";
import { initScene, destroyScene } from "./three-scene.js";

const iconMap = {
  language: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h9"/><path d="M9 3v2c0 4.4-1.8 8-5 10"/><path d="M5 9c1.1 2.5 3 4.5 6 6"/><path d="M14 21l1.2-3h4.6l1.2 3"/><path d="M16 14l1.5-4 1.5 4"/></svg>`,
  person: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/><path d="M18.5 8.5l2 2 2-3"/></svg>`,
  yen: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4l6 8 6-8"/><path d="M12 12v8"/><path d="M8 13h8"/><path d="M8 17h8"/></svg>`,
  plane: `<svg class="use-case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16l-9-5V4a2 2 0 0 0-4 0v7l-7 5 1 2 6-2v4l-2 1.5V23l4-1 4 1v-1.5L13 20v-4l8 2 1-2z"/></svg>`,
  building: `<svg class="use-case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 8h2a2 2 0 0 1 2 2v11"/><path d="M8 7h4M8 11h4M8 15h4M9 21v-3h2v3"/></svg>`,
  handshake: `<svg class="use-case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11l3 3a2 2 0 0 0 3 0l1-1"/><path d="M8 12l-2 2a2 2 0 0 0 0 3l2 2a2 2 0 0 0 3 0l1-1"/><path d="M14 13l2 2a2 2 0 0 0 3 0l1-1"/><path d="M2 12l5-5 3 3"/><path d="M22 12l-5-5-4 4"/></svg>`,
};

function qs(selector) {
  return document.querySelector(selector);
}

function setText(selector, value) {
  const el = qs(selector);
  if (el) el.textContent = value;
}

function renderContent() {
  const { nav, hero, problem, solution, howItWorks, useCases, metrics, cta, footer } = CONTENT;

  setText(".brand span", nav.logo);
  qs(".site-nav").innerHTML = nav.links.map((item) => `<a href="${item.href}">${item.label}</a>`).join("");
  setText(".header-cta", nav.cta);

  setText(".hero-eyebrow", hero.label);
  setText("#hero-title", hero.heading);
  setText(".hero-sub", hero.subheading);
  setText(".hero-cta-primary", hero.cta_primary);
  setText(".hero-cta-secondary", hero.cta_secondary);

  setText("#problem .section-kicker", problem.label);
  setText("#problem-title", problem.heading);
  qs(".problem-cards").innerHTML = problem.cards.map((card, index) => `
    <article class="glass-card reveal" style="transition-delay: ${index * 90}ms">
      ${iconMap[card.icon] || ""}
      <h3>${card.title}</h3>
      <p>${card.body}</p>
    </article>
  `).join("");

  setText("#solution .section-kicker", solution.label);
  setText("#solution-title", solution.heading);
  setText(".solution-body", solution.body);

  setText("#how-it-works .section-kicker", howItWorks.label);
  setText("#how-title", howItWorks.heading);
  qs(".steps-grid").innerHTML = howItWorks.steps.map((step, index) => `
    <article class="step-card reveal" style="transition-delay: ${index * 100}ms">
      <div class="step-number">${step.number}</div>
      <h3>${step.title}</h3>
      <p>${step.body}</p>
      <div class="step-visual">${stepVisual(index)}</div>
    </article>
  `).join("");

  setText("#use-cases .section-kicker", useCases.label);
  setText("#use-title", useCases.heading);
  qs(".use-cases-grid").innerHTML = useCases.cards.map((card, index) => `
    <article class="glass-card reveal" style="transition-delay: ${index * 90}ms">
      ${iconMap[card.icon] || ""}
      <h3>${card.title}</h3>
      <p>${card.body}</p>
    </article>
  `).join("");

  setText("#data .section-kicker", metrics.label);
  setText("#data-title", metrics.heading);
  qs(".metrics-grid").innerHTML = metrics.items.map((item, index) => `
    <article class="metric-item reveal" data-value="${item.value}" data-display="${item.display}" data-suffix="${item.suffix}" style="transition-delay: ${index * 80}ms">
      <span class="metric-value">0<span class="metric-suffix">${item.suffix}</span></span>
      <p class="metric-label">${item.label}</p>
    </article>
  `).join("");

  setText("#cta .section-kicker", cta.label);
  setText("#cta-title", cta.heading);
  setText(".cta-body", cta.body);
  setText(".btn-cta-large", cta.cta);
  qs(".footer-copy").innerHTML = `${footer.copy}<br>${footer.author}`;
}

function stepVisual(index) {
  if (index === 0) {
    return `<div class="step-mini-phones"><div class="mini-phone scanning"></div><div class="mini-phone scanning2"></div></div>`;
  }
  if (index === 1) {
    return `<div class="step-cards-anim"><div class="mini-card"></div><div class="mini-card"></div><div class="mini-card"></div></div>`;
  }
  return `<div class="step-chat-anim"><div class="chat-bubble"></div><div class="chat-bubble"></div><div class="chat-bubble"></div></div>`;
}

function setupHeader() {
  const header = qs("#site-header");
  const update = () => header.classList.toggle("scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function setupMetrics() {
  const items = document.querySelectorAll(".metric-item");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countMetric(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  items.forEach((item) => observer.observe(item));
}

function countMetric(item) {
  if (item.dataset.counted === "true") return;
  item.dataset.counted = "true";

  const target = Number(item.dataset.value);
  const display = item.dataset.display;
  const suffix = item.dataset.suffix;
  const valueEl = item.querySelector(".metric-value");
  const started = performance.now();
  const duration = 1800;
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  function frame(now) {
    const progress = Math.min((now - started) / duration, 1);
    const current = Math.round(target * easeOutQuart(progress));
    valueEl.innerHTML = `${current.toLocaleString("en-US")}<span class="metric-suffix">${suffix}</span>`;
    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      valueEl.innerHTML = `${display}<span class="metric-suffix">${suffix}</span>`;
    }
  }

  requestAnimationFrame(frame);
}

function setupGsap() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.fromTo(".hero-copy > *", {
    y: 26,
    opacity: 0,
  }, {
    y: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out",
    delay: 0.12,
  });

  gsap.to(".scan-demo", {
    "--scan-gap": "18px",
    ease: "none",
    scrollTrigger: {
      trigger: "#solution",
      start: "top 70%",
      end: "bottom 30%",
      scrub: true,
      onUpdate: ({ progress }) => qs(".scan-demo").classList.toggle("scanning", progress > 0.66),
    },
  });

  gsap.to(".steps-progress", {
    "--steps-progress": "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "#how-it-works",
      start: "top 60%",
      end: "bottom 40%",
      scrub: true,
    },
  });

  ScrollTrigger.create({
    trigger: "#how-it-works",
    start: "top top",
    end: "+=520",
    pin: ".steps-wrap",
    pinSpacing: true,
    anticipatePin: 1,
  });
}

function setupThree() {
  const canvas = qs("#hero-canvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  if (!canvas || reduceMotion || isMobile) return;

  try {
    initScene(canvas);
  } catch (error) {
    destroyScene();
    canvas.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderContent();
  setupHeader();
  setupThree();
  setupReveal();
  setupMetrics();
  setupGsap();

  requestAnimationFrame(() => {
    qs(".hero-copy").classList.add("visible");
  });
});
