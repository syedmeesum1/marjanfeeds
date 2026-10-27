/**
 * Liquid Brokers / Marjan Feeds Ultra-Luxury Hero Interaction Engine
 * - Interactive Cosmic Starfield Canvas with Twinkling Stars
 * - 3D Tilt & Parallax Physics on Glassmorphic Cards
 * - Dual Brand Mode Switcher (Liquid Brokers <-> Marjan Feeds)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCosmicStarfield();
  initGlassParallax();
  initImageSwitcher();
  initDropdownInteractions();
});

/* --------------------------------------------------------------------------
   0. Marjan Feeds Hero Image Switcher
   -------------------------------------------------------------------------- */
function initImageSwitcher() {
  const switchBtns = document.querySelectorAll('.img-switch-pill[data-img]');
  const heroImg = document.getElementById('liquid-orb-image');
  if (!switchBtns.length || !heroImg) return;

  heroImg.style.transition = 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetSrc = btn.getAttribute('data-img');
      if (targetSrc) {
        heroImg.style.opacity = '0.2';
        heroImg.style.transform = 'scale(0.98)';
        setTimeout(() => {
          heroImg.src = targetSrc;
          heroImg.onload = () => {
            heroImg.style.opacity = '1';
            heroImg.style.transform = 'scale(1)';
          };
          // Fallback if cached
          heroImg.style.opacity = '1';
          heroImg.style.transform = 'scale(1)';
        }, 150);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   1. Interactive Cosmic Starfield Canvas
   -------------------------------------------------------------------------- */
function initCosmicStarfield() {
  const canvas = document.getElementById('cosmic-starfield-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  const starCount = 110;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.4,
        baseAlpha: Math.random() * 0.45 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.12,
        driftY: (Math.random() - 0.5) * 0.12,
        depth: Math.random() * 0.8 + 0.2
      });
    }
  }

  // Track mouse coordinates for subtle parallax
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouse.targetX = (e.clientX - rect.left - width / 2) / (width / 2);
      mouse.targetY = (e.clientY - rect.top - height / 2) / (height / 2);
    }
  });

  function render(time) {
    ctx.clearRect(0, 0, width, height);

    // Smooth lerp mouse parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Twinkle calculation
      s.twinklePhase += s.twinkleSpeed;
      const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.25;
      const clampedAlpha = Math.max(0.05, Math.min(1, alpha));

      // Drift
      s.x += s.driftX;
      s.y += s.driftY;

      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;
      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;

      // Parallax offset
      const posX = s.x - mouse.x * 25 * s.depth;
      const posY = s.y - mouse.y * 20 * s.depth;

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.beginPath();
      ctx.arc(posX, posY, s.size, 0, Math.PI * 2);
      if (isDark) {
        ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
        ctx.shadowBlur = s.size > 1.4 ? 6 : 0;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      } else {
        ctx.fillStyle = `rgba(5, 150, 105, ${clampedAlpha * 0.4})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(render);
}

/* --------------------------------------------------------------------------
   2. 3D Tilt & Parallax Physics on Glassmorphic Cards
   -------------------------------------------------------------------------- */
function initGlassParallax() {
  const stage = document.getElementById('liquid-orb-stage');
  const cardLeft = document.getElementById('glass-card-left');
  const cardRight = document.getElementById('glass-card-right');

  if (!stage || !cardLeft || !cardRight) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentTiltLeft = { x: 0, y: 0 };
  let currentTiltRight = { x: 0, y: 0 };

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX = x;
    mouseY = y;
  });

  stage.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  function updateCards() {
    // Left card tilt & translation
    currentTiltLeft.x += (-mouseY * 12 - currentTiltLeft.x) * 0.08;
    currentTiltLeft.y += (mouseX * 12 - currentTiltLeft.y) * 0.08;

    cardLeft.style.transform = `perspective(800px) rotateX(${currentTiltLeft.x}deg) rotateY(${currentTiltLeft.y}deg) translateZ(10px)`;

    // Right card tilt & translation with slight phase difference
    currentTiltRight.x += (-mouseY * 14 - currentTiltRight.x) * 0.08;
    currentTiltRight.y += (mouseX * 14 - currentTiltRight.y) * 0.08;

    cardRight.style.transform = `perspective(800px) rotateX(${currentTiltRight.x}deg) rotateY(${currentTiltRight.y}deg) translateZ(12px)`;

    requestAnimationFrame(updateCards);
  }

  requestAnimationFrame(updateCards);
}

/* --------------------------------------------------------------------------
   3. Dual Brand Mode Switcher (Liquid Brokers <-> Marjan Feeds)
   -------------------------------------------------------------------------- */
const BRAND_PRESETS = {
  liquid: {
    brandName: 'Liquid Brokers',
    badge: 'PRO',
    title: 'Elevate Your<br><span class="liquid-hero-title-accent">Trading Experience</span>',
    desc: 'Unlock your trading potential in a fully regulated environment, powered by Liquid Brokers',
    cta: 'Sign Up & Trade',
    cardLeftTag: 'Trading Pairs',
    cardLeftHeading: 'Unparalleled<br>Market Access',
    cardLeftMetric: '46%',
    cardRightTag: 'Trading Pairs',
    cardRightStat: '96%',
    cardRightBar: '96%',
    switchBtnLabel: 'Marjan Feeds Mode'
  },
  marjan: {
    brandName: 'Marjan Feeds',
    badge: 'MILL ERP',
    title: 'Elevate Your<br><span class="liquid-hero-title-accent">Feed Mill Experience</span>',
    desc: 'Precision nutrition feed manufacturing for poultry & livestock in Karachi. Powered by automated weighbridge scale ERP.',
    cta: 'Explore Catalog & Trade',
    cardLeftTag: 'Feed Formulations',
    cardLeftHeading: 'High-Conversion<br>Broiler Rations',
    cardLeftMetric: '1.48 FCR',
    cardRightTag: 'Lab Verified',
    cardRightStat: '99.4%',
    cardRightBar: '99%',
    switchBtnLabel: 'Liquid Brokers Mode'
  }
};

let currentMode = 'liquid'; // Default to exact reference image look

function initBrandModeSwitcher() {
  const switchBtn = document.getElementById('brand-mode-switch');
  if (!switchBtn) return;

  const savedMode = localStorage.getItem('marjan_brand_mode') || 'liquid';
  applyBrandMode(savedMode);

  switchBtn.addEventListener('click', () => {
    const nextMode = currentMode === 'liquid' ? 'marjan' : 'liquid';
    applyBrandMode(nextMode);
    localStorage.setItem('marjan_brand_mode', nextMode);
  });
}

function applyBrandMode(mode) {
  currentMode = mode;
  const p = BRAND_PRESETS[mode] || BRAND_PRESETS.liquid;

  const brandDisplay = document.getElementById('brand-name-display');
  const brandBadge = document.getElementById('brand-sub-badge');
  const heroTitle = document.getElementById('liquid-hero-title');
  const heroDesc = document.getElementById('liquid-hero-desc');
  const heroCTA = document.getElementById('hero-cta-btn');
  const switchLabel = document.getElementById('mode-switch-label');

  const cardLeftTag = document.getElementById('card-left-tag');
  const cardLeftHeading = document.getElementById('card-left-heading');
  const cardLeftMetric = document.getElementById('card-left-metric');

  const cardRightTag = document.getElementById('card-right-tag');
  const cardRightStat = document.getElementById('card-right-stat');
  const cardRightBar = document.getElementById('card-right-bar');

  if (brandDisplay) brandDisplay.textContent = p.brandName;
  if (brandBadge) brandBadge.textContent = p.badge;
  if (heroTitle) heroTitle.innerHTML = p.title;
  if (heroDesc) heroDesc.textContent = p.desc;
  if (heroCTA) heroCTA.textContent = p.cta;
  if (switchLabel) switchLabel.textContent = p.switchBtnLabel;

  if (cardLeftTag) cardLeftTag.textContent = p.cardLeftTag;
  if (cardLeftHeading) cardLeftHeading.innerHTML = p.cardLeftHeading;
  if (cardLeftMetric) cardLeftMetric.textContent = p.cardLeftMetric;

  if (cardRightTag) cardRightTag.textContent = p.cardRightTag;
  if (cardRightStat) cardRightStat.textContent = p.cardRightStat;
  if (cardRightBar) cardRightBar.style.width = p.cardRightBar;
}

/* --------------------------------------------------------------------------
   4. Dropdown Interactions & Scroll Navigation
   -------------------------------------------------------------------------- */
function initDropdownInteractions() {
  // Smooth scroll helper for glass buttons
  window.scrollToCatalog = function() {
    const catalog = document.getElementById('feed-catalog');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
  };

  window.scrollToCalculator = function() {
    const calc = document.getElementById('fcr-calculator');
    if (calc) calc.scrollIntoView({ behavior: 'smooth' });
  };

  // Language buttons
  const langBtns = document.querySelectorAll('.dropdown-item-simple[data-lang]');
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      const langLabel = document.querySelector('.lang-btn span');
      if (langLabel) langLabel.textContent = lang.toUpperCase();
    });
  });

  // Header scroll detection for background glass saturation
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
