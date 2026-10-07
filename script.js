// ---------- Product data ----------
const products = [
  { id: 1, name: "Mechanical Keyboard", category: "Keyboards", price: 4999, icon: "⌨️", color: "#dbe7f3" },
  { id: 2, name: "Compact 65% Keyboard", category: "Keyboards", price: 3599, icon: "⌨️", color: "#e3f0ea" },
  { id: 3, name: "Wireless Mouse", category: "Mice", price: 1499, icon: "🖱️", color: "#f6e9c8" },
  { id: 4, name: "Ergonomic Mouse", category: "Mice", price: 2799, icon: "🖱️", color: "#e8e1f2" },
  { id: 5, name: "LED Desk Lamp", category: "Lighting", price: 1899, icon: "💡", color: "#fbe6cf" },
  { id: 6, name: "Monitor Light Bar", category: "Lighting", price: 2499, icon: "🔆", color: "#dbe7f3" },
  { id: 7, name: "Laptop Stand", category: "Accessories", price: 1299, icon: "💻", color: "#e3f0ea" },
  { id: 8, name: "Noise-Cancelling Headphones", category: "Accessories", price: 6999, icon: "🎧", color: "#f2dede" },
  { id: 9, name: "Desk Mat (XL)", category: "Accessories", price: 999, icon: "🟫", color: "#f6e9c8" },
  { id: 10, name: "USB-C Hub", category: "Accessories", price: 1799, icon: "🔌", color: "#e8e1f2" }
];

// ---------- State ----------
let cart = loadCart();
let activeCategory = "All";
let searchTerm = "";
let sortMode = "default";

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const rupees = (n) => "₹" + n.toLocaleString("en-IN");

function loadCart() {
  try { return JSON.parse(localStorage.getItem("deskhaus-cart")) || []; }
  catch { return []; }
}
function saveCart() {
  try { localStorage.setItem("deskhaus-cart", JSON.stringify(cart)); } catch {}
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2000);
}

// ---------- Products ----------
function renderFilters() {
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  $("filters").innerHTML = cats
    .map((c) => `<button class="${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderProducts() {
  let list = products.filter((p) =>
    (activeCategory === "All" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (sortMode === "low") list.sort((a, b) => a.price - b.price);
  if (sortMode === "high") list.sort((a, b) => b.price - a.price);

  $("empty").hidden = list.length > 0;
  $("product-grid").innerHTML = list.map((p) => `
    <article class="card">
      <div class="thumb" style="background:${p.color}">${p.icon}</div>
      <div class="body">
        <h3>${p.name}</h3>
        <span class="cat">${p.category}</span>
        <div class="row">
          <span class="price">${rupees(p.price)}</span>
          <button class="add" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`).join("");
}

// ---------- Cart ----------
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  updateCart();
  toast("Added to cart");
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  updateCart();
}

function updateCart() {
  saveCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + products.find((p) => p.id === i.id).price * i.qty, 0);
  $("cart-count").textContent = count;
  $("cart-total").textContent = rupees(total);

  $("cart-items").innerHTML = cart.length
    ? cart.map((i) => {
        const p = products.find((x) => x.id === i.id);
        return `
        <li>
          <span class="ico">${p.icon}</span>
          <div>
            <strong>${p.name}</strong><br>
            <small>${rupees(p.price)}</small>
            <div class="qty">
              <button data-qty="-1" data-id="${p.id}" aria-label="Decrease quantity">−</button>
              <span>${i.qty}</span>
              <button data-qty="1" data-id="${p.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </li>`;
      }).join("")
    : `<li class="cart-empty">Your cart is empty. Add a product to get started.</li>`;
}

function toggleCart(open) {
  $("cart").classList.toggle("open", open);
  $("cart").setAttribute("aria-hidden", String(!open));
  $("overlay").hidden = !open;
}

function checkout() {
  if (!cart.length) return toast("Add something to your cart first");
  cart = [];
  updateCart();
  toggleCart(false);
  toast("Order placed. Thank you!");
}

// ---------- Events ----------
$("filters").addEventListener("click", (e) => {
  if (!e.target.dataset.cat) return;
  activeCategory = e.target.dataset.cat;
  renderFilters();
  renderProducts();
});
$("search").addEventListener("input", (e) => { searchTerm = e.target.value; renderProducts(); });
$("sort").addEventListener("change", (e) => { sortMode = e.target.value; renderProducts(); });
$("product-grid").addEventListener("click", (e) => {
  if (e.target.dataset.id) addToCart(Number(e.target.dataset.id));
});
$("cart-items").addEventListener("click", (e) => {
  const d = e.target.dataset;
  if (d.qty) changeQty(Number(d.id), Number(d.qty));
  if (d.remove) changeQty(Number(d.remove), -Infinity);
});
$("cart-toggle").addEventListener("click", () => toggleCart(true));
$("cart-close").addEventListener("click", () => toggleCart(false));
$("overlay").addEventListener("click", () => toggleCart(false));
$("checkout").addEventListener("click", checkout);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleCart(false); });

// ---------- Init ----------
renderFilters();
renderProducts();
updateCart();
