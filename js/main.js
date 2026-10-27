// Marjan Feeds - Karachi | Master Application Script
// Engineered with UI/UX Pro Max Rules: Accessible Modals, Debounced Search, Zero Emojis (SVG Only), Clipboard Feedback

let activeModalTrigger = null;

document.addEventListener('DOMContentLoaded', () => {
  renderProductCards('all', '');
  initCatalogFilters();
  initCatalogSearch();
  initCounters();
  initProposalModal();
  initQuoteModal();
  initNutritionModal();
  initMobileNav();
  initScrollHeader();
  initPhoneCopyHandlers();
  initKeyboardEscapeHandler();
  initThemeToggle();
  if (typeof initFcrCalculator === 'function') initFcrCalculator();
});

// Render Product Cards with Dynamic Lucide SVG Icons
function renderProductCards(filterCategory = 'all', searchQuery = '') {
  const container = document.getElementById('catalog-grid');
  if (!container || typeof feedCatalog === 'undefined') return;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = feedCatalog.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = !normalizedQuery || 
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.tag.toLowerCase().includes(normalizedQuery) ||
      item.protein.toLowerCase().includes(normalizedQuery) ||
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md);">
        <span class="ui-icon text-muted" style="width: 48px; height: 48px; margin-bottom: 12px;">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <h4 style="font-size: 18px; margin-bottom: 6px;">No Feed Products Found</h4>
        <p class="text-muted" style="font-size: 13px;">No formulations match "${searchQuery}". Try searching "Broiler", "22%", or "Wanda".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <article class="product-card" data-category="${item.category}" data-id="${item.id}">
      <div class="card-image-wrap">
        <img src="${item.image}" alt="${item.title}" width="600" height="450" loading="lazy" decoding="async">
        <span class="card-badge">${item.badge}</span>
        <span class="card-code font-mono">${item.code}</span>
      </div>
      <div class="card-content">
        <div class="card-tag">${item.tag}</div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.description}</p>
        
        <div class="nutrition-pill-grid">
          <div class="nutri-pill">
            <span class="np-label">Crude Protein</span>
            <span class="np-val font-mono highlight">${item.protein}</span>
          </div>
          <div class="nutri-pill">
            <span class="np-label">Energy</span>
            <span class="np-val font-mono">${item.energy}</span>
          </div>
          <div class="nutri-pill">
            <span class="np-label">Crude Fiber</span>
            <span class="np-val font-mono">${item.fiber}</span>
          </div>
          <div class="nutri-pill">
            <span class="np-label">Pellet Form</span>
            <span class="np-val">${item.form.split(' ')[0]}</span>
          </div>
        </div>

        <ul class="benefits-mini-list">
          ${item.benefits.slice(0, 2).map(b => `
            <li>
              <span class="ui-icon text-emerald" style="width: 14px; height: 14px;">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
              <span>${b}</span>
            </li>
          `).join('')}
        </ul>

        <div class="card-actions">
          <button class="btn btn-sm btn-outline view-nutri-btn" data-id="${item.id}" aria-label="View nutritional lab specification for ${item.title}">
            <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg></span>
            <span>View Lab Spec</span>
          </button>
          <button class="btn btn-sm btn-primary quote-btn" data-name="${item.title}" aria-label="Request wholesale price for ${item.title}">
            <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline></svg></span>
            <span>Bulk Price</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Attach card event listeners
  container.querySelectorAll('.view-nutri-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeModalTrigger = btn;
      const id = btn.getAttribute('data-id');
      const product = feedCatalog.find(p => p.id === id);
      if (product) openNutritionModal(product);
    });
  });

  container.querySelectorAll('.quote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeModalTrigger = btn;
      const productName = btn.getAttribute('data-name');
      openQuoteModal(productName);
    });
  });

  // Card 3D tilt micro-interaction
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', handleCardTilt);
    card.addEventListener('mouseleave', resetCardTilt);
  });
}

function handleCardTilt(e) {
  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -4;
  const rotateY = ((x - centerX) / centerX) * 4;

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
}

function resetCardTilt(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
}

// Category Tabs
let currentCategoryFilter = 'all';

function initCatalogFilters() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.getAttribute('data-filter');
      const searchInput = document.getElementById('product-search-input');
      const q = searchInput ? searchInput.value : '';
      renderProductCards(currentCategoryFilter, q);
    });
  });
}

// Instant Debounced Product Search
function initCatalogSearch() {
  const searchInput = document.getElementById('product-search-input');
  if (!searchInput) return;

  let debounceTimer = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderProductCards(currentCategoryFilter, e.target.value);
    }, 180);
  });
}

// Animated Stat Counters
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  let hasAnimated = false;

  function startCounting() {
    if (hasAnimated) return;
    hasAnimated = true;
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const decimals = counter.getAttribute('data-decimals') ? parseInt(counter.getAttribute('data-decimals')) : 0;
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      let count = 0;
      const duration = 1600;
      const stepTime = 25;
      const steps = duration / stepTime;
      const increment = target / steps;

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          count = target;
          clearInterval(timer);
        }
        counter.innerText = prefix + (decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()) + suffix;
      }, stepTime);
    });
  }

  const statsSection = document.querySelector('.hero-stats-strip');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounting();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(statsSection);

    // Fallback: if already in view on load
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      startCounting();
    }
  }
}

// Nutrition Specification Modal
function initNutritionModal() {
  let modal = document.getElementById('nutrition-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'nutrition-modal';
    modal.className = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }
}

function openNutritionModal(item) {
  const modal = document.getElementById('nutrition-modal');
  if (!modal) return;

  const analysisRows = Object.entries(item.guaranteedAnalysis).map(([k, v]) => `
    <div class="analysis-row">
      <span class="param-name">${k}</span>
      <span class="param-val font-mono">${v}</span>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeNutritionModal()"></div>
    <div class="modal-dialog scale-in modal-wide" role="document">
      <div class="modal-header">
        <div>
          <span class="badge-tag font-mono">${item.code}</span>
          <h3 class="modal-title-text" style="margin-top: 4px;">${item.title}</h3>
          <p class="text-muted" style="font-size: 12px;">Certified Laboratory Specification & Feeding Guide</p>
        </div>
        <button class="modal-close" onclick="closeNutritionModal()" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="nutri-modal-grid">
          <div class="nutri-col">
            <h4 style="font-size: 14px; text-transform: uppercase; color: var(--color-primary); margin-bottom: 10px;">Guaranteed Chemical Analysis</h4>
            <div class="analysis-box">
              ${analysisRows}
            </div>
            <div class="lab-stamp">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="ui-icon text-emerald" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span>Tested via In-House NIR Spectrometry</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="ui-icon text-emerald" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                <span>ISO 9001:2015 & HACCP Mill Compliance</span>
              </div>
            </div>
          </div>
          <div class="nutri-col">
            <h4 style="font-size: 14px; text-transform: uppercase; color: var(--color-accent); margin-bottom: 10px;">Key Formulation Benefits</h4>
            <ul class="benefits-full-list">
              ${item.benefits.map(b => `
                <li style="display: flex; gap: 8px;">
                  <span class="ui-icon text-emerald" style="width: 14px; height: 14px; margin-top: 3px;"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                  <span>${b}</span>
                </li>
              `).join('')}
            </ul>

            <h4 style="font-size: 14px; text-transform: uppercase; color: var(--text-main); margin-top: 20px; margin-bottom: 8px;">Feed Form & Packaging</h4>
            <div class="spec-detail-box">
              <p><strong>Physical Pellet Form:</strong> ${item.form}</p>
              <p><strong>Standard Bag Size:</strong> ${item.packaging}</p>
              <p><strong>Target Animal Stage:</strong> ${item.recommendedFor}</p>
              <p><strong>Feed Mill Origin:</strong> Plot 45/4, Sector 12-D, North Karachi Industrial Area</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.print()">
          <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></span>
          <span>Print Spec Sheet</span>
        </button>
        <button class="btn btn-primary" onclick="openQuoteModal('${item.title}'); closeNutritionModal();">
          Request Dealer Quotation
        </button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function closeNutritionModal() {
  const modal = document.getElementById('nutrition-modal');
  if (modal) modal.classList.remove('active');
  if (activeModalTrigger) { activeModalTrigger.focus(); activeModalTrigger = null; }
}

// Quote Modal
function initQuoteModal() {
  let modal = document.getElementById('quote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quote-modal';
    modal.className = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }
}

function openQuoteModal(defaultProductName = '') {
  const modal = document.getElementById('quote-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeQuoteModal()"></div>
    <div class="modal-dialog scale-in" role="document">
      <div class="modal-header">
        <div>
          <h3>Request Factory-Direct Feed Quotation</h3>
          <p class="text-muted" style="font-size: 12px;">Bulk Dealer Pricing & Delivery Schedules Across Sindh & Balochistan</p>
        </div>
        <button class="modal-close" onclick="closeQuoteModal()" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="quote-order-form" onsubmit="handleQuoteSubmit(event)">
          <div class="form-group">
            <label for="quote-farm-name">Business / Farm Name</label>
            <input type="text" id="quote-farm-name" class="form-input" required placeholder="e.g. Al-Razi Poultry Farm / Karachi Cattle Traders" autocomplete="organization">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="quote-contact-person">Contact Person</label>
              <input type="text" id="quote-contact-person" class="form-input" required placeholder="Full Name" autocomplete="name">
            </div>
            <div class="form-group">
              <label for="quote-phone">Phone / WhatsApp</label>
              <input type="tel" id="quote-phone" class="form-input font-mono" required placeholder="03XX-XXXXXXX" autocomplete="tel">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="quote-product-select">Feed Product Required</label>
              <select class="form-input" id="quote-product-select">
                <option value="Broiler Starter" ${defaultProductName.includes('Starter') ? 'selected' : ''}>Broiler Starter Feed (MF-BS-101)</option>
                <option value="Broiler Grower" ${defaultProductName.includes('Grower') ? 'selected' : ''}>Broiler Grower Feed (MF-BG-202)</option>
                <option value="Broiler Finisher" ${defaultProductName.includes('Finisher') ? 'selected' : ''}>Broiler Finisher Feed (MF-BF-303)</option>
                <option value="Layer Mash" ${defaultProductName.includes('Layer') ? 'selected' : ''}>Commercial Layer Mash (MF-LM-401)</option>
                <option value="Dairy Wanda 22%" ${defaultProductName.includes('Dairy') ? 'selected' : ''}>Super Dairy Wanda 22% (MF-DW-501)</option>
                <option value="Cattle Fattening" ${defaultProductName.includes('Fattening') ? 'selected' : ''}>Cattle Fattening Wanda (MF-CF-602)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="quote-bags">Order Volume (Bags)</label>
              <input type="number" class="form-input font-mono" id="quote-bags" value="200" min="50" step="50">
            </div>
          </div>
          <div class="form-group">
            <label for="quote-destination">Delivery Destination / Farm Location</label>
            <input type="text" id="quote-destination" class="form-input" required placeholder="e.g. Hub Chowki, Super Highway M-9, Gadap, Thatta, Hyderabad">
          </div>
          <div class="direct-call-hint">
            <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
            <span>Direct Mill Order Desk:</span> 
            <a href="tel:+922136980967" class="font-mono text-emerald font-bold">+92 21 36980967</a>
            <span class="text-muted">(PTCL Landline — Call Only)</span>
          </div>
          <div class="modal-footer pt-3">
            <button type="button" class="btn btn-outline" onclick="closeQuoteModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></span>
              <span>Submit Inquiry & Get Quotation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function handleQuoteSubmit(e) {
  e.preventDefault();
  closeQuoteModal();
  showToast("Inquiry submitted! Marjan Feeds dispatch office will contact you with dealer wholesale rates.");
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
  if (activeModalTrigger) { activeModalTrigger.focus(); activeModalTrigger = null; }
}

// Proposal Viewer Modal (Techmire Team Proposal for Marjan Feeds)
function initProposalModal() {
  const openBtns = document.querySelectorAll('.open-proposal-btn');
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeModalTrigger = btn;
      openProposalModal();
    });
  });
}

function openProposalModal() {
  let modal = document.getElementById('proposal-doc-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'proposal-doc-modal';
    modal.className = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeProposalModal()"></div>
    <div class="modal-dialog modal-proposal scale-in" role="document">
      <div class="modal-header">
        <div class="proposal-title-bar">
          <span class="badge-mini badge-credit">OFFICIAL PROPOSAL DOCUMENT</span>
          <h3 style="margin-top: 6px;">Marjan Feeds (Karachi) — Corporate Feed Catalog Website & Mill ERP Proposal</h3>
          <p class="text-muted" style="font-size: 12px;">Prepared by: <strong>Techmire Team</strong> | For Approval: <strong>Marjan Feeds Management</strong></p>
        </div>
        <button class="modal-close" onclick="closeProposalModal()" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body modal-scroll-body">
        <div class="proposal-content">
          <div class="proposal-alert">
            <strong>Mohtaram Client / Management:</strong> Yeh proposal Marjan Feeds (Karachi) ke liye ek mukammal digital solution (Corporate Feed Catalog Website + Desktop Feed Mill Raw-Material, Weighbridge & Dealer Ledger ERP) ke hawale se tayyar kiya gaya hai.
          </div>

          <div class="prop-section">
            <h4 style="font-size: 15px; margin-bottom: 8px;">1. Verified Business Profile & Contact Details</h4>
            <table class="proposal-table">
              <tr><td><strong>Business Name</strong></td><td>Marjan Feeds</td></tr>
              <tr><td><strong>Core Specialization</strong></td><td>Poultry & Livestock Feed Mill</td></tr>
              <tr><td><strong>Location / Address</strong></td><td>Plot 45/4, Sector 12-D, North Karachi Industrial Area, Karachi, Pakistan</td></tr>
              <tr><td><strong>Contact Numbers</strong></td><td class="font-mono">+92 21 36980967 (PTCL Landline — Call Only)</td></tr>
              <tr><td><strong>Rating & Online Presence</strong></td><td>4.2 ★ (80 Reviews) | Listed on enic.pk directory only</td></tr>
            </table>
          </div>

          <div class="prop-section" style="margin-top: 24px;">
            <h4 style="font-size: 15px; margin-bottom: 8px;">2. Proposed Digital Ecosystem & Architecture</h4>
            <div class="ecosystem-blocks">
              <div class="eco-box">
                <span class="eco-num font-mono">01</span>
                <h5>Corporate Feed Catalog Website</h5>
                <p>Professional digital platform showcasing poultry and livestock feed products, nutritional formulas, quality lab standards, and bulk dealer inquiries.</p>
              </div>
              <div class="eco-box">
                <span class="eco-num font-mono">02</span>
                <h5>Weighbridge & Raw-Material Integration</h5>
                <p>Automated software module connecting factory weighbridge scales for precise truck tare/gross weight recording and raw material inventory tracking.</p>
              </div>
              <div class="eco-box">
                <span class="eco-num font-mono">03</span>
                <h5>Dealer Ledger & Financial ERP (Khata)</h5>
                <p>Comprehensive desktop module managing dealer accounts, credit limits, supply orders, and payment records.</p>
              </div>
            </div>
          </div>

          <div class="prop-section" style="margin-top: 24px;">
            <h4 style="font-size: 15px; margin-bottom: 8px;">3. Technology Stack & Development Plan</h4>
            <ul class="tech-spec-list">
              <li><strong>Frontend & Web:</strong> Next.js (App Router) with Tailwind CSS / Vanilla CSS for high-performance catalog display and mobile responsiveness.</li>
              <li><strong>Backend & ERP Core:</strong> Node.js & Express.js REST APIs connected with PostgreSQL and Prisma ORM for robust weighbridge logs and dealer ledger management.</li>
              <li><strong>Desktop Integration:</strong> Electron.js / local server integration for factory weighbridge scales and gate operations.</li>
            </ul>
          </div>

          <div class="prop-sign-box">
            <h4 style="font-size: 15px; margin-bottom: 4px;">4. Project Sign-Off & Client Approval</h4>
            <p class="text-muted" style="font-size: 13px;">Aapki manzoori ke baad Marjan Feeds ke is feed mill ERP aur website ka development kaam shuru kiya jayega.</p>
            <div class="sign-columns">
              <div class="sign-column">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim);">Prepared By:</div>
                <div class="sign-stamp stamp-green font-mono">
                  <span>TECHMIRE TEAM</span>
                  <small style="font-weight: normal; font-size: 11px;">Industrial Software Architecture</small>
                </div>
              </div>
              <div class="sign-column">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim);">Approved By (Management):</div>
                <div class="sign-stamp stamp-gold font-mono">
                  <span>MARJAN FEEDS, KARACHI</span>
                  <small style="font-weight: normal; font-size: 11px;">North Karachi Industrial Area</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.print()">
          <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></span>
          <span>Print Proposal</span>
        </button>
        <button class="btn btn-primary" onclick="closeProposalModal()">Close Document</button>
      </div>
    </div>
  `;
  modal.classList.add('active');
}

function closeProposalModal() {
  const modal = document.getElementById('proposal-doc-modal');
  if (modal) modal.classList.remove('active');
  if (activeModalTrigger) { activeModalTrigger.focus(); activeModalTrigger = null; }
}

// Copy Phone Number Handler
function initPhoneCopyHandlers() {
  const copyNav = document.getElementById('copy-phone-nav');
  const copyFooter = document.getElementById('copy-phone-footer');

  const copyAction = (btn) => {
    const phone = "+92 21 36980967";
    navigator.clipboard.writeText(phone).then(() => {
      showToast("PTCL Number +92 21 36980967 copied to clipboard!");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <span class="ui-icon text-emerald" style="width: 14px; height: 14px;">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </span>
      `;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 2000);
    });
  };

  if (copyNav) copyNav.addEventListener('click', () => copyAction(copyNav));
  if (copyFooter) copyFooter.addEventListener('click', () => copyAction(copyFooter));
}

// Keyboard ESC to Close Modals (UI/UX Pro Max A11y Requirement)
function initKeyboardEscapeHandler() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNutritionModal();
      closeQuoteModal();
      closeProposalModal();
      if (typeof closeSlipModal === 'function') closeSlipModal();
    }
  });
}

// Navigation & Header Scroll
function initScrollHeader() {
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-btn') || document.querySelector('.mobile-menu-toggle');
  const navMenu = document.getElementById('main-nav-links') || document.querySelector('.nav-links');
  const backdrop = document.getElementById('nav-drawer-backdrop');

  function closeMenu() {
    if (navMenu) navMenu.classList.remove('open');
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('nav-drawer-open');
  }

  function openMenu() {
    if (navMenu) navMenu.classList.add('open');
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('nav-drawer-open');
  }

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    navMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }
}

// Theme Toggle (Light Default / Dark Switcher)
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const iconWrap = document.getElementById('theme-icon');
  if (!toggleBtn || !iconWrap) return;

  const sunSVG = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonSVG = `<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;

  // Default to clean crisp light mode across whole website as requested
  localStorage.setItem('marjan_theme', 'light');
  document.documentElement.removeAttribute('data-theme');
  iconWrap.innerHTML = moonSVG;

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('marjan_theme', 'light');
      iconWrap.innerHTML = moonSVG;
      showToast('Switched to Clean Light Mode');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('marjan_theme', 'dark');
      iconWrap.innerHTML = sunSVG;
      showToast('Switched to Dark Mode');
    }
  });
}

