
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
        
const STORE_PHONE = "967777279137";
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
                document.getElementById('basketsContainer').innerHTML = '<div class="loading">حدث خطأ في تحميل السلات</div>';
            }
        }
        
        function renderBaskets() {
            const container = document.getElementById('basketsContainer');
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
                        <button class="btn-order" data-name="${escapeHtml(basket.name)}"><i class="fas fa-shopping-cart"></i> اطلب السلة</button>
                    </div>
                `;
                container.appendChild(card);
            });
            
            document.querySelectorAll('.btn-order').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const basketName = btn.getAttribute('data-name');
                    openBasketModal(basketName);
                });
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
        
        function openBasketModal(basketName) {
            const modal = document.getElementById('basketModal');
            const nameDisplay = document.getElementById('basketNameDisplay');
            if (nameDisplay) nameDisplay.innerText = `سلة: ${basketName}`;
            if (modal) modal.style.display = 'flex';
        }
        
        function openDirectModal() {
            const modal = document.getElementById('directModal');
            const textarea = document.getElementById('directOrderDetails');
            if (textarea) textarea.value = '';
            if (modal) modal.style.display = 'flex';
        }
        
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
        
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'none';
        }
        
        document.getElementById('directOrderBtn')?.addEventListener('click', openDirectModal);
        document.getElementById('basketWhatsappBtn')?.addEventListener('click', sendBasketWhatsapp);
        document.getElementById('basketSmsBtn')?.addEventListener('click', sendBasketSms);
        document.getElementById('directWhatsappBtn')?.addEventListener('click', sendDirectWhatsapp);
        document.getElementById('directSmsBtn')?.addEventListener('click', sendDirectSms);
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        loadBaskets();
    