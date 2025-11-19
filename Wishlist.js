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

// Initialize the wishlist page
async function initWishlist() {
    db = await loadDB();
    
    if (!db) {
        document.getElementById('wishlist-section').innerHTML = `
            <div class="empty-wishlist">
                <h2>Error loading wishlist</h2>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
        return;
    }

    // Update cart badge
    updateCartBadge();
    
    // Display wishlist items
    displayWishlist();
}

// Display wishlist
function displayWishlist() {
    if (!db) {
        console.error("Database not loaded yet!");
        return;
    }

    const wishlistSection = document.getElementById('wishlist-section');
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    // Update page title with count
    const pageTitle = document.querySelector('.page-title');
    pageTitle.textContent = `My Wishlist (${wishlist.length} items)`;
    
    if (wishlist.length === 0) {
        wishlistSection.innerHTML = `
            <div class="empty-wishlist">
                <div class="empty-wishlist-icon">❤️</div>
                <h2>Your wishlist is empty</h2>
                <p>Start adding products you love!</p>
                <a href="Dashboard.html" class="continue-shopping">Explore Products</a>
            </div>
        `;
        return;
    }

    wishlistSection.innerHTML = '';

    wishlist.forEach(productId => {
        const product = db.products.find(p => p.id === productId);
        
        if (!product) {
            console.error(`Product not found for ID: ${productId}`);
            return;
        }

        const productDiv = document.createElement('div');
        productDiv.className = 'product-card wishlist-card';
        
        // Get the image source, with fallback
        const imageSrc = product.images && product.images.length > 0 
            ? product.images[0] 
            : (product.image || 'placeholder.jpg');

        productDiv.innerHTML = `
            <button class="wishlist-btn active" data-id="${product.id}" title="Remove from wishlist">❤️</button>
            <img src="${imageSrc}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
            <h3>${product.name}</h3>
            <p class="brand">${product.brand}</p>
            <p class="price">₱${product.price.toFixed(2)}</p>
            <p class="rating">⭐ ${product.reviews_star_average} (${product.reviews_count} reviews)</p>
            ${product.inStock 
                ? `<button class="addToCartBtn" data-id="${product.id}">Add to Cart</button>`
                : `<button class="addToCartBtn out-of-stock" disabled>Out of Stock</button>`
            }
            <a href="Product.html?id=${product.id}" class="view-details">View Details</a>
        `;

        wishlistSection.appendChild(productDiv);
    });

    // Add event listeners for wishlist buttons (remove)
    const wishlistButtons = document.getElementsByClassName('wishlist-btn');
    for (let btn of wishlistButtons) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = Number(e.target.dataset.id);
            removeFromWishlist(productId);
        });
    }

    // Add event listeners for Add to Cart buttons
    const addToCartButtons = document.getElementsByClassName('addToCartBtn');
    for (let btn of addToCartButtons) {
        if (!btn.disabled) {
            btn.addEventListener('click', (e) => {
                const productId = Number(e.target.dataset.id);
                addToCart(productId, 1);
            });
        }
    }
}

// Remove from wishlist
function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        
        // Show notification
        showNotification("Removed from wishlist", "success");
        
        // Refresh display
        displayWishlist();
    }
}

// Add to cart
function addToCart(productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += quantity;
    } else {
        cart.push({ id: productId, qty: quantity, selected: true });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart:", cart);
    
    // Show notification
    showNotification("Added to cart!", "success");

    updateCartBadge();
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

// Show notification
function showNotification(message, type = "info") {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize wishlist when page loads
initWishlist();