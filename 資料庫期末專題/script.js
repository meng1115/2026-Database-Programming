const menuData = [
    { id: 1, name: '美式咖啡', price: 45, desc: '阿拉比卡 香醇最佳選擇', type: 'coffee' },
    { id: 2, name: '拿鐵咖啡', price: 65, desc: '奶香濃郁 完美融合', type: 'latte' },
    { id: 3, name: '卡布奇諾', price: 60, desc: '綿密奶泡 經典比例', type: 'latte' },
    { id: 4, name: '抹茶拿鐵', price: 70, desc: '日式風味 順口好喝', type: 'matcha' },
    { id: 5, name: '起司蛋糕', price: 80, desc: '入口即化的口感', type: 'dessert' },
    { id: 6, name: '巧克力餅乾', price: 35, desc: '手工現烤 濃郁巧克力', type: 'dessert' }
];

let myCart = [];
let currentSelectedProduct = null;
let currentModalQty = 1;

// 會員系統相關變數
let authMode = 'login'; // 'login' 或 'register'
let currentUser = null;

const STORAGE_KEY = 'coffee_orders_team130';
const MEMBER_KEY = 'coffee_members_team130';
const SESSION_KEY = 'current_login_user_team130';

// ==========================================
// 會員系統核心邏輯
// ==========================================

// 檢查是否已有登入紀錄 (記住會員)
function checkLoginSession() {
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loginSuccess(currentUser);
    }
}

// 切換 登入 / 註冊 介面模式
function switchAuthMode() {
    const title = document.getElementById('auth-title');
    const primaryBtn = document.getElementById('btn-auth-primary');
    const switchText = document.getElementById('auth-switch-text');
    const switchLink = document.getElementById('auth-switch-link');
    
    if (authMode === 'login') {
        authMode = 'register';
        title.innerText = '註冊新會員';
        primaryBtn.innerText = '註冊並登入';
        switchText.innerText = '已經是會員？';
        switchLink.innerText = '切換至登入';
    } else {
        authMode = 'login';
        title.innerText = '會員登入';
        primaryBtn.innerText = '登入';
        switchText.innerText = '首次點餐？';
        switchLink.innerText = '註冊新會員';
    }
}

// 處理登入或註冊送出
function handleAuthSubmit() {
    const phone = document.getElementById('auth-phone').value.trim();
    const name = document.getElementById('auth-name').value.trim();

    if (!phone) {
        alert('請輸入手機號碼作為帳號！');
        return;
    }

    let members = JSON.parse(localStorage.getItem(MEMBER_KEY) || '[]');

    if (authMode === 'register') {
        if (!name) {
            alert('請填寫姓名以完成註冊！');
            return;
        }
        // 檢查手機號碼是否重複
        const isExist = members.some(m => m.phone === phone);
        if (isExist) {
            alert('此手機號碼已被註冊，請直接登入！');
            authMode = 'register';
            switchAuthMode();
            return;
        }
        // 寫入新會員
        const newMember = { phone, name };
        members.push(newMember);
        localStorage.setItem(MEMBER_KEY, JSON.stringify(members));
        currentUser = newMember;
        alert('註冊成功！');
    } else {
        // 登入模式：查核手機號碼
        const user = members.find(m => m.phone === phone);
        if (!user) {
            alert('找不到該會員帳號，請切換至註冊新會員！');
            return;
        }
        currentUser = user;
    }

    // 記住登入狀態
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    loginSuccess(currentUser);
}

// 登入成功處理
function loginSuccess(user) {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('current-user-badge').style.display = 'block';
    document.getElementById('user-display-name').innerText = user.name;
    
    // 自動帶入購物車欄位
    document.getElementById('cust-name').value = user.name;
    document.getElementById('cust-phone').value = user.phone;
    
    renderCart();
}

// 登出 / 切換帳號
function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
    document.getElementById('current-user-badge').style.display = 'none';
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('auth-phone').value = '';
    document.getElementById('auth-name').value = '';
    
    // 重新彈出登入視窗
    authMode = 'login';
    document.getElementById('auth-title').innerText = '會員登入';
    document.getElementById('btn-auth-primary').innerText = '登入';
    document.getElementById('auth-switch-text').innerText = '首次點餐？';
    document.getElementById('auth-switch-link').innerText = '註冊新會員';
    document.getElementById('auth-modal').style.display = 'flex';
}

// ==========================================
// 原有點餐系統優化整合
// ==========================================

function initMenu() {
    const area = document.getElementById('menu-area');
    area.innerHTML = menuData.map(item => `
        <div class="product-card">
            <h3>${item.name}</h3>
            <p style="color: #666; font-size: 0.85rem; min-height: 40px;">${item.desc}</p>
            <p class="price">NT$ ${item.price}</p>
            <button onclick="handleAddToCartClick(${item.id})">加入購物車</button>
        </div>
    `).join('');
}

function handleAddToCartClick(id) {
    const item = menuData.find(p => p.id === id);
    if (item.type === 'dessert') {
        addDessertToCart(item);
    } else {
        openCustomModal(item);
    }
}

function addDessertToCart(product) {
    const existingIndex = myCart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
        myCart[existingIndex].quantity += 1;
    } else {
        myCart.push({
            ...product,
            quantity: 1,
            customString: '固定規格',
            cartId: Date.now() + Math.random()
        });
    }
    renderCart();
}

function openCustomModal(item) {
    currentSelectedProduct = item;
    currentModalQty = 1;
    document.getElementById('modal-qty-display').innerText = currentModalQty;
    document.getElementById('custom-product-name').innerText = `${item.name} - 客製化調整`;
    
    if (item.type === 'coffee') {
        document.getElementById('espresso-group').style.display = 'block';
        document.getElementById('milk-group').style.display = 'none';
    } else if (item.type === 'matcha') {
        document.getElementById('espresso-group').style.display = 'none';
        document.getElementById('milk-group').style.display = 'block';
    } else {
        document.getElementById('espresso-group').style.display = 'block';
        document.getElementById('milk-group').style.display = 'block';
    }
    document.getElementById('custom-modal').style.display = 'flex';
}

function changeModalQty(amount) {
    currentModalQty += amount;
    if (currentModalQty < 1) currentModalQty = 1;
    document.getElementById('modal-qty-display').innerText = currentModalQty;
}

function closeCustomModal() {
    document.getElementById('custom-modal').style.display = 'none';
    currentSelectedProduct = null;
}

function confirmAddToCart() {
    if (!currentSelectedProduct) return;

    const temp = document.querySelector('input[name="temp-option"]:checked').value;
    let espresso = "標準";
    if (currentSelectedProduct.type !== 'matcha') {
        espresso = document.querySelector('input[name="espresso-option"]:checked').value;
    }
    let milk = "全脂鮮乳";
    if (currentSelectedProduct.type !== 'coffee') {
        milk = document.querySelector('input[name="milk-option"]:checked').value;
    }

    let singlePrice = currentSelectedProduct.price;
    let customDetails = [temp];

    if (espresso === "特濃") {
        singlePrice += 15;
        customDetails.push("特濃");
    }
    if (currentSelectedProduct.type !== 'coffee' && milk === "燕麥奶") {
        singlePrice += 20;
        customDetails.push("燕麥奶");
    }

    const customKey = customDetails.join(' / ');
    const existingIndex = myCart.findIndex(item => item.id === currentSelectedProduct.id && item.customString === customKey);

    if (existingIndex > -1) {
        myCart[existingIndex].quantity += currentModalQty;
    } else {
        myCart.push({
            ...currentSelectedProduct,
            price: singlePrice,
            customString: customKey,
            quantity: currentModalQty,
            cartId: Date.now() + Math.random()
        });
    }

    closeCustomModal();
    renderCart();
}

function changeCartQty(cartId, amount) {
    const index = myCart.findIndex(item => item.cartId === cartId);
    if (index === -1) return;

    myCart[index].quantity += amount;
    if (myCart[index].quantity <= 0) {
        myCart = myCart.filter(item => item.cartId !== cartId);
    }
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-list');
    const totalDisplay = document.getElementById('total-price');
    const btn = document.getElementById('btn-submit');

    list.innerHTML = myCart.map(i => `
        <div class="cart-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
            <div>
                <div style="font-weight:bold;">${i.name}</div>
                <small style="color:#888;">(${i.customString})</small>
                <div style="color:#e76f51; font-size:0.85rem; margin-top:2px;">單價: NT$ ${i.price}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button onclick="changeCartQty(${i.cartId}, -1)" class="btn-qty-cart">-</button>
                <span style="font-weight:bold; min-width:15px; text-align:center;">${i.quantity}</span>
                <button onclick="changeCartQty(${i.cartId}, 1)" class="btn-qty-cart">+</button>
            </div>
        </div>
    `).join('');

    const total = myCart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    totalDisplay.innerText = `NT$ ${total}`;
    
    // 登入狀態下且購物車有東西即可送出
    btn.disabled = (myCart.length === 0 || !currentUser);
}

function sendOrder() {
    if (!currentUser) {
        alert('請先登入會員再提交訂單！');
        return;
    }

    const orderNum = Math.floor(Math.random() * 900) + 100;
    const orderData = {
        id: orderNum,
        name: currentUser.name,
        phone: currentUser.phone,
        items: [...myCart],
        total: myCart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        time: new Date().toLocaleTimeString(),
        status: '待處理'
    };

    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    orders.push(orderData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

    document.getElementById('order-id').innerText = `#${orderNum}`;
    document.getElementById('order-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
    myCart = [];
    renderCart();
}

// 頁面初始化
initMenu();
checkLoginSession();
