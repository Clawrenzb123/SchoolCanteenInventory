const STORAGE_KEY = "canteenInventoryProducts";

const starterProducts = [
  { id: "P001", name: "Rice Meal", price: 35, quantity: 45, minStockLevel: 10 },
  { id: "P002", name: "Chicken Sandwich", price: 60, quantity: 18, minStockLevel: 12 },
  { id: "P003", name: "Fruit Juice", price: 25, quantity: 9, minStockLevel: 10 },
];

function loadProducts() {
  const savedProducts = localStorage.getItem(STORAGE_KEY);

  if (!savedProducts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterProducts));
    return [...starterProducts];
  }

  try {
    const parsedProducts = JSON.parse(savedProducts);
    return Array.isArray(parsedProducts) ? parsedProducts : [];
  } catch (error) {
    return [];
  }
}

export const state = {
  storageKey: STORAGE_KEY,
  products: loadProducts(),
};

export function saveProducts() {
  localStorage.setItem(state.storageKey, JSON.stringify(state.products));
}

export function findProduct(productId) {
  return state.products.find((product) => product.id === productId);
}

export function getProducts() {
  return state.products;
}

export function normalizeProduct(product) {
  const toNumber = (value) => {
    if (String(value ?? "").trim() === "") {
      return NaN;
    }

    return Number(value);
  };

  return {
    id: String(product.id ?? "").trim(),
    name: String(product.name ?? "").trim(),
    price: toNumber(product.price),
    quantity: toNumber(product.quantity),
    minStockLevel: toNumber(product.minStockLevel),
  };
}

export function validateProduct(product, ignoreId = null) {
  if (!product.id || product.id.trim() === "") {
    return "Product ID cannot be empty.";
  }

  if (!product.name || product.name.trim() === "") {
    return "Product name cannot be empty.";
  }

  if (!Number.isFinite(product.price)) {
    return "Price is required and must be a valid number.";
  }

  if (product.price < 0) {
    return "Price cannot be negative.";
  }

  if (!Number.isFinite(product.quantity)) {
    return "Quantity is required and must be a valid number.";
  }

  if (product.quantity < 0) {
    return "Quantity cannot be negative.";
  }

  if (!Number.isInteger(product.quantity)) {
    return "Quantity must be a whole number.";
  }

  if (!Number.isFinite(product.minStockLevel)) {
    return "Minimum stock level is required and must be a valid number.";
  }

  if (product.minStockLevel < 0) {
    return "Minimum stock level cannot be negative.";
  }

  if (!Number.isInteger(product.minStockLevel)) {
    return "Minimum stock level must be a whole number.";
  }

  const duplicateProduct = state.products.some((item) => {
    return item.id.toLowerCase() === product.id.toLowerCase() && item.id !== ignoreId;
  });

  if (duplicateProduct) {
    return "Product IDs cannot be duplicated.";
  }

  return "";
}

export function addProduct(product) {
  const cleanProduct = normalizeProduct(product);
  const errorMessage = validateProduct(cleanProduct);

  if (errorMessage) {
    return { success: false, message: errorMessage };
  }

  state.products.push(cleanProduct);
  saveProducts();
  return { success: true, product: cleanProduct };
}

export function updateProduct(productId, product) {
  const currentProduct = findProduct(productId);

  if (!currentProduct) {
    return { success: false, message: "Product not found." };
  }

  const cleanProduct = normalizeProduct(product);
  const errorMessage = validateProduct(cleanProduct, productId);

  if (errorMessage) {
    return { success: false, message: errorMessage };
  }

  const productIndex = state.products.findIndex((item) => item.id === productId);
  state.products[productIndex] = cleanProduct;
  saveProducts();
  return { success: true, product: cleanProduct };
}

export function deleteProduct(productId) {
  const oldLength = state.products.length;
  state.products = state.products.filter((product) => product.id !== productId);
  saveProducts();

  return state.products.length !== oldLength;
}

export function addStock(productId, quantity) {
  const product = findProduct(productId);

  if (!product) {
    return { success: false, message: "Product not found." };
  }

  const stockAmount = Number(quantity);

  if (!Number.isFinite(stockAmount) || !Number.isInteger(stockAmount) || stockAmount <= 0) {
    return { success: false, message: "Quantity must be a whole number greater than zero." };
  }

  product.quantity += stockAmount;
  saveProducts();
  return { success: true, product };
}

export function removeStock(productId, quantity) {
  const product = findProduct(productId);

  if (!product) {
    return { success: false, message: "Product not found." };
  }

  const stockAmount = Number(quantity);

  if (!Number.isFinite(stockAmount) || !Number.isInteger(stockAmount) || stockAmount <= 0) {
    return { success: false, message: "Quantity must be a whole number greater than zero." };
  }

  if (product.quantity - stockAmount < 0) {
    return {
      success: false,
      message: "You cannot remove more stock than is available.",
    };
  }

  product.quantity -= stockAmount;
  saveProducts();
  return { success: true, product };
}

export function getProductStatus(product) {
  if (product.quantity <= 0) {
    return "Out of Stock";
  }

  if (product.quantity <= product.minStockLevel) {
    return "Low Stock";
  }

  return "Available";
}

export function getDashboardSummary() {
  let totalStock = 0;
  let totalValue = 0;
  const lowStockProducts = [];

  state.products.forEach((product) => {
    totalStock += product.quantity;
    totalValue += product.quantity * product.price;

    if (product.quantity <= product.minStockLevel) {
      lowStockProducts.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        minStockLevel: product.minStockLevel,
      });
    }
  });

  return {
    totalProducts: state.products.length,
    totalStock,
    totalValue,
    lowStock: lowStockProducts,
  };
}

export default state;
