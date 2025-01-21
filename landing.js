
  // State
let products = [];
let cart = [];
let currentDetailProduct = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartOverlay = document.getElementById('cartOverlay');
const searchOverlay = document.getElementById('searchOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const searchInput = document.getElementById('searchInput');
const detailOverlay = document.getElementById('detailOverlay');

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

    const randomProducts = productsToRender
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);

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
                <button class="view-details" onclick="openDetailPage(${product.id})">
                    View Details
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
    showNotification(`${product.name} added to cart!`);
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
        background-color: #00A884;
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

// Add detail page toggle functions
function openDetailPage(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    currentDetailProduct = product;
    renderDetailPage(product);
    detailOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDetailPage() {
    detailOverlay.classList.remove('open');
    document.body.style.overflow = '';
    currentDetailProduct = null;
}

function renderDetailPage(product) {
    const stockPercentage = (product.stock / 50) * 100;
    const stockStatus = product.stock > 0 ? 
        `${product.stock} items left in stock` : 
        'Out of stock';
    const stockBarColor = product.stock > 10 ? '#4CAF50' : 
                         product.stock > 5 ? '#FFA500' : 
                         '#FF0000';

    detailOverlay.innerHTML = `
        <div class="detail-content">
            <button id="closeDetail" class="close-button">
                <i class="fas fa-times"></i>
            </button>
            <div class="detail-grid">
                <div class="detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="detail-info">
                    <h2>${product.name}</h2>
                    <div class="detail-pricing">
                        <span class="current-price">$${product.price}</span>
                        <span class="old-price">$${product.oldPrice}</span>
                    </div>
                    <div class="detail-rating">
                        ${renderStars(product.rating)}
                        <span>(${product.rating} / 5)</span>
                    </div>
                    <p class="product-description">${product.details.description}</p>
                    
                    <div class="stock-info">
                        <div class="stock-bar-container">
                            <div class="stock-bar" style="width: ${stockPercentage}%; background-color: ${stockBarColor}"></div>
                        </div>
                        <span class="stock-text">${stockStatus}</span>
                    </div>

                    <div class="product-details-section">
                        <div class="material-care">
                            <h3>Material & Care</h3>
                            <p><strong>Material:</strong> ${product.details.material}</p>
                            <p><strong>Care:</strong> ${product.details.care}</p>
                        </div>
                        
                        <div class="features-section">
                            <h3>Key Features</h3>
                            <ul>
                                ${product.details.features.map(feature => `
                                    <li>${feature}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="specifications-section">
                            <h3>Specifications</h3>
                            <div class="specs-grid">
                                ${Object.entries(product.details.specifications).map(([key, value]) => `
                                    <div class="spec-item">
                                        <span class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                        <span class="spec-value">${value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="detail-colors">
                        <h3>Available Colors</h3>
                        <div class="color-options">
                            ${product.colors.map(color => `
                                <button class="color-option" style="background-color: ${color}" data-color="${color}"></button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="detail-sizes">
                        <h3>Available Sizes</h3>
                        <div class="size-options">
                            ${product.sizes.map(size => `
                                <button class="size-option" data-size="${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                    <button class="add-to-cart-detail" data-id="${product.id}">                    <i class="fas fa-shopping-cart"></i> 
                        Add to Cart
                    </button>
                    
                </div>
            </div>
        </div>
    `;


    // Add event listeners
    document.getElementById('closeDetail').addEventListener('click', closeDetailPage);
    detailOverlay.addEventListener('click', (e) => {
        if (e.target === detailOverlay) closeDetailPage();
    });

    // Add size selection listeners
    detailOverlay.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', function() {
            detailOverlay.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Add to cart listener
    detailOverlay.querySelector('.add-to-cart-detail').addEventListener('click', function() {
        const selectedSize = detailOverlay.querySelector('.size-option.selected');
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(product.id, selectedSize.dataset.size);
    });
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
        ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
    `;
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
