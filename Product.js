// Get URL parameters
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
console.log("Product ID from URL:", id);

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

// Initialize page
async function initPage() {
    const db = await loadDB();
    
    if (!db) return;

    updateCartBadge();

    // Find the product
    const product = db.products.find(p => p.id == id);
    
    if (!product) {
        console.error("Product not found!");
        document.querySelector(".product-detail").innerHTML = 
            "<h2>Product not found</h2><p>The product you're looking for doesn't exist.</p>";
        return;
    }
    
    console.log("Product found:", product);

    // Populate data
    const productImage = document.getElementById("productImage");
    
    // Handle different possible image formats
    if (product.images && product.images.length > 0) {
        productImage.src = product.images[0];
    } else if (product.image) {
        productImage.src = product.image;
    } else {
        productImage.src = "placeholder.jpg"; // fallback
        productImage.alt = "No image available";
    }
    
    productImage.onerror = function() {
        console.error("Image failed to load:", this.src);
        this.src = "placeholder.jpg"; // fallback if image doesn't load
    };

    document.getElementById("productName").textContent = product.name;
    document.getElementById("productBrand").textContent = product.brand;
    document.getElementById("productPrice").textContent = `$${product.price.toFixed(2)}`;
    document.getElementById("productSKU").textContent = product.sku;
    document.getElementById("productDescription").textContent = product.description;

    // Display star rating
    const starRating = Math.round(product.reviews_star_average || 0);
    const stars = "⭐".repeat(starRating) + "☆".repeat(5 - starRating);
    document.getElementById("productStars").textContent = stars;
    document.getElementById("productRating").textContent = 
        `${product.reviews_star_average || 0} out of 5 stars (${product.reviews_count || 0} reviews)`;

    // Set button data
    document.getElementById("productBtn").dataset.id = product.id;
    document.getElementById("wishlistBtn").dataset.id = product.id;

    // Stock status
    const stockStatus = document.getElementById("stockStatus");
    if (product.inStock) {
        stockStatus.textContent = "✓ In Stock";
        stockStatus.style.color = "green";
    } else {
        stockStatus.textContent = "✗ Out of Stock";
        stockStatus.style.color = "red";
        document.getElementById("productBtn").disabled = true;
    }

    // Check wishlist status
    updateWishlistButton();
}

// Add to cart functionality
document.getElementById("productBtn").addEventListener('click', (e) => {
    const productId = Number(e.target.dataset.id);
    addToCart(productId, 1);
});

// Wishlist functionality
document.getElementById("wishlistBtn").addEventListener('click', (e) => {
    const productId = Number(e.target.dataset.id);
    toggleWishlist(productId);
});

// Cart functions
function addToCart(productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += quantity;
    } else {
        cart.push({ id: productId, qty: quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart:", cart);
    alert("Added to cart!");

    updateCartBadge();
}

function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    const badge = document.getElementById("cart-qty");
    if (badge) {
        badge.textContent = totalQty;
    }
}

// Wishlist functions
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        alert("Removed from wishlist!");
    } else {
        wishlist.push(productId);
        alert("Added to wishlist!");
    }
    
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistButton();
}

function updateWishlistButton() {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const productId = Number(document.getElementById("wishlistBtn").dataset.id);
    const icon = document.getElementById("wishlistIcon");
    const btn = document.getElementById("wishlistBtn");
    
    if (wishlist.includes(productId)) {
        icon.textContent = "❤️";
        btn.innerHTML = `<span id="wishlistIcon">❤️</span> Remove from Wishlist`;
    } else {
        icon.textContent = "🤍";
        btn.innerHTML = `<span id="wishlistIcon">🤍</span> Add to Wishlist`;
    }
}

// Initialize the page
initPage();