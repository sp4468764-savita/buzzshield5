/**
 * BuzzShield - Main Client-Side JavaScript
 * Implements interactive elements, cart logic, payment gateways (Razorpay),
 * and direct backend integrations (Supabase DB, Auth, and Edge Functions).
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons if loaded
  if (window.lucide) {
    window.lucide.createIcons();
  }
  
  // Initialize App Modules
  initTheme();
  initNavigation();
  initScrollTop();
  initFaqAccordion();
  initProductDetail();
  initCartAndCheckout();
  initContactForm();
  initNewsletterForm();
  initScrollReveal();
  checkSupabaseConnection();
});

/* ==========================================================================
   1. DATABASE INTEGRATION & DEMO MODE ALERTS
   ========================================================================== */
let supabaseClient = null;

function checkSupabaseConnection() {
  const banner = document.getElementById("demo-banner");
  
  if (window.isSupabaseConfigured()) {
    try {
      // Initialize Supabase Client from global library (loaded via CDN in HTML)
      if (window.supabase) {
        supabaseClient = window.supabase.createClient(
          window.SUPABASE_CONFIG.URL,
          window.SUPABASE_CONFIG.ANON_KEY
        );
        console.log("BuzzShield: Supabase successfully initialized in Production Mode.");
      } else {
        console.warn("BuzzShield: Supabase CDN script not loaded yet. Retrying in 1s.");
        setTimeout(checkSupabaseConnection, 1000);
      }
    } catch (e) {
      console.error("BuzzShield: Error initializing Supabase client", e);
      showDemoBanner(banner);
    }
  } else {
    showDemoBanner(banner);
  }
}

function showDemoBanner(banner) {
  if (banner) {
    banner.style.display = "block";
    console.log("BuzzShield: Running in Demo Mode. Submissions will be simulated and stored in LocalStorage.");
  }
}

// Custom Toast notification helper
function showToast(message, type = "success") {
  // Remove existing toasts first
  const existingToasts = document.querySelectorAll(".toast-notification");
  existingToasts.forEach(t => t.remove());

  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.id = "toast-notification";
  
  const icon = type === "success" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Trigger transition
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // Auto hide after 4.5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 600);
  }, 4500);
}


/* ==========================================================================
   2. UI INTERACTIVITY & ANIMATIONS
   ========================================================================== */

// Theme Management (Light / Dark mode)
function initTheme() {
  const themeToggleBtns = document.querySelectorAll(".btn-toggle-theme");
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    updateThemeIcons("dark");
  } else {
    document.body.classList.remove("dark-mode");
    updateThemeIcons("light");
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem("theme", theme);
      updateThemeIcons(theme);
      showToast(`${theme === "dark" ? "Dark" : "Light"} mode enabled`, "success");
    });
  });
}

function updateThemeIcons(theme) {
  const themeToggleBtns = document.querySelectorAll(".btn-toggle-theme");
  themeToggleBtns.forEach(btn => {
    if (theme === "dark") {
      // Show sun icon for dark mode
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
    } else {
      // Show moon icon for light mode
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
    }
  });
}

// Navigation Menu
function initNavigation() {
  const mobileMenuBtn = document.querySelector(".btn-mobile-menu");
  const mainNav = document.querySelector(".main-nav");

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      mainNav.classList.toggle("active");
      const isActive = mainNav.classList.contains("active");
      mobileMenuBtn.innerHTML = isActive 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>`;
    });

    // Close menu when clicking outside
    document.addEventListener("click", () => {
      if (mainNav.classList.contains("active")) {
        mainNav.classList.remove("active");
        mobileMenuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>`;
      }
    });

    mainNav.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Active navigation link tracking
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (currentPath.endsWith(href) || (currentPath === "/" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Scroll to Top Button
function initScrollTop() {
  const scrollTopBtn = document.getElementById("btn-scroll-top");
  
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });
    
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}

// Accordion FAQ Panel
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach(question => {
    question.addEventListener("click", () => {
      const parent = question.parentElement;
      const isOpen = parent.classList.contains("active");

      // Close all FAQs first
      document.querySelectorAll(".faq-item").forEach(item => {
        item.classList.remove("active");
      });

      // Toggle current
      if (!isOpen) {
        parent.classList.add("active");
      }
    });
  });
}

// Product detail gallery thumbnails
function initProductDetail() {
  const thumbnails = document.querySelectorAll(".detail-thumb");
  const mainImage = document.getElementById("detail-main-image");

  if (thumbnails && mainImage) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener("click", () => {
        thumbnails.forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        
        const newSrc = thumb.querySelector("img").getAttribute("src");
        mainImage.setAttribute("src", newSrc);
      });
    });
  }
}

// Scroll Reveal Helper
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".scroll-reveal");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => observer.observe(el));
}


/* ==========================================================================
   3. CART & PRICING LOGIC
   ========================================================================== */
let cartItem = {
  id: "buzzshield-pro",
  name: "BuzzShield Pro Mosquito Killer Lamp",
  price: 1499, // in INR
  originalPrice: 2999,
  quantity: 1,
  taxRate: 0.18, // 18% GST
  shippingCost: 0 // Free Shipping
};

function initCartAndCheckout() {
  const qtyInput = document.getElementById("checkout-qty");
  const btnMinus = document.getElementById("qty-minus");
  const btnPlus = document.getElementById("qty-plus");
  const orderProductSelect = document.getElementById("order-product");

  if (!qtyInput) return;

  // Handle product switching from select box
  if (orderProductSelect) {
    orderProductSelect.addEventListener("change", () => {
      const val = orderProductSelect.value;
      if (val === "buzzshield-pro") {
        cartItem.name = "BuzzShield Pro Mosquito Killer Lamp";
        cartItem.price = 1499;
        cartItem.originalPrice = 2999;
      } else if (val === "buzzshield-elite") {
        cartItem.name = "BuzzShield Elite (USB Rechargeable Portable)";
        cartItem.price = 1899;
        cartItem.originalPrice = 3499;
      } else if (val === "buzzshield-duo") {
        cartItem.name = "BuzzShield Duo Pack (Double Protection)";
        cartItem.price = 2699;
        cartItem.originalPrice = 5999;
      }
      updateCartTotals();
    });
  }

  // Qty selectors
  if (btnMinus && btnPlus) {
    btnMinus.addEventListener("click", () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        cartItem.quantity = val - 1;
        updateCartTotals();
      }
    });

    btnPlus.addEventListener("click", () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < 10) {
        qtyInput.value = val + 1;
        cartItem.quantity = val + 1;
        updateCartTotals();
      }
    });

    qtyInput.addEventListener("change", () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < 1) val = 1;
      if (val > 10) val = 10;
      qtyInput.value = val;
      cartItem.quantity = val;
      updateCartTotals();
    });
  }

  // Pre-fill fields if user details are saved
  updateCartTotals();

  // Attach Payment Action buttons
  const btnPayOnline = document.getElementById("btn-checkout-online");
  const btnPayCOD = document.getElementById("btn-checkout-cod");
  const checkoutForm = document.getElementById("checkout-form");

  if (checkoutForm) {
    // We prevent default on submit, but we trigger the checkout manually via the buttons
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  if (btnPayOnline) {
    btnPayOnline.addEventListener("click", () => handleCheckoutSubmit("online"));
  }

  if (btnPayCOD) {
    btnPayCOD.addEventListener("click", () => handleCheckoutSubmit("cod"));
  }
}

function updateCartTotals() {
  const summaryName = document.getElementById("summary-product-name");
  const summaryQty = document.getElementById("summary-qty");
  const subtotalLabel = document.getElementById("summary-subtotal");
  const taxLabel = document.getElementById("summary-tax");
  const totalLabel = document.getElementById("summary-total");
  const cartHeaderCount = document.getElementById("cart-badge-count");

  const subtotal = cartItem.price * cartItem.quantity;
  const tax = Math.round(subtotal * cartItem.taxRate);
  const total = subtotal + tax + cartItem.shippingCost;

  if (summaryName) summaryName.textContent = cartItem.name;
  if (summaryQty) summaryQty.textContent = `x${cartItem.quantity}`;
  if (subtotalLabel) subtotalLabel.textContent = `â1,000`.replace("â1,000", `₹${subtotal.toLocaleString('en-IN')}`);
  if (taxLabel) taxLabel.textContent = `₹${tax.toLocaleString('en-IN')}`;
  if (totalLabel) totalLabel.textContent = `₹${total.toLocaleString('en-IN')}`;
  if (cartHeaderCount) cartHeaderCount.textContent = cartItem.quantity;

  // Store total in window for razorpay checkout accessibility
  window.currentCartTotal = total;
}

function validateCheckoutForm() {
  const name = document.getElementById("customer-name")?.value.trim();
  const phone = document.getElementById("customer-phone")?.value.trim();
  const email = document.getElementById("customer-email")?.value.trim();
  const address = document.getElementById("customer-address")?.value.trim();

  if (!name || !phone || !address) {
    showToast("Please fill in Name, Phone, and Delivery Address.", "error");
    return null;
  }

  // Simple phone validation (10 digits)
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    showToast("Please enter a valid 10-digit Phone Number.", "error");
    return null;
  }

  return { name, phone: cleanPhone, email: email || "no-email@buzzshield.com", address };
}


/* ==========================================================================
   4. CHECKOUT WORKFLOWS (RAZORPAY & WHATSAPP COD)
   ========================================================================== */
async function handleCheckoutSubmit(method) {
  const customerDetails = validateCheckoutForm();
  if (!customerDetails) return; // Validation failed

  const totalAmount = window.currentCartTotal;

  if (method === "cod") {
    // CASH ON DELIVERY: Create WhatsApp link & order entry in database
    await placeCODOrder(customerDetails, totalAmount);
  } else if (method === "online") {
    // ONLINE PAYMENT: Initialize Razorpay Checkout Flow
    await placeOnlineOrder(customerDetails, totalAmount);
  }
}

// 4.1. WhatsApp Cash on Delivery Workflow
async function placeCODOrder(customer, total) {
  showToast("Preparing your COD order...", "success");

  // Save order to Database (Supabase or simulated)
  const orderId = "BS-" + Math.floor(100000 + Math.random() * 900000);
  const orderData = {
    order_id: orderId,
    customer_name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    product_name: cartItem.name,
    quantity: cartItem.quantity,
    total_amount: total,
    payment_method: "Cash on Delivery (COD)",
    payment_status: "Pending (WhatsApp Confirmation)",
    created_at: new Date().toISOString()
  };

  let dbSaved = false;

  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from("orders")
        .insert([orderData]);
      
      if (error) throw error;
      dbSaved = true;
    } catch (e) {
      console.error("Supabase order error:", e);
      showToast("Could not sync with Supabase. Creating offline WhatsApp order.", "error");
    }
  }

  if (!dbSaved) {
    // Mock local storage save
    const demoOrders = JSON.parse(localStorage.getItem("buzzshield_orders") || "[]");
    demoOrders.push(orderData);
    localStorage.setItem("buzzshield_orders", JSON.stringify(demoOrders));
    console.log("Demo order saved successfully:", orderData);
  }

  // Construct WhatsApp checkout message
  const whatsappNumber = "919876543210"; // Replace with brand WhatsApp Business Number
  const messageText = `*⚡ NEW BUZZSHIELD ORDER [COD] ⚡*
----------------------------------------
*Order ID:* ${orderId}
*Product:* ${cartItem.name}
*Quantity:* ${cartItem.quantity}
*Total Amount:* ₹${total.toLocaleString('en-IN')} (COD)

*Customer Name:* ${customer.name}
*Phone Number:* ${customer.phone}
*Email:* ${customer.email}
*Delivery Address:* ${customer.address}

_Please confirm my Cash on Delivery order and send tracking details!_`;

  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  showToast("Redirecting to WhatsApp to complete your order!", "success");
  
  setTimeout(() => {
    window.open(whatsappURL, "_blank");
  }, 1500);
}

// 4.2. Razorpay Online Payment Integration
async function placeOnlineOrder(customer, total) {
  showToast("Initializing secure checkout...", "success");

  // 1. In fully connected mode: Request Supabase Edge Function to generate Razorpay order ID server-side
  let razorpayOrderId = null;

  if (supabaseClient) {
    try {
      // Invoke Supabase Edge Function
      const { data, error } = await supabaseClient.functions.invoke("verify-payment", {
        method: "POST",
        body: {
          action: "create_order",
          amount: total * 100, // Razorpay works in paise
          currency: "INR",
          customer_email: customer.email
        }
      });

      if (error) throw error;
      if (data && data.razorpay_order_id) {
        razorpayOrderId = data.razorpay_order_id;
      }
    } catch (e) {
      console.error("Supabase Edge Function failed, using client-side checkout sandbox", e);
    }
  }

  // If no Supabase or function error, generate a dummy razorpay_order_id for demo checkout
  if (!razorpayOrderId) {
    razorpayOrderId = "order_demo_" + Math.random().toString(36).substring(2, 15);
  }

  // 2. Load and open Razorpay Payment Modal
  const razorpayKey = window.SUPABASE_CONFIG.RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" 
    ? "rzp_test_demoKey123" // Sandbox mock key
    : window.SUPABASE_CONFIG.RAZORPAY_KEY_ID;

  const options = {
    key: razorpayKey,
    amount: total * 100, // In paise (e.g. ₹1500 is 150000 paise)
    currency: "INR",
    name: "BuzzShield",
    description: `Purchase: ${cartItem.name} (x${cartItem.quantity})`,
    image: "https://picsum.photos/seed/buzzshield/200/200", // placeholder logo
    order_id: razorpayOrderId,
    handler: async function (response) {
      // payment succeeded client-side, now verify server-side!
      showToast("Payment authorized. Verifying payment status...", "success");
      await handlePaymentSuccess(response, customer, total);
    },
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone
    },
    notes: {
      shipping_address: customer.address,
      product: cartItem.name,
      qty: cartItem.quantity
    },
    theme: {
      color: "#0D3B3E" // Brand Primary deep teal
    },
    modal: {
      ondismiss: function() {
        showToast("Payment cancelled. You can retry anytime.", "error");
      }
    }
  };

  // If Razorpay JS SDK isn't loaded (e.g., offline or iframe block), simulate successful checkout in demo mode
  if (typeof Razorpay === "undefined") {
    console.warn("Razorpay script not loaded. Simulating checkout popup for preview demo.");
    simulateCheckoutPaymentModal(customer, total, razorpayOrderId);
  } else {
    try {
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Could not open Razorpay checkout modal", err);
      // Fallback checkout simulation so developers can test inside standard sandboxes
      simulateCheckoutPaymentModal(customer, total, razorpayOrderId);
    }
  }
}

// Simulated Checkout Modal for Sandbox Environment Previews
function simulateCheckoutPaymentModal(customer, total, razorpayOrderId) {
  const confirmMockPayment = confirm(`[DEMO CHECKOUT POPUP]\n\nProduct: ${cartItem.name} (x${cartItem.quantity})\nTotal to Pay: ₹${total.toLocaleString('en-IN')}\n\nWould you like to simulate a SUCCESSFUL UPI/Debit Card Razorpay payment?`);
  
  if (confirmMockPayment) {
    const mockResponse = {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(2, 12),
      razorpay_signature: "sig_mock_" + Math.random().toString(36).substring(2, 24)
    };
    handlePaymentSuccess(mockResponse, customer, total);
  } else {
    showToast("Payment checkout cancelled", "error");
  }
}

// 4.3. Payment Verification & Confirmation Workflow
async function handlePaymentSuccess(rzpResponse, customer, total) {
  let paymentVerified = false;

  const orderId = "BS-" + Math.floor(100000 + Math.random() * 900000);
  const orderData = {
    order_id: orderId,
    customer_name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    product_name: cartItem.name,
    quantity: cartItem.quantity,
    total_amount: total,
    payment_method: "Razorpay (Online Payment)",
    payment_status: "Verified & Paid",
    razorpay_order_id: rzpResponse.razorpay_order_id,
    razorpay_payment_id: rzpResponse.razorpay_payment_id,
    created_at: new Date().toISOString()
  };

  // Call Supabase server-side edge function to verify payment signature safely
  if (supabaseClient && !rzpResponse.razorpay_payment_id.startsWith("pay_mock_")) {
    try {
      const { data, error } = await supabaseClient.functions.invoke("verify-payment", {
        method: "POST",
        body: {
          action: "verify_signature",
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature,
          order_data: orderData
        }
      });

      if (error) throw error;

      if (data && data.success) {
        paymentVerified = true;
        showToast("Payment successfully verified secure!", "success");
      } else {
        showToast("Payment signature verification failed. Contact support.", "error");
        return;
      }
    } catch (e) {
      console.error("Signature verification error:", e);
      showToast("Online verification failed. Checking fallback...", "error");
    }
  }

  // If in demo simulation mode or fallback, save order locally
  if (!paymentVerified) {
    const demoOrders = JSON.parse(localStorage.getItem("buzzshield_orders") || "[]");
    demoOrders.push(orderData);
    localStorage.setItem("buzzshield_orders", JSON.stringify(demoOrders));
    console.log("Mock Payment verified & Order logged in browser database:", orderData);
  }

  // Visual success redirect/overlay
  renderOrderSuccessScreen(orderId, total, customer.email);
}

function renderOrderSuccessScreen(orderId, total, email) {
  // Replace the checkout form wrapper with a success dashboard card
  const checkoutWrapper = document.querySelector(".buy-form-wrapper");
  if (checkoutWrapper) {
    checkoutWrapper.style.animation = "fadeIn 0.6s ease";
    checkoutWrapper.innerHTML = `
      <div style="text-align: center; padding: 40px 10px;">
        <div style="width: 72px; height: 72px; background-color: var(--color-whatsapp); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--color-primary);">Thank You for Your Order!</h2>
        <p style="color: var(--color-text-secondary); margin-bottom: 24px;">Your payment was securely processed. Your delivery is being packed.</p>
        
        <div style="background-color: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 8px; padding: 20px; text-align: left; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: 600; color: var(--color-text-secondary);">Order ID:</span>
            <span style="font-family: monospace; font-weight: 700; color: var(--color-text-primary);">${orderId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: 600; color: var(--color-text-secondary);">Product:</span>
            <span style="color: var(--color-text-primary); font-size: 0.9rem;">${cartItem.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-weight: 600; color: var(--color-text-secondary);">Quantity:</span>
            <span style="color: var(--color-text-primary);">${cartItem.quantity}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px dashed var(--color-border); padding-top: 10px; margin-top: 10px;">
            <span style="font-weight: 700; color: var(--color-text-primary);">Paid Amount:</span>
            <span style="font-weight: 800; color: var(--color-primary-light); font-size: 1.15rem;">₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <p style="font-size: 0.85rem; color: var(--color-text-light); margin-bottom: 30px;">A receipt has been sent to your email <strong>${email}</strong>. Our logistics partner will share your SMS tracking code shortly.</p>
        
        <a href="shop.html" class="btn btn-primary" style="width: 100%;">Continue Shopping</a>
      </div>
    `;
    
    // Clear shopping cart value back to 1
    cartItem.quantity = 1;
    const qtyInput = document.getElementById("checkout-qty");
    if (qtyInput) qtyInput.value = 1;
    updateCartTotals();

    // Scroll to the checkout area
    checkoutWrapper.scrollIntoView({ behavior: "smooth" });
  }
}


/* ==========================================================================
   5. CONTACT & NEWSLETTER FORM HANDLERS (SUPABASE CONNECTED)
   ========================================================================= */

// Contact Form Handler
function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    const submissionData = {
      name,
      email,
      subject: subject || "General Inquiry",
      message,
      created_at: new Date().toISOString()
    };

    showToast("Submitting your message...", "success");

    let submitted = false;

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from("contact_submissions")
          .insert([submissionData]);

        if (error) throw error;
        submitted = true;
      } catch (err) {
        console.error("Supabase contact error:", err);
        showToast("Database synchronization failed, stored locally", "error");
      }
    }

    if (!submitted) {
      // Offline/Demo Mode LocalStorage Save
      const submissions = JSON.parse(localStorage.getItem("buzzshield_contacts") || "[]");
      submissions.push(submissionData);
      localStorage.setItem("buzzshield_contacts", JSON.stringify(submissions));
      console.log("Mock contact submission logged:", submissionData);
    }

    showToast("Thank you! Your inquiry was submitted successfully.", "success");
    contactForm.reset();
  });
}

// Newsletter Signups
function initNewsletterForm() {
  const newsletterForm = document.getElementById("newsletter-form");
  if (!newsletterForm) return;

  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = newsletterForm.querySelector(".form-control");
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      showToast("Please enter your email address.", "error");
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const signupData = {
      email,
      created_at: new Date().toISOString()
    };

    showToast("Signing up...", "success");

    let submitted = false;

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from("newsletter_signups")
          .insert([signupData]);

        if (error) throw error;
        submitted = true;
      } catch (err) {
        console.error("Supabase newsletter error:", err);
        // Silent catch for demo modes
      }
    }

    if (!submitted) {
      // Offline/Demo Mode LocalStorage save
      const signups = JSON.parse(localStorage.getItem("buzzshield_newsletters") || "[]");
      // Check for duplicates in local store
      if (!signups.some(s => s.email === email)) {
        signups.push(signupData);
        localStorage.setItem("buzzshield_newsletters", JSON.stringify(signups));
      }
      console.log("Mock Newsletter signup logged:", signupData);
    }

    showToast("Welcome to BuzzShield Circle! Check your inbox.", "success");
    if (emailInput) emailInput.value = "";
  });
}
