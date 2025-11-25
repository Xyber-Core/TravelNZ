/* =========================================================
   🌍 GLOBAL UTILITIES
   ========================================================= */

function openModal(modal) {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.style.display = "none";
  document.body.style.overflow = "";
}

/* =========================================================
   ❓ FAQ ACCORDION INITIALIZER
   ========================================================= */
function initFAQ() {
  const faqQuestions = document.querySelectorAll(".faqQuestion");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const answer = this.nextElementSibling;
      const isOpen = answer.classList.contains("open");

      document.querySelectorAll(".faqAnswer").forEach((ans) => ans.classList.remove("open"));

      document.querySelectorAll(".faqQuestion i").forEach((icon) => {
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
      });

      if (!isOpen) {
        answer.classList.add("open");
        this.querySelector("i").classList.remove("fa-chevron-down");
        this.querySelector("i").classList.add("fa-chevron-up");
      }
    });
  });
}

/* =========================================================
   🧭 TOURS FILTER + SEARCH
   ========================================================= */

let allTours = [];

function initTours() {
  const toursGrid = document.getElementById("toursGrid");
  if (!toursGrid) return;

  fetch("/SRC/JSON/Cards.json?t=" + new Date().getTime())
    .then((res) => res.json())
    .then((data) => {
      allTours = data;
      renderTours(allTours);
      initTourFilters();
    })
    .catch((err) => console.error("❌ Error loading tours:", err));
}

function renderTours(tours) {
  const grid = document.getElementById("toursGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (tours.length === 0) {
    grid.innerHTML = `<p style="text-align:center; opacity:0.7;">No tours found. Try adjusting your filters.</p>`;
    return;
  }

  tours.forEach((tour) => {
    const card = document.createElement("div");
    card.className = `tourCard ${tour.badge ? "premium" : ""}`;
    card.innerHTML = `
  ${tour.badge ? `<div class="tourBadge">${tour.badge}</div>` : ""}
  <div class="tourImage" style="background-image: url('${tour.image}')"></div>
  <div class="tourContent">
    <div class="tourHeader">
      <div>
        <h3>${tour.title}</h3>
        <div class="tourRating">
          ${'<i class="fas fa-star"></i>'.repeat(Math.floor(tour.rating))}
          ${tour.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ""}
          ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(tour.rating))}
          <span>(${tour.reviews})</span>
        </div>
      </div>
      <div class="tourPrice">$${tour.price}</div>
    </div>
    <div class="tourMeta">
      <span class="tourCategory">${tour.category}</span>
      <span class="tourDuration">${tour.duration} Days</span>
    </div>
    <p>${tour.description}</p>
    <div class="tourHighlights">
      ${tour.highlights.map((h) => `<span class="highlightTag">${h}</span>`).join("")}
    </div>
  </div>
`;

    grid.appendChild(card);
  });
}

function initTourFilters() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", applyFilters);
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  }

  const searchSection = document.querySelector(".searchSection");
  if (searchSection && !document.querySelector(".resetBtn")) {
    const resetBtn = document.createElement("button");
    resetBtn.className = "secondaryBtn resetBtn";
    resetBtn.textContent = "Reset Filters";
    resetBtn.style.marginTop = "1rem";
    resetBtn.addEventListener("click", resetFilters);
    searchSection.appendChild(resetBtn);
  }
}

function applyFilters() {
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";

  const priceFilter = document.querySelector('[dataFilter="price"] .customSelectTrigger')?.getAttribute("data-value") || "";
  const activityFilter = document.querySelector('[dataFilter="activity"] .customSelectTrigger')?.getAttribute("data-value") || "";
  const regionFilter = document.querySelector('[dataFilter="region"] .customSelectTrigger')?.getAttribute("data-value") || "";
  const durationFilter = document.querySelector('[dataFilter="duration"] .customSelectTrigger')?.getAttribute("data-value") || "";

  const filtered = allTours.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm) || tour.category.toLowerCase().includes(searchTerm) || tour.highlights.some((h) => h.toLowerCase().includes(searchTerm));

    let matchesPrice = true;
    if (priceFilter === "under200") matchesPrice = tour.price < 200;
    else if (priceFilter === "200-400") matchesPrice = tour.price >= 200 && tour.price <= 400;
    else if (priceFilter === "above400") matchesPrice = tour.price > 400;

    const matchesActivity = activityFilter ? tour.activity === activityFilter : true;
    const matchesRegion = regionFilter ? tour.region === regionFilter : true;
    const matchesDuration = durationFilter ? tour.duration === durationFilter : true;

    return matchesSearch && matchesPrice && matchesActivity && matchesRegion && matchesDuration;
  });

  renderTours(filtered);
}

function resetFilters() {
  document.getElementById("searchInput").value = "";

  const defaults = {
    price: "All Price Ranges",
    activity: "All Activities",
    region: "All Regions",
    duration: "Duration",
  };

  document.querySelectorAll(".customSelectWrapper").forEach((wrapper) => {
    const type = wrapper.getAttribute("dataFilter");
    const trigger = wrapper.querySelector(".customSelectTrigger");

    trigger.textContent = defaults[type];
    trigger.setAttribute("data-value", "");
  });

  renderTours(allTours);
}

document.addEventListener("DOMContentLoaded", initTours);

/* =========================================================
   🎛️ UNIVERSAL DROPDOWN MANAGER
   ========================================================= */
function initDropdowns() {
  const closeAll = () => document.querySelectorAll(".customSelect.open").forEach((d) => d.classList.remove("open"));

  document.addEventListener("click", (e) => {
    const wrapper = e.target.closest(".customSelectWrapper");

    if (!wrapper) return closeAll();

    const dropdown = wrapper.querySelector(".customSelect");
    const trigger = wrapper.querySelector(".customSelectTrigger");
    const option = e.target.closest(".customOption");

    if (e.target === trigger) {
      const isOpen = dropdown.classList.contains("open");
      closeAll();
      dropdown.classList.toggle("open", !isOpen);
      return;
    }

    if (option) {
      trigger.textContent = option.textContent;
      trigger.dataset.value = option.dataset.value;

      const select = wrapper.querySelector("select");
      if (select) select.value = option.dataset.value;

      dropdown.classList.remove("open");

      if (wrapper.dataset.filter) applyFilters();
    }
  });
}

document.addEventListener("DOMContentLoaded", initDropdowns);

/* =========================================================
   📬 CONTACT MODAL
   ========================================================= */
window.initContactForm = function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const errorModal = document.getElementById("formErrorModal");
  const successModal = document.getElementById("formSuccessModal");

  const closeErrorButtons = document.querySelectorAll(".closeErrorModal, #formErrorModal .closeModal");
  const closeSuccessButtons = document.querySelectorAll(".closeSuccessModal, #formSuccessModal .closeModal");

  [errorModal, successModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  closeErrorButtons.forEach((btn) => btn.addEventListener("click", () => closeModal(errorModal)));
  closeSuccessButtons.forEach((btn) => btn.addEventListener("click", () => closeModal(successModal)));

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input, select, textarea");
    let allFilled = true;
    
    inputs.forEach((input) => {
      if (input.hasAttribute("required") && !input.value.trim()) 
        allFilled = false;
    });

    if (!allFilled) {
      openModal(errorModal);
      return;
    }

    openModal(successModal);
    form.reset();

    const hiddenSelect = document.getElementById("contactType");
    const customTrigger = document.querySelector(".customSelectTrigger");

    if (hiddenSelect) hiddenSelect.value = "";
    if (customTrigger) customTrigger.textContent = "Select Inquiry Type";
  });
};

/* =========================================================
   ⚙️ DISCLAIMER MODAL
   ========================================================= */

const disclaimerBtn = document.getElementById("disclaimerBtn");
const disclaimerModal = document.getElementById("disclaimerModal");
const disclaimerClose = disclaimerModal?.querySelector(".closeModal");

if (disclaimerBtn && disclaimerModal && disclaimerClose) {
  disclaimerBtn.addEventListener("click", () => openModal(disclaimerModal));
  disclaimerClose.addEventListener("click", () => closeModal(disclaimerModal));
  disclaimerModal.addEventListener("click", (e) => {
    if (e.target === disclaimerModal) closeModal(disclaimerModal);
  });
}
