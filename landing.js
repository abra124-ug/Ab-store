
  // State
let products = [];
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartOverlay = document.getElementById('cartOverlay');
const searchOverlay = document.getElementById('searchOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const searchInput = document.getElementById('searchInput');

// Event Listeners
document.getElementById('cartBtn').addEventListener('click', toggleCart);
document.getElementById('closeCart').addEventListener('click', toggleCart);
document.getElementById('searchBtn').addEventListener('click', toggleSearch);
document.getElementById('closeSearch').addEventListener('click', toggleSearch);
cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) toggleCart();
});

// Fetch and initialize products
async function initializeStore() {
    try {
        const response = await fetch('dataxx.json');
        if (!response.ok) {
            throw new Error('Failed to fetch product data');
        }
        const data = await response.json();
        products = data.products;
        renderProducts(products);
        
        // Load cart from localStorage if available
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCart();
        }
    } catch (error) {
        console.error('Error initializing store:', error);
        productsGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
    }
}

function renderProducts(productsToRender = products) {
    if (!productsToRender.length) {
        productsGrid.innerHTML = '<p class="no-results">No products found</p>';
        return;
    }

    // Get 8 random products
    const randomProducts = productsToRender
        .sort(() => Math.random() - 0.5) // Shuffle the array
        .slice(0, 8); // Take first 8 items

    productsGrid.innerHTML = randomProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price}</span>
                    <span class="old-price">$${product.oldPrice}</span>
                </div>
                <div class="product-meta">
                    <div class="color-options">
                        ${product.colors.map(color => `
                            <button class="color-option" style="background-color: ${color}" data-color="${color}"></button>
                        `).join('')}
                    </div>
                    <div class="size-options">
                        ${product.sizes.map(size => `
                            <button class="size-option" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>
                <button class="add-to-cart" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    addProductEventListeners();
}

function addProductEventListeners() {
    // Size selection
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.size-options');
            parent.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = parseInt(this.dataset.id);
            const selectedSize = productCard.querySelector('.size-option.selected');
            
            if (!selectedSize) {
                alert('Please select a size');
                return;
            }

            addToCart(productId, selectedSize.dataset.size);
        });
    });
}

function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId && item.size === size);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            size,
            quantity: 1
        });
    }

    updateCart();
    saveCartToLocalStorage();
    
    // Show alert instead of opening cart
    showNotification(`${product.name} has been added to your cart!`);
}

// Add this new function for showing notifications
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add styles for the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add the notification to the document
    document.body.appendChild(notification);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add these CSS animations to your stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

function updateCart() {
    // Update cart items
    cartItems.innerHTML = cart.length ? cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-content">
                <h3 class="cart-item-title">${item.name}</h3>
                <p>Size: ${item.size}</p>
                <span class="cart-item-price">$${item.price}</span>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.size}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, '${item.size}', 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id}, '${item.size}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('') : '<p class="empty-cart">Your cart is empty</p>';

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Update cart count
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = itemCount;
}

function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        updateCart();
        saveCartToLocalStorage();
    }
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    updateCart();
    saveCartToLocalStorage();
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function toggleCart() {
    cartOverlay.classList.toggle('open');
    document.body.style.overflow = cartOverlay.classList.contains('open') ? 'hidden' : '';
}

function toggleSearch() {
    searchOverlay.classList.toggle('open');
    if (searchOverlay.classList.contains('open')) {
        searchInput.focus();
    }
}

// Search functionality
searchInput.addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}, 300));

// Utility function for debouncing search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add this to your existing JavaScript
function renderSearchResults(products) {
    const searchResults = document.getElementById('searchResults');
    
    if (!products.length) {
        searchResults.innerHTML = '<p class="search-no-results">No products found</p>';
        return;
    }

    searchResults.innerHTML = `
        <div class="products-grid">
            ${products.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-details">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">
                            <span class="current-price">$${product.price}</span>
                            ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                        </div>
                        <button class="add-to-cart" data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Re-attach event listeners for the search results
    const searchResultsAddToCartButtons = searchResults.querySelectorAll('.add-to-cart');
    searchResultsAddToCartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId, 'M'); // Default size, you might want to handle this differently
            toggleSearch(); // Close search after adding to cart
        });
    });
}

// Update your search input event listener
searchInput.addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderSearchResults(filteredProducts);
}, 300));

// Clear search results when closing search overlay
document.getElementById('closeSearch').addEventListener('click', () => {
    document.getElementById('searchResults').innerHTML = '';
    searchInput.value = '';
});

// Initialize the store
document.addEventListener('DOMContentLoaded', initializeStore);
