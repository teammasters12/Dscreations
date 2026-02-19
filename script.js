// ===== GLOBAL VARIABLES =====
let cart = [];
let currentTemplate = null;

// ===== LOAD CART FROM LOCAL STORAGE =====
function loadCart() {
    const savedCart = localStorage.getItem('dsCreationsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        if (window.location.pathname.includes('cart.html')) {
            displayCart();
        }
    }
}

// ===== SAVE CART TO LOCAL STORAGE =====
function saveCart() {
    localStorage.setItem('dsCreationsCart', JSON.stringify(cart));
    updateCartCount();
}

// ===== UPDATE CART COUNT =====
function updateCartCount() {
    const cartCounts = document.querySelectorAll('.cart-count');
    const mobileCartBadges = document.querySelectorAll('.mobile-cart-badge');
    
    cartCounts.forEach(count => {
        count.textContent = cart.length;
    });
    
    mobileCartBadges.forEach(badge => {
        badge.textContent = cart.length;
        if (cart.length > 0) {
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// ===== MOBILE MENU TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    loadCart();
});

// ===== SHOP PAGE - TEMPLATE FILTERING =====
const filterButtons = document.querySelectorAll('.filter-btn');
const templateCards = document.querySelectorAll('.template-card');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        
        templateCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ===== CUSTOMIZER MODAL =====
function openCustomizer(templateName, category) {
    currentTemplate = { name: templateName, category: category };
    const modal = document.getElementById('customizerModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = `Customize ${templateName}`;
    modal.style.display = 'block';
    
    // Reset selections
    document.querySelector('input[name="package"][value="little"]').checked = true;
    document.querySelector('input[name="color"][value="#663300"]').checked = true;
    document.querySelector('input[name="logo"][value="default"]').checked = true;
}

function closeCustomizer() {
    const modal = document.getElementById('customizerModal');
    modal.style.display = 'none';
    currentTemplate = null;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const customizerModal = document.getElementById('customizerModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === customizerModal) {
        closeCustomizer();
    }
    if (event.target === checkoutModal) {
        closeCheckout();
    }
    if (event.target === successModal) {
        closeSuccess();
    }
}

// Close button handlers
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
    });
});

// ===== ADD TO CART =====
function addToCart() {
    if (!currentTemplate) return;
    
    const selectedPackage = document.querySelector('input[name="package"]:checked').value;
    const selectedColor = document.querySelector('input[name="color"]:checked').value;
    const selectedLogo = document.querySelector('input[name="logo"]:checked').value;
    
    const prices = {
        little: 9000,
        medium: 12000,
        huge: 15000
    };
    
    const packageNames = {
        little: 'Little Pack',
        medium: 'Medium Pack',
        huge: 'Huge Pack'
    };
    
    const item = {
        id: Date.now(),
        template: currentTemplate.name,
        category: currentTemplate.category,
        package: packageNames[selectedPackage],
        packageType: selectedPackage,
        color: selectedColor,
        logo: selectedLogo,
        price: prices[selectedPackage]
    };
    
    cart.push(item);
    saveCart();
    closeCustomizer();
    
    // Show success message
    alert(`${currentTemplate.name} added to cart successfully!`);
}

// ===== DISPLAY CART =====
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyCart = document.getElementById('emptyCart');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCart.style.display = 'block';
        subtotalElement.textContent = '0/=';
        taxElement.textContent = '0/=';
        totalElement.textContent = '0/=';
        return;
    }
    
    emptyCart.style.display = 'none';
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-preview" style="background: linear-gradient(135deg, ${item.color}, #ff9933);"></div>
                <div class="cart-item-details">
                    <h3>${item.template}</h3>
                    <div class="cart-item-meta">
                        <span>📦 ${item.package}</span>
                        <span>🎨 Custom Color</span>
                        <span>🏷️ ${item.category}</span>
                    </div>
                    <div class="cart-item-price">${item.price.toLocaleString()}/=</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    
    const tax = 0; // No tax
    const total = subtotal + tax;
    
    subtotalElement.textContent = `${subtotal.toLocaleString()}/=`;
    taxElement.textContent = `${tax.toLocaleString()}/=`;
    totalElement.textContent = `${total.toLocaleString()}/=`;
}

// ===== REMOVE FROM CART =====
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    displayCart();
}

// ===== CHECKOUT =====
function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    checkoutTotal.textContent = `${total.toLocaleString()}/=`;
    
    modal.style.display = 'block';
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'none';
}

// ===== FORM VALIDATION & SUBMISSION =====
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const company = document.getElementById('company').value || 'N/A';
        const requirements = document.getElementById('requirements').value || 'None';
        
        // Validate required fields
        if (!fullName || !email || !phone) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // Prepare order details for WhatsApp
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        
        let orderDetails = `*NEW ORDER - DS CREATIONS*%0A%0A`;
        orderDetails += `*Customer Details:*%0A`;
        orderDetails += `Name: ${fullName}%0A`;
        orderDetails += `Email: ${email}%0A`;
        orderDetails += `Phone: ${phone}%0A`;
        orderDetails += `Company: ${company}%0A%0A`;
        
        orderDetails += `*Order Items:*%0A`;
        cart.forEach((item, index) => {
            orderDetails += `${index + 1}. ${item.template}%0A`;
            orderDetails += `   - Package: ${item.package}%0A`;
            orderDetails += `   - Category: ${item.category}%0A`;
            orderDetails += `   - Price: ${item.price.toLocaleString()}/=%0A`;
        });
        
        orderDetails += `%0A*Total Amount: ${total.toLocaleString()}/=*%0A%0A`;
        orderDetails += `*Payment Method:* Bank Transfer%0A%0A`;
        orderDetails += `*Bank Details for Payment:*%0A`;
        orderDetails += `Account Number: 217200140028669%0A`;
        orderDetails += `Account Name: D T T Edirisingha%0A`;
        orderDetails += `Bank: Peoples Bank%0A`;
        orderDetails += `Branch: Mahara%0A%0A`;
        orderDetails += `*Additional Requirements:*%0A${requirements}%0A%0A`;
        orderDetails += `_Please send payment receipt after transfer_`;
        
        // WhatsApp number
        const whatsappNumber = '94703600072';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${orderDetails}`;
        
        // Close checkout modal
        closeCheckout();
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Show success modal
        const successModal = document.getElementById('successModal');
        successModal.style.display = 'block';
        
        // Clear cart
        cart = [];
        saveCart();
        
        // Reset form
        checkoutForm.reset();
    });
}

// ===== SUCCESS MODAL =====
function closeSuccess() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    window.location.href = 'index.html';
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== ANIMATION ON SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.feature-card, .package-card, .template-card, .reason-card').forEach(el => {
    observer.observe(el);
});

// ===== PRELOAD IMAGES =====
window.addEventListener('load', function() {
    // Add any image preloading logic here if needed
});

// ===== INITIALIZE =====
console.log('DS CREATIONS Website Loaded Successfully');
console.log('As You Wish - Your Digital Empire Awaits!');
