const STORAGE_KEY = "product_crud_v1";
const grid = document.getElementById("grid");
const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("title");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const categoryInput = document.getElementById("category");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");
const sortPrice = document.getElementById("sortPrice");
const seedBtn = document.getElementById("seedBtn");
const clearAllBtn = document.getElementById("clearAll");
const clearBtn = document.getElementById("clearBtn");
const backdrop = document.getElementById("backdrop");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editPrice = document.getElementById("editPrice");
const editImage = document.getElementById("editImage");
const editCategory = document.getElementById("editCategory");
const cancelEdit = document.getElementById("cancelEdit");

let products = loadProducts();
let editingId = null;

const defaultImage = "https://dummyimage.com/600x400/cccccc/000000&text=No+Image";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function addProduct({ title, price, image = "", category = "" }) {
  if (!title || isNaN(price)) {
    alert("Please provide valid product title and price.");
    return false;
  }
  const product = {
    id: uid(),
    title: title.trim(),
    price: Number(price),
    image: image.trim(),
    category: category.trim(),
  };
  products.unshift(product);
  saveProducts();
  renderProducts();
  return true;
}

function addProductToList(product) {
  const card = document.createElement("article");
  card.className = "bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden flex flex-col";
  card.dataset.id = product.id;

  const imgWrap = document.createElement("div");
  imgWrap.className = "h-40 bg-gray-100 flex items-center justify-center overflow-hidden";
  const img = document.createElement("img");
  img.alt = product.title;
  img.className = "h-full object-center";

  
  img.src = product.image && product.image.trim() !== "" ? product.image : defaultImage;
  img.onerror = () => {
    img.src = defaultImage;
  }; 

  imgWrap.appendChild(img);

  const body = document.createElement("div");
  body.className = "p-4 flex flex-col gap-2 flex-1";
  const title = document.createElement("h4");
  title.textContent = product.title;
  title.className = "font-medium text-slate-900";

  const meta = document.createElement("div");
  meta.className = "flex justify-between text-sm text-slate-500";
  meta.innerHTML = `<span>${formatPrice(
    product.price
  )}</span>
  <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-xs">${
    product.category || "Uncategorized"
  }</span>`;

  const actions = document.createElement("div");
  actions.className = "flex gap-2 mt-2";
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "text-amber-700 bg-amber-100 px-2 py-1 rounded-md border border-amber-200 text-sm";
  editBtn.onclick = () => openEditModal(product.id);
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 text-sm";
  delBtn.onclick = () => deleteProduct(product.id);

  actions.append(editBtn, delBtn);
  body.append(title, meta, actions);
  card.append(imgWrap, body);
  grid.append(card);
}

function editProduct(id, { title, price, image = "", category = "" }) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products[idx] = {
    ...products[idx],
    title,
    price: Number(price),
    image,
    category,
  };
  saveProducts();
  renderProducts();
  return true;
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  products = products.filter((p) => p.id !== id);
  saveProducts();
  renderProducts();
}

function renderProducts(list = products) {
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = `<div class="text-center bg-blue-50 text-blue-600 rounded-lg p-8 shadow">No products yet.<br><span class="text-slate-500 text-sm">Add new products using the form above.</span></div>`;
    updateCategoryOptions();
    return;
  }
  list.forEach((p) => addProductToList(p));
  updateCategoryOptions();
}

function updateCategoryOptions() {
  const cats = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );
  const selected = filterCategory.value || "";
  filterCategory.innerHTML = '<option value="">All categories</option>';
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filterCategory.append(opt);
  });
  filterCategory.value = selected;
}

addForm.onsubmit = (e) => {
  e.preventDefault();
  if (
    addProduct({
      title: titleInput.value,
      price: priceInput.value,
      image: imageInput.value,
      category: categoryInput.value,
    })
  ) {
    addForm.reset();
    titleInput.focus();
  }
};

clearBtn.onclick = () => {
  addForm.reset();
  titleInput.focus();
};

function applyListOperations() {
  let result = [...products];
  const q = searchInput.value.trim().toLowerCase();
  const cat = filterCategory.value.trim();
  const s = sortPrice.value;
  if (q) result = result.filter((p) => p.title.toLowerCase().includes(q));
  if (cat)
    result = result.filter(
      (p) => p.category.toLowerCase() === cat.toLowerCase()
    );
  if (s === "low") result.sort((a, b) => a.price - b.price);
  if (s === "high") result.sort((a, b) => b.price - a.price);
  renderProducts(result);
}

searchInput.oninput = applyListOperations;
filterCategory.onchange = applyListOperations;
sortPrice.onchange = applyListOperations;

function openEditModal(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  editingId = id;
  editTitle.value = p.title;
  editPrice.value = p.price;
  editImage.value = p.image;
  editCategory.value = p.category;
  backdrop.classList.remove("hidden");
  backdrop.classList.add("flex");
}

function closeEditModal() {
  editingId = null;
  editForm.reset();
  backdrop.classList.add("hidden");
  backdrop.classList.remove("flex");
}

editForm.onsubmit = (e) => {
  e.preventDefault();
  if (editingId) {
    editProduct(editingId, {
      title: editTitle.value,
      price: editPrice.value,
      image: editImage.value,
      category: editCategory.value,
    });
    closeEditModal();
  }
};

cancelEdit.onclick = closeEditModal;
backdrop.onclick = (e) => {
  if (e.target === backdrop) closeEditModal();
};

seedBtn.onclick = () => {
  const demo = [
    { title: "Minimal Lamp", price: 1299, category: "Home" },
    { title: "Ceramic Mug", price: 299, category: "Kitchen" },
    { title: "Wireless Earbuds", price: 2499, category: "Electronics" },
    { title: "Notebook A5", price: 149, category: "Stationery" },
  ];
  demo.forEach((d) => addProduct(d));
  applyListOperations();
};

clearAllBtn.onclick = () => {
  if (!confirm("Clear all products?")) return;
  products = [];
  saveProducts();
  renderProducts();
};

renderProducts();
applyListOperations();
