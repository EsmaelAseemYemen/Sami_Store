/* ============================================================
   main.js - جميع وظائف موقع تمونيات سامي (بدون تكرار)
   ============================================================ */

// ==================== Firebase ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD8bsKHa_lX2MfJzI8_UKdZOXCZ5kR8xV8",
    authDomain: "sami-store-845e1.firebaseapp.com",
    projectId: "sami-store-845e1",
    storageBucket: "sami-store-845e1.firebasestorage.app",
    messagingSenderId: "428051564168",
    appId: "1:428051564168:web:152b7bce85d9ad4108413d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== ثوابت ====================
const STORE_PHONE = "967777279137";
const ADMIN_PASSWORD = "242S";

// ==================== دوال مساعدة ====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==================== نسخ أرقام المحافظ ====================
window.copyWalletNumber = function (elementId, walletName) {
    const numberElement = document.getElementById(elementId);
    let number = numberElement.innerText;
    number = number.replace(/[\s,\-]/g, '');

    navigator.clipboard.writeText(number).then(() => {
        const card = numberElement.closest('.wallet-card');
        card.style.backgroundColor = '#d4edda';
        card.style.transition = '0.2s';
        setTimeout(() => {
            card.style.backgroundColor = '';
        }, 200);
        showNotification(`تم نسخ رقم ${walletName}: ${number}`, 'success');
    }).catch(() => {
        showNotification(`❌ فشل النسخ، حاول مرة أخرى`, 'error');
    });
};

function showNotification(message, type = 'success') {
    const oldNotification = document.querySelector('.copy-notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#fef9f0' : '#e63946'};
        color: #155724;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 0.85rem;
        z-index: 10000;
        box-shadow: 0 4px 10px rgba(224, 6, 6, 0.69);
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Cairo', sans-serif;
        white-space: nowrap;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'fadeOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ==================== المنتجات من Firebase (newproducts) ====================
async function loadProductsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "newproducts"));
        const products = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            products.push({
                id: doc.id,
                name: data.name || "منتج جديد",
                desc: data.desc || "",
                price: data.price || 0,
                createdAt: data.createdAt || "2000-01-01"
            });
        });

        products.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.localeCompare(a.createdAt);
            }
            return 0;
        });

        displayProductsInSwiper(products);
        return products;
    } catch (error) {
        console.error("خطأ في جلب المنتجات:", error);
        const wrapper = document.getElementById('productsWrapper');
        if (wrapper) {
            wrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="product-card">
                        <div class="product-image">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="product-details">
                            <h3>خطأ في التحميل</h3>
                            <p class="product-desc">يرجى تحديث الصفحة</p>
                            <div class="product-price">0 <small>دينار</small></div>
                        </div>
                    </div>
                </div>
            `;
        }
        return [];
    }
}

function displayProductsInSwiper(products) {
    const wrapper = document.getElementById('productsWrapper');
    if (!wrapper) return;

    if (products.length === 0) {
        wrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="product-card">
                    <div class="product-image">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <div class="product-details">
                        <h3>لا توجد منتجات</h3>
                        <p class="product-desc">أضف منتجات جديدة من لوحة التحكم</p>
                        <div class="product-price">0 <small>دينار</small></div>
                        <button class="product-order-btn" disabled>
                            <i class="fas fa-start-cart"></i> غير متوفر
                        </button>
                    </div>
                </div>
            </div>
        `;
        if (window.productsSwiper) window.productsSwiper.update();
        return;
    }

    wrapper.innerHTML = '';
    products.forEach(product => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <i class="fas fa-star"></i>
                </div>
                <div class="product-details">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="product-desc">${escapeHtml(product.desc || '')}</p>
                    <div class="product-price">${product.price} <small>ريال</small></div>
                    <button class="product-order-btn">
                        <i class="fas fa-shopping-cart"></i> اطلب الآن
                    </button>
                </div>
            </div>
        `;
        const btn = slide.querySelector('.product-order-btn');
        btn.addEventListener('click', () => orderProductDirect(product.name));
        wrapper.appendChild(slide);
    });

    if (window.productsSwiper) {
        window.productsSwiper.update();
        window.productsSwiper.slideTo(0);
    }
}

function orderProductDirect(productName) {
    const modal = document.getElementById('directModal');
    const textarea = document.getElementById('directOrderDetails');
    if (textarea) {
        textarea.value = `طلب منتج: ${productName}\n\n`;
    }
    if (modal) modal.style.display = 'flex';
}

// ==================== السلات من Firebase (products) ====================
let basketsData = [];

async function loadBaskets() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        basketsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            basketsData.push({
                id: doc.id,
                name: data.name || "بدون اسم",
                desc: data.desc || "",
                price: data.price || 0
            });
        });
        renderBaskets();
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        const container = document.getElementById('basketsContainer');
        if (container) container.innerHTML = '<div class="loading">حدث خطأ في تحميل السلات</div>';
    }
}

function renderBaskets() {
    const container = document.getElementById('basketsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (basketsData.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد سلات حالياً</div>';
        return;
    }

    basketsData.forEach(basket => {
        const card = document.createElement('div');
        card.className = 'basket-card';
        card.innerHTML = `
            <div class="basket-img"><i class="fas fa-shopping-basket"></i></div>
            <div class="basket-info">
                <h3>${escapeHtml(basket.name)}</h3>
                <p>${escapeHtml(basket.desc)}</p>
                <div class="price">${basket.price} <small>ريال</small></div>
                <button class="btn-order"><i class="fas fa-shopping-cart"></i> اطلب السلة</button>
            </div>
        `;
        const btn = card.querySelector('.btn-order');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openBasketModal(basket.name);
        });
        container.appendChild(card);
    });
}


function openBasketModal(basketName) {
    // البحث عن بيانات السلة كاملة من basketsData
    const basket = basketsData.find(b => b.name === basketName);
    
    const modal = document.getElementById('basketModal');
    const nameDisplay = document.getElementById('basketNameDisplay');
    const descDisplay = document.getElementById('basketDescDisplay');
    const priceDisplay = document.getElementById('basketPriceDisplay');
    
    if (nameDisplay) nameDisplay.innerText = basketName;
    if (descDisplay) descDisplay.innerText = basket ? (basket.desc || 'لا يوجد وصف') : '';
    if (priceDisplay) priceDisplay.innerText = basket ? `${basket.price} ريال` : '';
    
    if (modal) modal.style.display = 'flex';
}

function openDirectModal() {
    const modal = document.getElementById('directModal');
    const textarea = document.getElementById('directOrderDetails');
    if (textarea) textarea.value = '';
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// ==================== إرسال الطلبات ====================
function sendBasketWhatsapp() {
    const basketNameElem = document.getElementById('basketNameDisplay');
    const basketName = basketNameElem ? basketNameElem.innerText : 'سلة غير محددة';
    const message = `طلب سلة جديدة من تمونيات سامي:%0a%0a${encodeURIComponent(basketName)}%0a%0aالرجاء تأكيد الطلب.`;
    window.open(`https://wa.me/${STORE_PHONE}?text=${message}`, '_blank');
    closeModal('basketModal');
}

function sendBasketSms() {
    const basketNameElem = document.getElementById('basketNameDisplay');
    const basketName = basketNameElem ? basketNameElem.innerText : 'سلة غير محددة';
    const message = `طلب سلة جديدة من تمونيات سامي:\n\n${basketName}`;
    window.location.href = `sms:${STORE_PHONE}?body=${encodeURIComponent(message)}`;
    closeModal('basketModal');
}

function sendDirectWhatsapp() {
    const details = document.getElementById('directOrderDetails').value.trim();
    if (!details) {
        alert("الرجاء كتابة تفاصيل الطلب");
        return;
    }
    const message = `طلب مباشر جديد من تمونيات سامي:%0a%0a${encodeURIComponent(details)}%0a%0aالرجاء تأكيد الطلب.`;
    window.open(`https://wa.me/${STORE_PHONE}?text=${message}`, '_blank');
    closeModal('directModal');
}

function sendDirectSms() {
    const details = document.getElementById('directOrderDetails').value.trim();
    if (!details) {
        alert("الرجاء كتابة تفاصيل الطلب");
        return;
    }
    const message = `طلب مباشر جديد من تمونيات سامي:\n\n${details}`;
    window.location.href = `sms:${STORE_PHONE}?body=${encodeURIComponent(message)}`;
    closeModal('directModal');
}

// ==================== وصول سري للوحة التحكم ====================
function setupAdminAccess() {
    let footerClickCount = 0;
    let clickTimer;

    function checkAdminAccess() {
        footerClickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            footerClickCount = 0;
        }, 2000);

        if (footerClickCount === 5) {
            const password = prompt('🔐 أدخل كلمة المرور للدخول إلى لوحة التحكم:');
            if (password === ADMIN_PASSWORD) {
                window.location.href = 'admin.html';
            } else if (password !== null) {
                alert('❌ كلمة المرور غير صحيحة');
            }
            footerClickCount = 0;
            clearTimeout(clickTimer);
        }
    }

    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.cursor = 'pointer';
        footer.addEventListener('click', checkAdminAccess);
    }
}

// ==================== إرسال بريد للمطور ====================
window.sendEmail = function () {
    const email = "esmaelasid@gmail.com";
    const subject = "اتصال من موقع تمونيات سامي";
    const body = "مرحباً EsmaelAseed،%0A%0Aأود التواصل معك بخصوص الموقع.%0A%0Aالرجاء الرد علي في أقرب وقت.%0A%0Aشكراً لك.";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
};

// ==================== Swiper ====================
function initSwiper() {
    window.productsSwiper = new Swiper('.products-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: false,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
        }
    });
}

// ==================== تهيئة كل شيء عند تحميل الصفحة ====================
document.addEventListener('DOMContentLoaded', () => {
    // تحميل البيانات من Firebase
    loadProductsFromFirebase();
    loadBaskets();

    // تهيئة Swiper
    initSwiper();

    // ربط أزرار المودال
    document.getElementById('directOrderBtn')?.addEventListener('click', openDirectModal);
    document.getElementById('basketWhatsappBtn')?.addEventListener('click', sendBasketWhatsapp);
    document.getElementById('basketSmsBtn')?.addEventListener('click', sendBasketSms);
    document.getElementById('directWhatsappBtn')?.addEventListener('click', sendDirectWhatsapp);
    document.getElementById('directSmsBtn')?.addEventListener('click', sendDirectSms);

    // ربط أزرار الإغلاق
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // إغلاق المودال بالنقر خارجه
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // تفعيل الوصول السري للوحة التحكم
    setupAdminAccess();
});