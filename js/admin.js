/* ============================================================
   admin.js - لوحة تحكم تمونيات سامي (سلات + منتجات + محافظ)
   ============================================================ */

// ==================== Firebase ====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

// ==================== متغيرات عامة ====================
let currentBaskets = [];
let currentProducts = [];

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

function showMessage(msgId, msg) {
    const div = document.getElementById(msgId);
    if (!div) return;
    div.innerText = msg;
    div.style.display = 'block';
    setTimeout(() => div.style.display = 'none', 3000);
}

// ==================== 1. إدارة السلات (جدول: baskets) ====================
async function loadBaskets() {
    const container = document.getElementById('basketsList');
    container.innerHTML = '<div class="loading">جاري التحميل...</div>';
    try {
        const snapshot = await getDocs(collection(db, "products"));
        currentBaskets = [];
        snapshot.forEach((doc) => {
            currentBaskets.push({ id: doc.id, ...doc.data() });
        });
        renderBaskets();
    } catch (error) {
        container.innerHTML = '<div class="loading">خطأ في التحميل</div>';
    }
}

function renderBaskets() {
    const container = document.getElementById('basketsList');
    container.innerHTML = '';
    if (currentBaskets.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد سلات</div>';
        return;
    }
    currentBaskets.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card-admin';
        div.innerHTML = `
            <div class="card-info">
                <input type="text" value="${escapeHtml(item.name)}" id="basket_name_${item.id}" placeholder="الاسم">
                <textarea id="basket_desc_${item.id}" placeholder="الوصف">${escapeHtml(item.desc || '')}</textarea>
                <input type="number" step="0.01" value="${item.price}" id="basket_price_${item.id}" placeholder="السعر" style="width: 120px;">
            </div>
            <div class="card-actions">
                <button class="save-btn" data-action="updateBasket" data-id="${item.id}"><i class="fas fa-save"></i> حفظ</button>
                <button class="delete-btn" data-action="deleteBasket" data-id="${item.id}"><i class="fas fa-trash"></i> حذف</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function updateBasket(id) {
    const newName = document.getElementById(`basket_name_${id}`).value;
    const newDesc = document.getElementById(`basket_desc_${id}`).value;
    const newPrice = parseFloat(document.getElementById(`basket_price_${id}`).value);
    if (!newName || isNaN(newPrice)) { alert('الرجاء إدخال اسم وسعر صحيح'); return; }
    await updateDoc(doc(db, "baskets", id), { name: newName, desc: newDesc, price: newPrice });
    showMessage('basketsMsg', '✓ تم تحديث السلة');
    loadBaskets();
}

async function deleteBasket(id) {
    if (confirm('هل أنت متأكد من حذف هذه السلة؟')) {
        await deleteDoc(doc(db, "baskets", id));
        showMessage('basketsMsg', '✓ تم حذف السلة');
        loadBaskets();
    }
}

async function addBasket() {
    const name = document.getElementById('newBasketName').value;
    const price = parseFloat(document.getElementById('newBasketPrice').value);
    const desc = document.getElementById('newBasketDesc').value;
    if (!name || isNaN(price)) { alert('الرجاء إدخال اسم وسعر'); return; }
    await addDoc(collection(db, "baskets"), { name, desc, price });
    document.getElementById('newBasketName').value = '';
    document.getElementById('newBasketPrice').value = '';
    document.getElementById('newBasketDesc').value = '';
    showMessage('basketsMsg', '✓ تم إضافة السلة');
    loadBaskets();
}

// ==================== 2. إدارة المنتجات (جدول: newproducts) ====================
async function loadProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '<div class="loading">جاري التحميل...</div>';
    try {
        const snapshot = await getDocs(collection(db, "newproducts"));
        currentProducts = [];
        snapshot.forEach((doc) => {
            currentProducts.push({ id: doc.id, ...doc.data() });
        });
        renderProducts();
    } catch (error) {
        container.innerHTML = '<div class="loading">خطأ في التحميل</div>';
    }
}

function renderProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '';
    if (currentProducts.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد منتجات</div>';
        return;
    }
    currentProducts.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card-admin';
        div.innerHTML = `
            <div class="card-info">
                <input type="text" value="${escapeHtml(item.name)}" id="prod_name_${item.id}" placeholder="الاسم">
                <textarea id="prod_desc_${item.id}" placeholder="الوصف">${escapeHtml(item.desc || '')}</textarea>
                <div class="form-row">
                    <input type="number" step="0.01" value="${item.price}" id="prod_price_${item.id}" placeholder="السعر">
                    <input type="date" value="${item.createdAt || ''}" id="prod_date_${item.id}" placeholder="التاريخ">
                </div>
            </div>
            <div class="card-actions">
                <button class="save-btn" data-action="updateProduct" data-id="${item.id}"><i class="fas fa-save"></i> حفظ</button>
                <button class="delete-btn" data-action="deleteProduct" data-id="${item.id}"><i class="fas fa-trash"></i> حذف</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function updateProduct(id) {
    const name = document.getElementById(`prod_name_${id}`).value;
    const desc = document.getElementById(`prod_desc_${id}`).value;
    const price = parseFloat(document.getElementById(`prod_price_${id}`).value);
    const date = document.getElementById(`prod_date_${id}`).value;
    if (!name || isNaN(price)) { alert('الرجاء إدخال اسم وسعر صحيح'); return; }
    await updateDoc(doc(db, "newproducts", id), { name, desc, price, createdAt: date });
    showMessage('productsMsg', '✓ تم تحديث المنتج');
    loadProducts();
}

async function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        await deleteDoc(doc(db, "newproducts", id));
        showMessage('productsMsg', '✓ تم حذف المنتج');
        loadProducts();
    }
}

async function addProduct() {
    const name = document.getElementById('newProductName').value;
    const price = parseFloat(document.getElementById('newProductPrice').value);
    const desc = document.getElementById('newProductDesc').value;
    const date = document.getElementById('newProductDate').value || new Date().toISOString().split('T')[0];
    if (!name || isNaN(price)) { alert('الرجاء إدخال اسم وسعر'); return; }
    await addDoc(collection(db, "newproducts"), { name, desc, price, createdAt: date });
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductDesc').value = '';
    document.getElementById('newProductDate').value = '';
    showMessage('productsMsg', '✓ تم إضافة المنتج');
    loadProducts();
}

// ==================== 3. إدارة المحافظ (تخزين محلي) ====================
const defaultWallets = [
    { name: 'جيب Jib', number: '525 359' },
    { name: 'جوالي Jawaly', number: '129 030' },
    { name: 'فلوسك', number: '842 622' },
    { name: 'كريمي', number: '1456 408' },
    { name: 'سبا كاش', number: '603 409' },
    { name: 'موبايل موني', number: '943 328' },
    { name: 'ايزي', number: '5000 606' },
    { name: 'يمن والت', number: '777 279 137' },
    { name: 'ون كاش', number: '195 915' }
];

const walletsData = loadWalletsFromStorage();

function loadWalletsFromStorage() {
    const saved = localStorage.getItem('walletsData');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [...defaultWallets];
        }
    }
    return [...defaultWallets];
}

function saveWalletsToStorage() {
    localStorage.setItem('walletsData', JSON.stringify(walletsData));
}

function loadWallets() {
    const container = document.getElementById('walletsList');
    container.innerHTML = '';
    walletsData.forEach((wallet, index) => {
        const div = document.createElement('div');
        div.className = 'card-admin';
        div.innerHTML = `
            <div class="card-info">
                <div class="form-row">
                    <input type="text" value="${escapeHtml(wallet.name)}" id="wallet_name_${index}" placeholder="اسم المحفظة">
                    <input type="text" value="${escapeHtml(wallet.number)}" id="wallet_number_${index}" placeholder="الرقم" dir="ltr">
                </div>
            </div>
            <div class="card-actions">
                <button class="save-btn" data-action="updateWallet" data-index="${index}"><i class="fas fa-save"></i> حفظ</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateWallet(index) {
    const newName = document.getElementById(`wallet_name_${index}`).value;
    const newNumber = document.getElementById(`wallet_number_${index}`).value;
    walletsData[index].name = newName;
    walletsData[index].number = newNumber;
    saveWalletsToStorage();
    showMessage('walletsMsg', '✓ تم تحديث المحفظة');
    loadWallets();
}

// ==================== تفويض الأحداث (Event Delegation) ====================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const index = btn.dataset.index;

    if (action === 'updateBasket') updateBasket(id);
    if (action === 'deleteBasket') deleteBasket(id);
    if (action === 'updateProduct') updateProduct(id);
    if (action === 'deleteProduct') deleteProduct(id);
    if (action === 'updateWallet') updateWallet(parseInt(index));
});

// ==================== أزرار الإضافة ====================
document.getElementById('addBasketBtn')?.addEventListener('click', addBasket);
document.getElementById('addProductBtn')?.addEventListener('click', addProduct);

// ==================== علامات التبويب ====================
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');

        if (tab.dataset.tab === 'baskets') loadBaskets();
        if (tab.dataset.tab === 'products') loadProducts();
        if (tab.dataset.tab === 'wallets') loadWallets();
    });
});

// ==================== تحميل البيانات الافتراضية ====================
loadBaskets();