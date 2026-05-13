// 1. 定義菜單資料 (純文字內容)
const menuData = [
    { id: 1, name: '美式咖啡', price: 45, desc: '阿拉比卡 香醇最佳選擇' },
    { id: 2, name: '拿鐵咖啡', price: 65, desc: '奶香濃郁 完美融合' },
    { id: 3, name: '卡布奇諾', price: 60, desc: '綿密奶泡 經典比例' },
    { id: 4, name: '抹茶拿鐵', price: 70, desc: '日式風味 順口好喝' },
    { id: 5, name: '起司蛋糕', price: 80, desc: '入口即化的口感' },
    { id: 6, name: '巧克力餅乾', price: 35, desc: '手工現烤 濃郁巧克力' }
];

let myCart = [];
const STORAGE_KEY = 'coffee_orders_team130';

// 2. 初始化菜單 (移除圖片標籤)
function initMenu() {
    const area = document.getElementById('menu-area');
    area.innerHTML = menuData.map(item => `
        <div class="product-card">
            <h3>${item.name}</h3>
            <p style="color: #666; font-size: 0.85rem; height: 40px;">${item.desc}</p>
            <p style="color: #e76f51; font-weight: bold;">NT$ ${item.price}</p>
            <button onclick="addItem(${item.id})">加入購物車</button>
        </div>
    `).join('');
}

// 3. 加入購物車
function addItem(id) {
    const item = menuData.find(p => p.id === id);
    myCart.push({ ...item, cartId: Date.now() + Math.random() });
    renderCart();
}

// 4. 移除品項
function removeItem(cartId) {
    myCart = myCart.filter(i => i.cartId !== cartId);
    renderCart();
}

// 5. 更新畫面與按鈕狀態
function renderCart() {
    const list = document.getElementById('cart-list');
    const totalDisplay = document.getElementById('total-price');
    const btn = document.getElementById('btn-submit');
    const nameInput = document.getElementById('cust-name').value;

    list.innerHTML = myCart.map(i => `
        <div class="cart-item-row">
            <span>${i.name}</span>
            <span>NT$ ${i.price} <button class="btn-remove" onclick="removeItem(${i.cartId})">移除</button></span>
        </div>
    `).join('');

    const total = myCart.reduce((sum, i) => sum + i.price, 0);
    totalDisplay.innerText = `NT$ ${total}`;
    
    // 檢查購物車與姓名是否填寫
    btn.disabled = (myCart.length === 0 || nameInput.trim() === "");
}

// 6. 送出訂單連動後台
function sendOrder() {
    const orderNum = Math.floor(Math.random() * 900) + 100;
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;

    const orderObj = {
        id: orderNum,
        customer: name,
        phone: phone,
        items: [...myCart],
        total: myCart.reduce((s, i) => s + i.price, 0),
        time: new Date().toLocaleTimeString(),
        status: '待處理'
    };

    // 儲存至 localStorage
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.push(orderObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // 顯示成功跳窗與醒目編號
    document.getElementById('order-id').innerText = `#${orderNum}`;
    document.getElementById('order-modal').style.display = 'flex';
}

// 監聽姓名欄位動態啟用按鈕
document.getElementById('cust-name').addEventListener('input', renderCart);

initMenu();