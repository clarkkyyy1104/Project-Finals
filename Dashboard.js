// Load database
async function loadDB() {
    const response = await fetch("db.json");
    const db = await response.json();
    console.log(db);
    return db;
}

const db = await loadDB();

// Update cart badge
updateCartBadge();

// Get filter elements
let filter_section = document.getElementById('filter-section');
let product_section = document.getElementById('product-section');

// Note: Filter options are now manually added in HTML
// No need to populate them dynamically

// Filter products
function filterProducts() {
    const selectedBrand = document.getElementById('filter-brand').value;
    const selectedCategory = document.getElementById('filter-category').value;
    const selectedPrice = document.getElementById('filter-price').value;

    let filteredProducts = db.products;

    // Filter by brand
    if (selectedBrand) {
        filteredProducts = filteredProducts.filter(p => p.brand === selectedBrand);
    }

    // Filter by category
    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
    }

    // Filter by price
    if (selectedPrice) {
        const [min, max] = selectedPrice.split('-').map(Number);
        filteredProducts = filteredProducts.filter(p => {
            if (max) {
                return p.price >= min && p.price <= max;
            } else {
                return p.price >= min;
            }
        });
    }

    // Display filtered products
    displayProducts(filteredProducts);
    
    // Update product count
    const productCount = document.getElementById('product-count');
    if (productCount) {
        productCount.textContent = filteredProducts.length;
    }
}

// Display products
function displayProducts(products) {
    product_section.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        
        const isInWishlist = checkWishlist(product.id);
        const heartIcon = isInWishlist ? '❤️' : '🤍';
        
        productDiv.innerHTML = `
            <button class="wishlist-btn" data-id="${product.id}">${heartIcon}</button>
            <img src="${product.images[0]}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="brand">${product.brand}</p>
            <p class="price">${product.price.toFixed(2)}</p>
            <p class="rating">⭐ ${product.reviews_star_average} (${product.reviews_count} reviews)</p>
            <button class="addToCartBtn" data-id="${product.id}">Add to Cart</button>
            <a href="Product.html?id=${product.id}" class="view-details">View Details</a>
        `;

        product_section.appendChild(productDiv);
    });

    // Add event listeners to wishlist buttons
    const wishlistButtons = document.getElementsByClassName('wishlist-btn');
    for (let btn of wishlistButtons) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = Number(e.target.dataset.id);
            toggleWishlist(productId);
            displayProducts(products);
        });
    }

    // Add event listeners to all Add to Cart buttons
    const addToCartButtons = document.getElementsByClassName('addToCartBtn');
    for (let btn of addToCartButtons) {
        btn.addEventListener('click', (e) => {
            const productId = Number(e.target.dataset.id);
            addToCart(productId, 1);
        });
    }
}

// Add filter event listeners
document.getElementById('filter-brand').addEventListener('change', filterProducts);
document.getElementById('filter-category').addEventListener('change', filterProducts);
document.getElementById('filter-price').addEventListener('change', filterProducts);

// Initial display
displayProducts(db.products);

// Update initial product count
const productCount = document.getElementById('product-count');
if (productCount) {
    productCount.textContent = db.products.length;
}

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
    badge.textContent = totalQty;
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
}

function checkWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    return wishlist.includes(productId);
}