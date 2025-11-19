// Load database
async function loadDB() {
    try {
        const response = await fetch("db.json");
        if (!response.ok) {
            throw new Error("Failed to load database");
        }
        const db = await response.json();
        console.log("Database loaded:", db);
        return db;
    } catch (error) {
        console.error("Error loading database:", error);
        alert("Error loading product data. Please try again.");
        return null;
    }
}

// Global variable for database
let db = null;

// Initialize the cart page
async function initCart() {
    db = await loadDB();
    
    if (!db) {
        document.getElementById('cart-items').innerHTML = `
            <div class="empty-cart">
                <h2>Error loading cart</h2>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
        return;
    }

    // Update cart badge
    updateCartBadge();
    
    // Display cart items
    displayCart();
}

const cartItemsDiv = document.getElementById('cart-items');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

// Load and display cart
function displayCart() {
    if (!db) {
        console.error("Database not loaded yet!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
                <a href="Dashboard.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;
        updateSummary(0, 0, 0, 0);
        return;
    }

    cartItemsDiv.innerHTML = '';

    cart.forEach(item => {
        const product = db.products.find(p => p.id === item.id);
        if (!product) {
            console.error(`Product not found for ID: ${item.id}`);
            return;
        }

        const itemTotal = product.price * item.qty;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        
        // Get the image source, with fallback
        const imageSrc = product.images && product.images.length > 0 
            ? product.images[0] 
            : (product.image || 'placeholder.jpg');

        cartItemDiv.innerHTML = `
            <img src="${imageSrc}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
            <div class="item-details">
                <h3>${product.name}</h3>
                <p class="brand">${product.brand}</p>
                <p class="item-price">₱${product.price.toFixed(2)}</p>
            </div>
            <div class="item-quantity">
                <button class="qty-btn minus-btn" data-id="${product.id}">-</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn plus-btn" data-id="${product.id}">+</button>
            </div>
            <div class="item-total">₱${itemTotal.toFixed(2)}</div>
            <button class="remove-btn" data-id="${product.id}">🗑️</button>
        `;

        cartItemsDiv.appendChild(cartItemDiv);
    });

    // Add event listeners for quantity buttons
    const minusBtns = document.getElementsByClassName('minus-btn');
    for (let btn of minusBtns) {
        btn.addEventListener('click', (e) => {
            const productId = Number(e.target.dataset.id);
            updateQuantity(productId, -1);
        });
    }

    const plusBtns = document.getElementsByClassName('plus-btn');
    for (let btn of plusBtns) {
        btn.addEventListener('click', (e) => {
            const productId = Number(e.target.dataset.id);
            updateQuantity(productId, 1);
        });
    }

    // Add event listeners for remove buttons
    const removeBtns = document.getElementsByClassName('remove-btn');
    for (let btn of removeBtns) {
        btn.addEventListener('click', (e) => {
            const productId = Number(e.target.dataset.id);
            removeFromCart(productId);
        });
    }

    calculateSummary();
}

// Update quantity
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(i => i.id === productId);

    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(productId);
            return;
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
        updateCartBadge();
    }
}

// Remove from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    updateCartBadge();
}

// Calculate summary
function calculateSummary() {
    if (!db) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = 0;

    cart.forEach(item => {
        const product = db.products.find(p => p.id === item.id);
        if (product) {
            subtotal += product.price * item.qty;
        }
    });

    const shipping = subtotal > 0 ? 200 : 0; // ₱200 shipping
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    updateSummary(subtotal, shipping, tax, total);
}

// Update summary display
function updateSummary(subtotal, shipping, tax, total) {
    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `₱${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `₱${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
}

// Update cart badge
function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    const badge = document.getElementById("cart-qty");
    if (badge) {
        badge.textContent = totalQty;
    }
}

// Checkout button
checkoutBtn.addEventListener('click', () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    alert("Checkout functionality coming soon!");
});

// Clear cart button
clearCartBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your cart?")) {
        localStorage.removeItem("cart");
        displayCart();
        updateCartBadge();
        alert("Cart cleared!");
    }
});

// Initialize cart when page loads
initCart();