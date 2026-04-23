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
        
        let currentProducts = [];
        
        function showMessage(msg) {
            const div = document.getElementById('successMsg');
            div.innerText = msg;
            div.style.display = 'block';
            setTimeout(() => div.style.display = 'none', 3000);
        }
        
        async function loadProducts() {
            const container = document.getElementById('productsList');
            container.innerHTML = '<div class="loading">جاري التحميل...</div>';
            
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                currentProducts = [];
                querySnapshot.forEach((doc) => {
                    currentProducts.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                renderProducts();
            } catch (error) {
                console.error(error);
                container.innerHTML = '<div class="loading">خطأ في التحميل: ' + error.message + '</div>';
            }
        }
        
        function renderProducts() {
            const container = document.getElementById('productsList');
            container.innerHTML = '';
            
            if (currentProducts.length === 0) {
                container.innerHTML = '<div class="loading">لا توجد منتجات، أضف منتجاً جديداً</div>';
                return;
            }
            
            currentProducts.forEach(product => {
                const div = document.createElement('div');
                div.className = 'basket-card-admin';
                div.innerHTML = `
                    <div class="basket-info-admin">
                        <input type="text" value="${escapeHtml(product.name || '')}" id="name_${product.id}" placeholder="اسم المنتج">
                        <textarea id="desc_${product.id}" placeholder="وصف المنتج">${escapeHtml(product.desc || '')}</textarea>
                        <input type="number" step="0.01" value="${product.price || 0}" id="price_${product.id}" placeholder="السعر">
                    </div>
                    <div class="basket-actions">
                        <button class="save-btn" onclick='updateProduct("${product.id}")'><i class="fas fa-save"></i> حفظ</button>
                        <button class="delete-btn" onclick='deleteProduct("${product.id}")'><i class="fas fa-trash"></i> حذف</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
        
        window.updateProduct = async function(id) {
            const newName = document.getElementById(`name_${id}`).value;
            const newDesc = document.getElementById(`desc_${id}`).value;
            const newPrice = parseFloat(document.getElementById(`price_${id}`).value);
            
            if (!newName || isNaN(newPrice)) {
                alert('الرجاء إدخال اسم وسعر صحيح');
                return;
            }
            
            try {
                const productRef = doc(db, "products", id);
                await updateDoc(productRef, {
                    name: newName,
                    desc: newDesc,
                    price: newPrice
                });
                showMessage('✓ تم تحديث المنتج بنجاح');
                loadProducts();
            } catch (error) {
                alert('خطأ في التحديث: ' + error.message);
            }
        };
        
        window.deleteProduct = async function(id) {
            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                try {
                    await deleteDoc(doc(db, "products", id));
                    showMessage('✓ تم حذف المنتج بنجاح');
                    loadProducts();
                } catch (error) {
                    alert('خطأ في الحذف: ' + error.message);
                }
            }
        };
        
        document.getElementById('addBtn').onclick = async () => {
            const newName = document.getElementById('newName').value;
            const newDesc = document.getElementById('newDesc').value;
            const newPrice = parseFloat(document.getElementById('newPrice').value);
            
            if (!newName || isNaN(newPrice)) {
                alert('الرجاء إدخال اسم وسعر صحيح');
                return;
            }
            
            try {
                await addDoc(collection(db, "products"), {
                    name: newName,
                    desc: newDesc,
                    price: newPrice
                });
                
                document.getElementById('newName').value = '';
                document.getElementById('newDesc').value = '';
                document.getElementById('newPrice').value = '';
                
                showMessage('✓ تم إضافة المنتج بنجاح');
                loadProducts();
            } catch (error) {
                alert('خطأ في الإضافة: ' + error.message);
            }
        };
        
        loadProducts();