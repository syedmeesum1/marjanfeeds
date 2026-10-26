// Marjan Feeds - Karachi | Interactive Poultry FCR & Dairy Yield ROI Calculator

function initFcrCalculator() {
  const modeBtns = document.querySelectorAll('.calc-mode-btn');
  const poultryForm = document.getElementById('calc-poultry-form');
  const dairyForm = document.getElementById('calc-dairy-form');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');

      if (mode === 'poultry') {
        if (poultryForm) poultryForm.style.display = 'block';
        if (dairyForm) dairyForm.style.display = 'none';
        calculatePoultryFcr();
      } else {
        if (poultryForm) poultryForm.style.display = 'none';
        if (dairyForm) dairyForm.style.display = 'block';
        calculateDairyRoi();
      }
    });
  });

  // Poultry inputs
  const flockSlider = document.getElementById('flock-size-slider');
  const targetWeightSlider = document.getElementById('target-weight-slider');
  const fcrSlider = document.getElementById('marjan-fcr-slider');
  const bagPriceInput = document.getElementById('bag-price-input');

  if (flockSlider) flockSlider.addEventListener('input', calculatePoultryFcr);
  if (targetWeightSlider) targetWeightSlider.addEventListener('input', calculatePoultryFcr);
  if (fcrSlider) fcrSlider.addEventListener('input', calculatePoultryFcr);
  if (bagPriceInput) bagPriceInput.addEventListener('input', calculatePoultryFcr);

  // Dairy inputs
  const herdSlider = document.getElementById('herd-size-slider');
  const milkBoostSlider = document.getElementById('milk-boost-slider');
  const milkPriceInput = document.getElementById('milk-price-input');
  const wandaBagPriceInput = document.getElementById('wanda-bag-price-input');

  if (herdSlider) herdSlider.addEventListener('input', calculateDairyRoi);
  if (milkBoostSlider) milkBoostSlider.addEventListener('input', calculateDairyRoi);
  if (milkPriceInput) milkPriceInput.addEventListener('input', calculateDairyRoi);
  if (wandaBagPriceInput) wandaBagPriceInput.addEventListener('input', calculateDairyRoi);

  // Initial runs
  calculatePoultryFcr();
}

function calculatePoultryFcr() {
  const flockEl = document.getElementById('flock-size-slider');
  const weightEl = document.getElementById('target-weight-slider');
  const fcrEl = document.getElementById('marjan-fcr-slider');
  const bagPriceEl = document.getElementById('bag-price-input');

  if (!flockEl || !weightEl || !fcrEl) return;

  const flockSize = parseInt(flockEl.value, 10);
  const targetWeight = parseFloat(weightEl.value);
  const marjanFcr = parseFloat(fcrEl.value);
  const bagPrice = parseInt(bagPriceEl ? bagPriceEl.value : 4600, 10) || 4600;
  const competitorFcr = 1.68; // Market standard generic feed average

  // Sync labels
  const flockDisp = document.getElementById('flock-size-val');
  const weightDisp = document.getElementById('target-weight-val');
  const fcrDisp = document.getElementById('marjan-fcr-val');

  if (flockDisp) flockDisp.innerText = flockSize.toLocaleString() + " Birds";
  if (weightDisp) weightDisp.innerText = targetWeight.toFixed(2) + " kg / Bird";
  if (fcrDisp) fcrDisp.innerText = marjanFcr.toFixed(2) + " FCR";

  // Calculations
  const totalLiveWeight = flockSize * targetWeight; // kg
  const marjanFeedKg = totalLiveWeight * marjanFcr;
  const standardFeedKg = totalLiveWeight * competitorFcr;

  const feedSavedKg = standardFeedKg - marjanFeedKg;
  const bagsSaved = Math.round(feedSavedKg / 50); // 50kg bags
  const costSavingsPkr = bagsSaved * bagPrice;

  // Render outputs
  const feedSavedBagsEl = document.getElementById('res-poultry-bags-saved');
  const costSavingsEl = document.getElementById('res-poultry-cost-saved');
  const totalFeedEl = document.getElementById('res-poultry-total-feed');
  const fcrDiffEl = document.getElementById('res-fcr-efficiency');

  if (feedSavedBagsEl) feedSavedBagsEl.innerText = bagsSaved.toLocaleString() + " Bags";
  if (costSavingsEl) costSavingsEl.innerText = "PKR " + costSavingsPkr.toLocaleString('en-PK');
  if (totalFeedEl) totalFeedEl.innerText = (marjanFeedKg / 1000).toFixed(1) + " MT (" + Math.round(marjanFeedKg / 50) + " Bags)";
  if (fcrDiffEl) fcrDiffEl.innerText = "+" + ((competitorFcr - marjanFcr) / competitorFcr * 100).toFixed(1) + "% Better Feed Efficiency";
}

function calculateDairyRoi() {
  const herdEl = document.getElementById('herd-size-slider');
  const boostEl = document.getElementById('milk-boost-slider');
  const milkPriceEl = document.getElementById('milk-price-input');
  const wandaPriceEl = document.getElementById('wanda-bag-price-input');

  if (!herdEl || !boostEl) return;

  const herdSize = parseInt(herdEl.value, 10);
  const dailyBoostLiters = parseFloat(boostEl.value);
  const milkPrice = parseInt(milkPriceEl ? milkPriceEl.value : 210, 10) || 210; // PKR per Liter in Karachi
  const wandaBagPrice = parseInt(wandaPriceEl ? wandaPriceEl.value : 4200, 10) || 4200; // 40kg bag

  // Sync labels
  const herdDisp = document.getElementById('herd-size-val');
  const boostDisp = document.getElementById('milk-boost-val');

  if (herdDisp) herdDisp.innerText = herdSize.toLocaleString() + " Milking Cattle";
  if (boostDisp) boostDisp.innerText = "+" + dailyBoostLiters.toFixed(1) + " Litres / Animal / Day";

  // Calculations (30 days cycle)
  const monthlyExtraMilkLiters = herdSize * dailyBoostLiters * 30;
  const monthlyGrossRevenue = monthlyExtraMilkLiters * milkPrice;

  // Extra Wanda fed: ~1.5kg extra wanda for 3L extra milk = 45kg per animal per month = ~1.125 bags of 40kg
  const extraBagsNeeded = Math.round(herdSize * 1.1);
  const extraFeedCost = extraBagsNeeded * wandaBagPrice;
  const netProfitMonthly = monthlyGrossRevenue - extraFeedCost;

  // Render outputs
  const extraMilkEl = document.getElementById('res-dairy-extra-milk');
  const netRevenueEl = document.getElementById('res-dairy-net-profit');
  const annualBoostEl = document.getElementById('res-dairy-annual-profit');

  if (extraMilkEl) extraMilkEl.innerText = monthlyExtraMilkLiters.toLocaleString() + " Litres / Month";
  if (netRevenueEl) netRevenueEl.innerText = "PKR " + Math.round(netProfitMonthly).toLocaleString('en-PK');
  if (annualBoostEl) annualBoostEl.innerText = "PKR " + Math.round(netProfitMonthly * 12).toLocaleString('en-PK') + " / Year";
}
