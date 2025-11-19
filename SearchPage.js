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

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const productSection = document.getElementById('product-section');
const searchResults = document.getElementById('searchResults');

// Search function
function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        searchResults.innerHTML = '<p class="search-message">Please enter a search term</p>';
        productSection.innerHTML = '';
        return;
    }

    const filteredProducts = db.products.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.brand.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
    });

    if (filteredProducts.length === 0) {
        searchResults.innerHTML = `<p class="search-message">No products found for "${searchTerm}"</p>`;
        productSection.innerHTML = '';
        return;
    }

    searchResults.innerHTML = `<p class="search-message">Found ${filteredProducts.length} product(s) for "${searchTerm}"</p>`;
    displayProducts(filteredProducts);
}

// Display products
function displayProducts(products) {
    productSection.innerHTML = '';

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

        productSection.appendChild(productDiv);
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

// Event listeners
searchBtn.addEventListener('click', searchProducts);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchProducts();
    }
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
    badge.textContent = totalQty;
}