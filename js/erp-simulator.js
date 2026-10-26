// Marjan Feeds - Karachi | Interactive Mill ERP & Weighbridge Simulator
// Demonstrates proposed Digital Ecosystem (Weighbridge Scale, Raw Material Silos & Dealer Ledger)
// Upgraded with UI/UX Pro Max SVG icons, accessible modals and tabular numeral formatting

const weighbridgeScenarios = [
  {
    type: "INWARD RAW MATERIAL",
    material: "Punjab Grade-A Yellow Maize",
    supplier: "Agro Harvest Traders (Chichawatni)",
    truckNo: "TKX-8492 (10 Wheeler Bedford)",
    driver: "M. Rafiq Baloch",
    grossWeight: 44580,
    tareWeight: 18320,
    netPayload: 26260,
    moisture: "13.4%",
    proteinContent: "9.2%",
    status: "PASSED / UNLOAD READY",
    silo: "Silo #3 (Corn Silo - 1,200 MT)",
    ticketNo: "WB-2026-90412"
  },
  {
    type: "INWARD RAW MATERIAL",
    material: "Imported High-Protein Soybean Meal (46%)",
    supplier: "Sindh Feed Importers Ltd, Port Qasim",
    truckNo: "KHI-4109 (Trailer Flatbed)",
    driver: "Ghulam Murtaza",
    grossWeight: 38940,
    tareWeight: 14200,
    netPayload: 24740,
    moisture: "11.8%",
    proteinContent: "46.4%",
    status: "LAB CERTIFIED",
    silo: "Silo #2 (Soymeal Silo - 800 MT)",
    ticketNo: "WB-2026-90413"
  },
  {
    type: "OUTWARD FINISHED FEED",
    material: "Marjan Broiler Finisher (MF-BF-303)",
    supplier: "Marjan Feeds Factory Dispatch",
    truckNo: "LSE-6320 (Hino 500 Freight)",
    driver: "Zulfiqar Ali",
    grossWeight: 32800,
    tareWeight: 12300,
    netPayload: 20500,
    moisture: "10.5%",
    proteinContent: "19.2%",
    status: "DISPATCH CLEARED (410 Bags)",
    silo: "Finished Goods Bay #2",
    ticketNo: "WB-2026-90414"
  }
];

const dealerLedgers = {
  "dealer-1": {
    name: "Al-Madina Poultry Farms & Hatcheries",
    zone: "Hub River Road / Gadap, Sindh",
    ntn: "7849201-4",
    creditLimit: 5000000,
    currentBalance: 1845000,
    availableCredit: 3155000,
    status: "Good Standing",
    rating: "Tier-1 Gold Dealer",
    transactions: [
      { date: "24 Oct 2026", type: "Dispatch Challan", ref: "DC-8841", desc: "400 Bags Broiler Starter (MF-BS-101)", debit: 1880000, credit: 0, balance: 2845000 },
      { date: "21 Oct 2026", type: "Bank Transfer", ref: "HBL-TXN-902", desc: "Cheque Clearing HBL North Karachi", debit: 0, credit: 1000000, balance: 965000 },
      { date: "16 Oct 2026", type: "Dispatch Challan", ref: "DC-8790", desc: "350 Bags Broiler Grower (MF-BG-202)", debit: 1575000, credit: 0, balance: 1965000 },
      { date: "10 Oct 2026", type: "Cash Deposit", ref: "REC-4102", desc: "Factory Cash Counter Receipt", debit: 0, credit: 800000, balance: 390000 }
    ]
  },
  "dealer-2": {
    name: "Bismillah Dairy & Cattle Colony",
    zone: "Plot 120, Bhains Colony, Landhi Karachi",
    ntn: "6510923-2",
    creditLimit: 3500000,
    currentBalance: 980000,
    availableCredit: 2520000,
    status: "Good Standing",
    rating: "Priority Dairy Client",
    transactions: [
      { date: "25 Oct 2026", type: "Dispatch Challan", ref: "DC-8850", desc: "250 Bags Super Dairy Wanda 22%", debit: 1075000, credit: 0, balance: 980000 },
      { date: "19 Oct 2026", type: "Online Transfer", ref: "MCB-9481", desc: "Interbank Online Fund Transfer", debit: 0, credit: 850000, balance: -95000 },
      { date: "12 Oct 2026", type: "Dispatch Challan", ref: "DC-8742", desc: "200 Bags Dairy Wanda 22%", debit: 860000, credit: 0, balance: 755000 }
    ]
  },
  "dealer-3": {
    name: "Rehman Broiler Feeds & Trading",
    zone: "Auto Bhan Road, Hyderabad & Kotri",
    ntn: "4190823-1",
    creditLimit: 7500000,
    currentBalance: 4210000,
    availableCredit: 3290000,
    status: "Review - Payment Due in 4 Days",
    rating: "Bulk Regional Distributor",
    transactions: [
      { date: "23 Oct 2026", type: "Dispatch Challan", ref: "DC-8835", desc: "800 Bags Broiler Finisher (MF-BF-303)", debit: 3600000, credit: 0, balance: 4210000 },
      { date: "18 Oct 2026", type: "Pay Order", ref: "UBL-PO-331", desc: "Pay Order Submission UBL Industrial Area", debit: 0, credit: 2500000, balance: 610000 },
      { date: "11 Oct 2026", type: "Dispatch Challan", ref: "DC-8730", desc: "600 Bags Broiler Grower (MF-BG-202)", debit: 2700000, credit: 0, balance: 3110000 }
    ]
  }
};

let currentScenarioIdx = 0;
let currentWeightAnimTimer = null;

function initErpSimulator() {
  renderWeighbridgeData(weighbridgeScenarios[currentScenarioIdx]);
  renderDealerLedger("dealer-1");

  // Tab switching with WCAG ARIA synchronization
  const tabs = document.querySelectorAll('.erp-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetId = tab.getAttribute('data-target');
      document.querySelectorAll('.erp-panel').forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(targetId);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // Scenario Buttons
  const scenarioBtns = document.querySelectorAll('.wb-scenario-btn');
  scenarioBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScenarioIdx = idx;
      simulateScaleWeighing(weighbridgeScenarios[idx]);
    });
  });

  // Capture Button
  const captureBtn = document.getElementById('capture-weight-btn');
  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      const activeData = weighbridgeScenarios[currentScenarioIdx];
      simulateScaleWeighing(activeData);
      showToast("Scale weight synchronized with PostgreSQL ERP database!");
    });
  }

  // Print Slip Button
  const printBtn = document.getElementById('print-slip-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      openWeighbridgeSlipModal(weighbridgeScenarios[currentScenarioIdx]);
    });
  }

  // Dealer Selector
  const dealerSelect = document.getElementById('dealer-select');
  if (dealerSelect) {
    dealerSelect.addEventListener('change', (e) => {
      renderDealerLedger(e.target.value);
    });
  }

  // Add Transaction Simulator
  const addTxnBtn = document.getElementById('simulate-payment-btn');
  if (addTxnBtn) {
    addTxnBtn.addEventListener('click', () => {
      simulateDealerPayment();
    });
  }
}

function simulateScaleWeighing(data) {
  const displayLed = document.getElementById('wb-main-led');
  if (!displayLed) return;

  displayLed.classList.add('led-pulse');

  let currentVal = 0;
  const targetGross = data.grossWeight;
  const steps = 25;
  const increment = Math.round(targetGross / steps);

  if (currentWeightAnimTimer) clearInterval(currentWeightAnimTimer);

  currentWeightAnimTimer = setInterval(() => {
    currentVal += increment;
    if (currentVal >= targetGross) {
      currentVal = targetGross;
      clearInterval(currentWeightAnimTimer);
      displayLed.classList.remove('led-pulse');
      renderWeighbridgeData(data);
    }
    displayLed.innerText = currentVal.toLocaleString('en-US') + " KG";
  }, 30);
}

function renderWeighbridgeData(data) {
  const grossEl = document.getElementById('wb-gross-val');
  const tareEl = document.getElementById('wb-tare-val');
  const netEl = document.getElementById('wb-net-val');
  const displayLed = document.getElementById('wb-main-led');
  const truckEl = document.getElementById('wb-truck-no');
  const materialEl = document.getElementById('wb-material');
  const supplierEl = document.getElementById('wb-supplier');
  const moistureEl = document.getElementById('wb-moisture');
  const siloEl = document.getElementById('wb-silo');
  const ticketEl = document.getElementById('wb-ticket-no');
  const statusEl = document.getElementById('wb-status');

  if (displayLed) displayLed.innerText = data.grossWeight.toLocaleString('en-US') + " KG";
  if (grossEl) grossEl.innerText = data.grossWeight.toLocaleString('en-US') + " kg";
  if (tareEl) tareEl.innerText = data.tareWeight.toLocaleString('en-US') + " kg";
  if (netEl) netEl.innerText = data.netPayload.toLocaleString('en-US') + " kg";
  if (truckEl) truckEl.innerText = data.truckNo;
  if (materialEl) materialEl.innerText = data.material;
  if (supplierEl) supplierEl.innerText = data.supplier;
  if (moistureEl) moistureEl.innerText = data.moisture;
  if (siloEl) siloEl.innerText = data.silo;
  if (ticketEl) ticketEl.innerText = data.ticketNo;
  if (statusEl) {
    statusEl.innerText = data.status;
    statusEl.className = 'status-tag ' + (data.type.includes('INWARD') ? 'tag-inward' : 'tag-outward');
  }
}

function renderDealerLedger(dealerKey) {
  const dealer = dealerLedgers[dealerKey];
  if (!dealer) return;

  const nameEl = document.getElementById('dealer-name-disp');
  const zoneEl = document.getElementById('dealer-zone-disp');
  const limitEl = document.getElementById('dealer-credit-limit');
  const balanceEl = document.getElementById('dealer-cur-balance');
  const availEl = document.getElementById('dealer-avail-credit');
  const statusBadge = document.getElementById('dealer-status-badge');
  const tbody = document.getElementById('dealer-transactions-body');
  const creditBar = document.getElementById('credit-usage-bar');

  if (nameEl) nameEl.innerText = dealer.name;
  if (zoneEl) zoneEl.innerText = dealer.zone + " | NTN: " + dealer.ntn;
  if (limitEl) limitEl.innerText = "PKR " + dealer.creditLimit.toLocaleString('en-PK');
  if (balanceEl) balanceEl.innerText = "PKR " + dealer.currentBalance.toLocaleString('en-PK');
  if (availEl) availEl.innerText = "PKR " + dealer.availableCredit.toLocaleString('en-PK');
  if (statusBadge) {
    statusBadge.innerText = dealer.status;
    statusBadge.className = 'dealer-status-chip ' + (dealer.currentBalance > dealer.creditLimit * 0.8 ? 'status-warning' : 'status-ok');
  }

  const usagePercent = Math.min(100, Math.round((dealer.currentBalance / dealer.creditLimit) * 100));
  if (creditBar) {
    creditBar.style.width = usagePercent + '%';
    creditBar.className = 'credit-bar-fill ' + (usagePercent > 80 ? 'fill-warning' : 'fill-primary');
  }

  if (tbody) {
    tbody.innerHTML = dealer.transactions.map(t => `
      <tr>
        <td class="cell-mono">${t.date}</td>
        <td><span class="badge-mini ${t.debit > 0 ? 'badge-debit' : 'badge-credit'}">${t.type}</span></td>
        <td class="cell-mono text-muted">${t.ref}</td>
        <td><strong>${t.desc}</strong></td>
        <td class="text-right ${t.debit > 0 ? 'text-red font-mono' : 'text-muted font-mono'}">
          ${t.debit > 0 ? 'PKR ' + t.debit.toLocaleString('en-PK') : '-'}
        </td>
        <td class="text-right ${t.credit > 0 ? 'text-emerald font-mono' : 'text-muted font-mono'}">
          ${t.credit > 0 ? 'PKR ' + t.credit.toLocaleString('en-PK') : '-'}
        </td>
        <td class="text-right font-mono font-bold">
          PKR ${t.balance.toLocaleString('en-PK')}
        </td>
      </tr>
    `).join('');
  }
}

function simulateDealerPayment() {
  const dealerSelect = document.getElementById('dealer-select');
  const dealerKey = dealerSelect ? dealerSelect.value : 'dealer-1';
  const dealer = dealerLedgers[dealerKey];
  if (!dealer) return;

  const paymentAmount = 500000;
  dealer.currentBalance -= paymentAmount;
  dealer.availableCredit += paymentAmount;

  const newTxn = {
    date: "Just Now",
    type: "Online Transfer",
    ref: "MBL-SIM-" + Math.floor(1000 + Math.random() * 9000),
    desc: "Meezan Bank Instant Dealer Payment Clearance",
    debit: 0,
    credit: paymentAmount,
    balance: dealer.currentBalance
  };

  dealer.transactions.unshift(newTxn);
  renderDealerLedger(dealerKey);
  showToast(`Simulated Payment of PKR 500,000 received for ${dealer.name}! Ledger & Credit line updated.`);
}

function openWeighbridgeSlipModal(data) {
  let modal = document.getElementById('wb-slip-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'wb-slip-modal';
    modal.className = 'custom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeSlipModal()"></div>
    <div class="modal-dialog scale-in" role="document">
      <div class="modal-header">
        <div class="slip-brand">
          <span class="ui-icon text-emerald" style="width: 24px; height: 24px;">
            <svg viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>
          </span>
          <div>
            <h3 style="font-size: 16px;">MARJAN FEEDS (KARACHI)</h3>
            <p class="text-muted" style="font-size: 11px;">Plot 45/4, Sector 12-D, North Karachi Industrial Area | PTCL: +92 21 36980967</p>
          </div>
        </div>
        <button class="modal-close" onclick="closeSlipModal()" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="slip-ticket-box">
          <div class="slip-title">DIGITAL WEIGHBRIDGE SCALE WEIGHT SLIP</div>
          <div class="slip-grid">
            <div><span class="lbl">Ticket #:</span> <strong>${data.ticketNo}</strong></div>
            <div><span class="lbl">Date & Time:</span> <strong>${new Date().toLocaleString()}</strong></div>
            <div><span class="lbl">Scale Terminal:</span> <strong>LoadMaster 12m Platform (IP: 192.168.1.55)</strong></div>
            <div><span class="lbl">Operator ID:</span> <strong>OP-77 (Gate #1 Security)</strong></div>
            <div><span class="lbl">Vehicle Reg #:</span> <strong>${data.truckNo}</strong></div>
            <div><span class="lbl">Driver:</span> <strong>${data.driver}</strong></div>
            <div><span class="lbl">Material / Item:</span> <strong>${data.material}</strong></div>
            <div><span class="lbl">Consignor / Supplier:</span> <strong>${data.supplier}</strong></div>
            <div><span class="lbl">Moisture Lab Test:</span> <strong>${data.moisture} (Passed &lt; 14.0%)</strong></div>
            <div><span class="lbl">Storage Bay / Silo:</span> <strong>${data.silo}</strong></div>
          </div>

          <div class="slip-weights-table">
            <div class="weight-row">
              <span>FIRST WEIGHT (GROSS WEIGHT)</span>
              <span class="wt-val font-mono">${data.grossWeight.toLocaleString()} KG</span>
            </div>
            <div class="weight-row">
              <span>SECOND WEIGHT (TARE WEIGHT)</span>
              <span class="wt-val font-mono">${data.tareWeight.toLocaleString()} KG</span>
            </div>
            <div class="weight-row highlight-net">
              <span>NET RAW MATERIAL PAYLOAD</span>
              <span class="wt-val font-mono text-emerald">${data.netPayload.toLocaleString()} KG (${(data.netPayload / 1000).toFixed(2)} MT)</span>
            </div>
          </div>

          <div class="slip-footer">
            <div class="signatures">
              <div class="sign-line"><span>Weighbridge Incharge</span></div>
              <div class="sign-line"><span>Truck Driver Signature</span></div>
              <div class="sign-line"><span>Gate Pass Inspector</span></div>
            </div>
            <p class="slip-note">This is a computerized weight slip generated by Marjan Feeds Integrated Mill ERP. Certified under ISO 9001:2015 calibrated weighing sensors.</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.print()">
          <span class="ui-icon" style="width: 14px; height: 14px;"><svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></span>
          <span>Print Weight Slip</span>
        </button>
        <button class="btn btn-primary" onclick="closeSlipModal()">Close Slip</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeSlipModal() {
  const modal = document.getElementById('wb-slip-modal');
  if (modal) modal.classList.remove('active');
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <span class="ui-icon text-emerald" style="width: 18px; height: 18px;">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </span>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
