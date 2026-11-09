import View from "./View.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default class LowStockView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector("#low-stock-list");
  }

  renderLowStock(products) {
    this.render({ products });
  }

  _generateMarkup() {
    const products = this._data.products;

    if (products.length === 0) {
      return "<li class='low-stock-empty'>No products need restocking.</li>";
    }

    return products
      .map(
        (product) =>
          `<li class="low-stock-item"><strong>${escapeHtml(product.name)}</strong> - ${product.quantity} left (min ${product.minStockLevel})</li>`
      )
      .join("");
  }
}
