
        let products = [];
        let cart = [];

        // Fetch product data
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                products = data;
                displayProducts(products);
            });

        function displayProducts(productsToShow) {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = '';
            productsToShow.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <div class="star-rating">
                    ${createStarRating(product.rating)}
                </div>
                <div class="price-info">
                   <span class="old-price">$${product.oldPrice}</span>
                    <span class="new-price">$${product.price}</span>
                </div>
                    <div class="stock-indicator" style="width: ${(product.stock / 100) * 100}%"></div>
                    <p><span class="stock-count">${product.stock}</span> in stock</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                `;
                grid.appendChild(card);
            });
            
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', addToCart);
            });
        }
        
        function createStarRating(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '';
            
            for (let i = 0; i < fullStars; i++) {
                stars += '<i class="fas fa-star"></i>';
            }
            if (hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            }
            return stars;
        }
        

        
        function addToCart(event) {
            const productId = event.target.getAttribute('data-id');
            const product = products.find(p => p.id === productId);
            if (product && product.stock > 0) {
                const existingItem = cart.find(item => item.id === productId);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({...product, quantity: 1});
                }
                product.stock--;
                updateProductDisplay(product);
                updateCartCount();
                showAlert();
            }
        }

        function updateProductDisplay(product) {
            const productCard = document.querySelector(`.product-card .add-to-cart[data-id="${product.id}"]`).closest('.product-card');
            productCard.querySelector('.stock-indicator').style.width = `${(product.stock / 100) * 100}%`;
            productCard.querySelector('.stock-count').textContent = product.stock;
        }

        function updateCartCount() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cart-count').textContent = totalItems;
        }

        function showAlert() {
            const alert = document.getElementById('alert');
            alert.style.display = 'block';
            setTimeout(() => {
                alert.style.display = 'none';
            }, 2000);
        }

        function showCart() {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = '';
            let total = 0;
            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                `;
                cartItems.appendChild(li);
                total += item.price * item.quantity;
            });
            document.getElementById('cart-total').textContent = total.toFixed(2);
            document.getElementById('cart-page').style.display = 'block';

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', removeFromCart);
            });

            document.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', updateQuantity);
            });
        }

        function removeFromCart(event) {
            const productId = event.target.getAttribute('data-id');
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                const product = products.find(p => p.id === productId);
                product.stock += cartItem.quantity;
                updateProductDisplay(product);
                cart = cart.filter(item => item.id !== productId);
                showCart();
                updateCartCount();
            }
        }

        function updateQuantity(event) {
            const productId = event.target.getAttribute('data-id');
            const isIncrement = event.target.classList.contains('plus');
            const cartItem = cart.find(item => item.id === productId);
            const product = products.find(p => p.id === productId);

            if (cartItem) {
                if (isIncrement && product.stock > 0) {
                    cartItem.quantity++;
                    product.stock--;
                } else if (!isIncrement && cartItem.quantity > 1) {
                    cartItem.quantity--;
                    product.stock++;
                } else if (!isIncrement && cartItem.quantity === 1) {
                    cart = cart.filter(item => item.id !== productId);
                    product.stock++;
                }

                updateProductDisplay(product);
                showCart();
                updateCartCount();
            }
        }

        // Event listeners
        document.getElementById('search-icon').addEventListener('click', () => {
            document.getElementById('search-bar').style.display = 'block';
        });

        document.getElementById('cart-icon').addEventListener('click', showCart);

        document.querySelectorAll('.close').forEach(closeButton => {
            closeButton.addEventListener('click', () => {
                closeButton.closest('div[id$="-page"], div[id$="-bar"]').style.display = 'none';
            });
        });

        document.getElementById('close-cart').addEventListener('click', () => {
            document.getElementById('cart-page').style.display = 'none';
        });

        document.getElementById('search-input').addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
            displayProducts(filteredProducts);
        });

        document.querySelectorAll('#menu a').forEach(link => {
            link.addEventListener('click', (event) => {
                const category = event.target.getAttribute('data-category');
                const filteredProducts = products.filter(product => product.category === category);
                displayProducts(filteredProducts);
                document.getElementById('current-category').textContent = category.charAt(0).toUpperCase() + category.slice(1);
                document.getElementById('menu').style.display = 'none';
            });
        });
        
                // Add smooth scroll to top functionality for footer links
        document.querySelectorAll('footer a[href="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });
      
      
        function initializeMenus() {
            const hamburger = document.querySelector('.hamburger');
            const sideMenu = document.querySelector('.side-menu');
            const closeBtn = document.querySelector('.close-btn');
            const overlay = document.querySelector('.overlay');

            function openMenu() {
                sideMenu.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeMenu() {
                sideMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            hamburger.addEventListener('click', openMenu);
            closeBtn.addEventListener('click', closeMenu);
            overlay.addEventListener('click', closeMenu);

            // Close menu on escape key press
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
                    closeMenu();
                }
            });
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', initializeMenus);
        
