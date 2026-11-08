import state, {
  addProduct,
  addStock,
  deleteProduct,
  findProduct,
  getDashboardSummary,
  getProducts,
  getProductStatus,
  removeStock,
  updateProduct,
} from "./model.js";
import DashboardView from "./views/DashboardView.js";
import LowStockView from "./views/LowStockView.js";
import ProductView from "./views/ProductView.js";
import StockView from "./views/StockView.js";

export default class Controller {
  constructor() {
    this.model = state;
    this.dashboardView = new DashboardView();
    this.lowStockView = new LowStockView();
    this.productView = new ProductView();
    this.stockView = new StockView();
    this.editingProductId = null;

    this.bindNavigation();
    this.bindProductEvents();
    this.bindStockEvents();
    this.updateViews();
  }

  bindNavigation() {
    this.dashboardView.bindNavigation((targetPanel) => {
      this.dashboardView.setActivePanel(targetPanel);
    });
  }

  bindProductEvents() {
    this.productView.bindSubmit(this.handleProductSubmit.bind(this));
    this.productView.bindCancel(this.cancelEdit.bind(this));
    this.productView.bindTableActions(this.editProduct.bind(this), this.deleteProduct.bind(this));
  }

  bindStockEvents() {
    this.stockView.bindSubmit(this.handleStockSubmit.bind(this));
    this.stockView.bindProductChange(this.handleStockProductChange.bind(this));
  }

  updateViews() {
    const summary = getDashboardSummary();
    const products = getProducts();
    const productsWithStatus = products.map((product) => ({
      ...product,
      status: getProductStatus(product),
    }));

    this.dashboardView.renderDashboard(summary);
    this.lowStockView.renderLowStock(summary.lowStock);
    this.productView.renderProducts(productsWithStatus);
    this.stockView.renderOptions(products);
    this.stockView.showCurrentStock(findProduct(this.stockView.getSelectedProductId()));
  }

  handleStockProductChange(productId) {
    this.stockView.showCurrentStock(findProduct(productId));
  }

  handleProductSubmit(product) {
    let result;

    if (this.editingProductId) {
      result = updateProduct(this.editingProductId, product);
    } else {
      result = addProduct(product);
    }

    if (!result.success) {
      this.productView.showError(result.message);
      return;
    }

    this.editingProductId = null;
    this.productView.resetForm();
    this.updateViews();
  }

  editProduct(productId) {
    const product = findProduct(productId);

    if (!product) {
      return;
    }

    this.editingProductId = productId;
    this.productView.setFormData(product);
    this.dashboardView.setActivePanel("products");
  }

  deleteProduct(productId) {
    deleteProduct(productId);

    if (this.editingProductId === productId) {
      this.cancelEdit();
    }

    this.updateViews();
  }

  cancelEdit() {
    this.editingProductId = null;
    this.productView.resetForm();
  }

  handleStockSubmit(stockData) {
    const quantity = Number(stockData.quantity);

    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      this.stockView.showError("Quantity must be a whole number greater than zero.");
      return;
    }

    let result;

    if (stockData.action === "add") {
      result = addStock(stockData.id, quantity);
    } else {
      result = removeStock(stockData.id, quantity);
    }

    if (!result.success) {
      this.stockView.showError(result.message);
      return;
    }

    this.stockView.resetForm();
    this.updateViews();
    this.stockView.showSuccess(`Stock updated successfully. ${result.product.name} now has ${result.product.quantity} units.`);
  }
}

new Controller();
