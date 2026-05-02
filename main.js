// main.js — CO-SYNCHRO scroll animations & interactions
import { CONTENT } from './data.js';
import { initScene, destroyScene } from './three-scene.js';

/* ============================================================
   DOM Rendering
   ============================================================ */

function renderNav() {
  const d = CONTENT.nav;
  document.querySelector('.logo span').textContent = d.logo;
  const navEl = document.querySelector('nav');
  navEl.innerHTML = d.links
    .map(l => `<a href="${l.href}">${l.label}</a>`)
    .join('');
  document.querySelector('.header-cta').textContent = d.cta;
}

function renderHero() {
  const d = CONTENT.hero;
  document.querySelector('.hero-eyebrow').textContent = d.label;
  document.querySelector('#hero h1').textContent      = d.heading;
  document.querySelector('.hero-sub').textContent     = d.subheading;
  document.querySelector('.hero-cta-primary').textContent   = d.cta_primary;
  document.querySelector('.hero-cta-secondary').textContent = d.cta_secondary;
}

function renderProblem() {
  const d = CONTENT.problem;
  document.querySelector('#problem .section-label').textContent = d.label;
  document.querySelector('#problem h2').textContent             = d.heading;
  const grid = document.querySelector('.problem-cards');
  grid.innerHTML = d.cards.map((c, i) => `
    <div class="problem-card" style="transition-delay:${i * 0.12}s">
      <div class="card-stat">${c.stat}<span>${c.unit}</span></div>
      <h3>${c.title}</h3>
      <p>${c.body}</p>
    </div>
  `).join('');
}

function renderSolution() {
  const d = CONTENT.solution;
  document.querySelector('#solution .section-label').textContent = d.label;
  document.querySelector('#solution h2').textContent             = d.heading;
  document.querySelector('#solution .solution-body').textContent = d.body;
}

function renderHowItWorks() {
  const d = CONTENT.howItWorks;
  document.querySelector('#how-it-works .section-label').textContent = d.label;
  document.querySelector('#how-it-works h2').textContent             = d.heading;

  const visuals = [
    `<div class="step-mini-phones">
      <div class="mini-phone scanning"></div>
      <div class="mini-phone scanning2"></div>
    </div>`,
    `<div class="step-cards-anim">
      <div class="mini-card"></div>
      <div class="mini-card"></div>
      <div class="mini-card"></div>
    </div>`,
    `<div class="step-chat-anim">
      <div class="chat-bubble"></div>
      <div class="chat-bubble"></div>
      <div class="chat-bubble"></div>
    </div>`,
  ];

  const grid = document.querySelector('.steps-grid');
  grid.innerHTML = d.steps.map((s, i) => `
    <div class="step-card" style="transition-delay:${i * 0.15}s">
      <div class="step-number">${s.number}</div>
      <h3>${s.title}</h3>
      <p>${s.body}</p>
      <div class="step-visual">${visuals[i]}</div>
    </div>
  `).join('');
}

function renderUseCases() {
  const d = CONTENT.useCases;
  document.querySelector('#use-cases .section-label').textContent = d.label;
  document.querySelector('#use-cases h2').textContent             = d.heading;

  const icons = [
    // Airplane
    `<svg class="use-case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16l-9-5V3a2 2 0 0 0-4 0v8L3 16l1 2 8-2.5V21l-2 1.5V24l3-1 3 1v-2.5L14 20v-4.5L22 18l-1-2z"/>
    </svg>`,
    // Factory
    `<svg class="use-case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="8" width="20" height="14" rx="1"/>
      <path d="M6 8V4M12 8V4M18 8V4M2 14h20M7 18h2M15 18h2"/>
    </svg>`,
    // Handshake
    `<svg class="use-case-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 11l3 3 8-8"/>
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
    </svg>`,
  ];

  const grid = document.querySelector('.use-cases-grid');
  grid.innerHTML = d.cards.map((c, i) => `
    <div class="use-case-card" style="transition-delay:${i * 0.12}s">
      ${icons[i]}
      <h3>${c.title}</h3>
      <p>${c.body}</p>
    </div>
  `).join('');
}

function renderMetrics() {
  const d = CONTENT.metrics;
  document.querySelector('#metrics .section-label').textContent = d.label;
  document.querySelector('#metrics h2').textContent             = d.heading;

  const grid = document.querySelector('.metrics-grid');
  grid.innerHTML = d.items.map((item, i) => `
    <div class="metric-item" style="transition-delay:${i * 0.1}s" data-value="${item.value}" data-display="${item.display}">
      <span class="metric-value" data-count="false">
        0<span class="metric-suffix">${item.suffix}</span>
      </span>
      <p class="metric-label">${item.label}</p>
    </div>
  `).join('');
}

function renderCTA() {
  const d = CONTENT.cta;
  document.querySelector('#cta .section-label').textContent = d.label;
  document.querySelector('#cta h2').textContent             = d.heading;
  document.querySelector('#cta .cta-body').textContent      = d.body;
  document.querySelector('#cta .btn-cta-large').textContent = d.cta;
}

function renderFooter() {
  const d = CONTENT.footer;
  document.querySelector('.footer-copy').innerHTML =
    `${d.copy}<br>${d.author}`;
}

/* ============================================================
   Scroll Animations
   ============================================================ */

function setupScrollObserver() {
  const targets = document.querySelectorAll(
    '.problem-card, .step-card, .use-case-card, .metric-item, .fade-in'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   Metric Count-Up
   ============================================================ */

function animateCount(el, target, display) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';

  const suffix = el.querySelector('.metric-suffix').outerHTML;
  const isLarge = display.includes('万') || display.includes('億');
  const duration = 2000;
  const start = performance.now();

  if (isLarge) {
    // Just reveal with a typewriter effect for formatted values
    let frame = 0;
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const total = 30;
    const tick = () => {
      if (frame >= total) {
        el.innerHTML = display + suffix;
        return;
      }
      const rand = chars[Math.floor(Math.random() * chars.length)];
      el.innerHTML = rand + suffix;
      frame++;
      setTimeout(tick, duration / total);
    };
    tick();
    return;
  }

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const val = Math.round(easeOut(progress) * target);
    el.innerHTML = val + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.innerHTML = display + suffix;
  };
  requestAnimationFrame(step);
}

function setupMetricCountUp() {
  const items = document.querySelectorAll('.metric-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const value   = parseInt(el.dataset.value, 10);
        const display = el.dataset.display;
        const valEl   = el.querySelector('.metric-value');
        animateCount(valEl, value, display);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  items.forEach(el => observer.observe(el));
}

/* ============================================================
   Scan Demo Animation
   ============================================================ */

function setupScanDemo() {
  const demo = document.querySelector('.scan-demo');
  if (!demo) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        demo.classList.add('scanning');
      } else {
        demo.classList.remove('scanning');
      }
    });
  }, { threshold: 0.4 });

  observer.observe(demo);

  // Animate phone gap with CSS variable
  let closing = true;
  let progress = 0;

  function tickGap() {
    const phoneA = demo.querySelector('.phone-a');
    const phoneB = demo.querySelector('.phone-b');
    if (!phoneA || !phoneB) return;

    if (closing) {
      progress += 0.005;
      if (progress >= 1) { closing = false; }
    } else {
      progress -= 0.003;
      if (progress <= 0) { closing = true; }
    }

    const gap = 80 - progress * 72;
    demo.style.gap = `${gap}px`;
    requestAnimationFrame(tickGap);
  }

  tickGap();
}

/* ============================================================
   Header scroll effect
   ============================================================ */

function setupHeader() {
  const header = document.getElementById('site-header');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ============================================================
   Hero entry animation
   ============================================================ */

function triggerHeroEntry() {
  // Use requestAnimationFrame to ensure paint before class add
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const content = document.querySelector('.hero-content');
      if (content) content.classList.add('visible');
    });
  });
}

/* ============================================================
   Three.js init (desktop only)
   ============================================================ */

function setupThreeJS() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const canvas   = document.getElementById('hero-canvas');
  const fallback = document.querySelector('.hero-fallback-bg');

  if (isMobile || !canvas) {
    if (fallback) fallback.style.display = 'block';
    return;
  }

  import('./three-scene.js').then(mod => {
    try {
      mod.initScene(canvas);
    } catch (err) {
      console.info('WebGL unavailable, using CSS fallback.');
      if (fallback) fallback.style.display = 'block';
    }
  }).catch(() => {
    if (fallback) fallback.style.display = 'block';
  });
}

/* ============================================================
   Boot
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderHero();
  renderProblem();
  renderSolution();
  renderHowItWorks();
  renderUseCases();
  renderMetrics();
  renderCTA();
  renderFooter();

  setupHeader();
  triggerHeroEntry();
  setupThreeJS();

  // Observers run after render
  requestAnimationFrame(() => {
    setupScrollObserver();
    setupMetricCountUp();
    setupScanDemo();
  });
});
