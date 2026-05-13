const API_URL = "http://localhost:5000/api";
let cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadProducts() {
  const res = await fetch(`${API_URL}/products`);
  const products = await res.json();

  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image}" width="150" />
      <h3>${p.name}</h3>
      <p>Price: ₹${p.price}</p>
      <button onclick="addToCart('${p._id}', '${p.name}', ${p.price})">Add to Cart</button>
    `;
    list.appendChild(div);
  });
}

function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);

  if (existing) existing.quantity += 1;
  else cart.push({ id, name, price, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function showCart() {
  const cartList = document.getElementById("cartList");
  if (!cartList) return;

  cartList.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>₹${item.price} x ${item.quantity}</p>
    `;
    cartList.appendChild(div);
  });

  document.getElementById("total").innerText = total;
}

async function checkout() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first!");
    return;
  }

  let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      items: cart.map(c => ({
        productId: c.id,
        name: c.name,
        price: c.price,
        quantity: c.quantity
      })),
      totalAmount
    })
  });

  const data = await res.json();

  if (data.order) {
    alert("Order placed successfully!");
    cart = [];
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  } else {
    alert("Checkout failed!");
  }
}
