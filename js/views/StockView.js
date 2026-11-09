import View from "./View.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default class StockView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector("#stock-product");
    this._form = document.querySelector("#stock-form");
    this._productSelect = document.querySelector("#stock-product");
    this._actionSelect = document.querySelector("#stock-action");
    this._quantityInput = document.querySelector("#stock-quantity");
    this._errorElement = document.querySelector("#stock-error");
    this._successElement = document.querySelector("#stock-success");
    this._stockInfoElement = document.querySelector("#stock-current-info");
  }

  bindSubmit(handler) {
    this._form.addEventListener("submit", (event) => {
      event.preventDefault();
      const stockData = this.getFormData();
      handler(stockData);
    });
  }

  bindProductChange(handler) {
    this._productSelect.addEventListener("change", () => {
      handler(this.getSelectedProductId());
    });
  }

  getSelectedProductId() {
    return this._productSelect.value;
  }

  getFormData() {
    return {
      id: this._productSelect.value,
      action: this._actionSelect.value,
      quantity: this._quantityInput.value,
    };
  }

  showCurrentStock(product) {
    if (!product) {
      this._stockInfoElement.textContent = "Select a product to view its current stock.";
      return;
    }

    this._stockInfoElement.textContent = `${product.name} (${product.id}) — Current stock: ${product.quantity} units`;
  }

  renderOptions(products) {
    const previousProductId = this.getSelectedProductId();
    const selectedProduct =
      products.find((product) => product.id === previousProductId) ?? products[0];

    this.render({ products });
    this._productSelect.value = selectedProduct ? selectedProduct.id : "";

    if (!selectedProduct) {
      this._stockInfoElement.textContent = "No products available.";
    }
  }

  _generateMarkup() {
    const products = this._data.products;

    if (products.length === 0) {
      return '<option value="">No products available</option>';
    }

    return products
      .map(
        (product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} (${escapeHtml(product.id)})</option>`
      )
      .join("");
  }

  resetForm() {
    this._quantityInput.value = "";
    this._actionSelect.value = "add";
    this.showError("");
    this.showSuccess("");
  }

  showError(message) {
    this._errorElement.textContent = message;
  }

  showSuccess(message) {
    this._successElement.textContent = message;
  }
}
