import View from "./View.js";

export default class DashboardView extends View {
  constructor() {
    super();
    this._totalProductsEl = document.querySelector("#total-products");
    this._totalStockEl = document.querySelector("#total-stock");
    this._totalValueEl = document.querySelector("#total-value");
    this._navButtons = document.querySelectorAll(".nav-btn");
    this._panels = document.querySelectorAll(".panel");
  }

  bindNavigation(handler) {
    this._navButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.target));
    });
  }

  setActivePanel(targetPanel) {
    this._navButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.target === targetPanel);
    });

    this._panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetPanel);
    });
  }

  renderDashboard(summary) {
    this._totalProductsEl.textContent = summary.totalProducts;
    this._totalStockEl.textContent = summary.totalStock;
    this._totalValueEl.textContent = `₱${summary.totalValue.toFixed(2)}`;
  }
}
