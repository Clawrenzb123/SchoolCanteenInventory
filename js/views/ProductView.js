import View from "./View.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default class ProductView extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector("#product-table-body");
    this._form = document.querySelector("#product-form");
    this._tableBody = document.querySelector("#product-table-body");
    this._errorElement = document.querySelector("#product-error");
    this._submitButton = document.querySelector("#product-submit");
    this._cancelButton = document.querySelector("#cancel-edit");
    this._idInput = document.querySelector("#product-id");
    this._nameInput = document.querySelector("#product-name");
    this._priceInput = document.querySelector("#product-price");
    this._quantityInput = document.querySelector("#product-quantity");
    this._minStockInput = document.querySelector("#product-min-stock");
  }

  bindSubmit(handler) {
    this._form.addEventListener("submit", (event) => {
      event.preventDefault();
      const product = this.getFormData();
      handler(product);
    });
  }

  bindCancel(handler) {
    this._cancelButton.addEventListener("click", () => {
      handler();
    });
  }

  bindTableActions(onEdit, onDelete) {
    this._tableBody.addEventListener("click", (event) => {
      const button = event.target.closest("button");

      if (!button) {
        return;
      }

      const id = button.dataset.id;
      const action = button.dataset.action;

      if (action === "edit") {
        onEdit(id);
      }

      if (action === "delete") {
        if (window.confirm("Delete this product?")) {
          onDelete(id);
        }
      }
    });
  }

  getFormData() {
    return {
      id: this._idInput.value,
      name: this._nameInput.value,
      price: this._priceInput.value,
      quantity: this._quantityInput.value,
      minStockLevel: this._minStockInput.value,
    };
  }

  setFormData(product) {
    this._idInput.value = product.id;
    this._nameInput.value = product.name;
    this._priceInput.value = product.price;
    this._quantityInput.value = product.quantity;
    this._minStockInput.value = product.minStockLevel;
    this._submitButton.textContent = "Update Product";
    this._cancelButton.classList.remove("hidden");
    this.showError("");
  }

  resetForm() {
    this._form.reset();
    this._submitButton.textContent = "Add Product";
    this._cancelButton.classList.add("hidden");
    this.showError("");
  }

  showError(message) {
    this._errorElement.textContent = message;
  }

  renderProducts(products) {
    this.render({ products });
  }

  _generateMarkup() {
    const products = this._data.products;

    if (products.length === 0) {
      return '<tr><td colspan="7" class="empty-row">No products available.</td></tr>';
    }

    return products
      .map((product) => {
        const status = product.status;
        const statusClass =
          status === "Low Stock" ? "warning" : status === "Out of Stock" ? "danger" : "success";

        return `
          <tr>
            <td>${escapeHtml(product.id)}</td>
            <td>${escapeHtml(product.name)}</td>
            <td>₱${Number(product.price).toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>${product.minStockLevel}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
              <button type="button" class="action-btn edit" data-id="${escapeHtml(product.id)}" data-action="edit">Edit</button>
              <button type="button" class="action-btn delete" data-id="${escapeHtml(product.id)}" data-action="delete">Delete</button>
            </td>
          </tr>
        `;
      })
      .join("");
  }
}
