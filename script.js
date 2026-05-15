// Dados Iniciais (Caso o localStorage esteja vazio)
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Espeto de Carne', price: 12.00 },
    { id: 2, name: 'Espeto de Queijo Coalho', price: 10.00 }
];

let cart = [];
let totalOrders = localStorage.getItem('orderCount') || 0;

// --- FUNÇÕES DO CLIENTE ---
function renderCustomerMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-info">
                <h3>${p.name}</h3>
                <span>R$ ${p.price.toFixed(2)}</span>
            </div>
            <button class="btn-add" onclick="addToCart('${p.name}', ${p.price})">Adicionar</button>
        </div>
    `).join('');
}

function addToCart(name, price) {
    cart.push({ name, price });
    document.getElementById('cart-count').innerText = cart.length;
}

function sendWhatsApp() {
    if (cart.length === 0) return alert("Carrinho vazio!");
    
    let message = "Olá! Gostaria de fazer um pedido:\n\n";
    let total = 0;
    cart.forEach(item => {
        message += `- ${item.name}: R$ ${item.price.toFixed(2)}\n`;
        total += item.price;
    });
    message += `\n*Total: R$ ${total.toFixed(2)}*`;

    // Atualiza métrica de pedidos no sistema
    totalOrders++;
    localStorage.setItem('orderCount', totalOrders);

    const phone = "5517999999999"; // COLOQUE SEU NÚMERO AQUI
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    cart = []; // Limpa carrinho
    document.getElementById('cart-count').innerText = 0;
}

// --- FUNÇÕES DO ADM ---
function addProduct() {
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);

    if (name && price) {
        products.push({ id: Date.now(), name, price });
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminDashboard();
        alert("Item adicionado!");
    }
}

function renderAdminDashboard() {
    document.getElementById('total-orders').innerText = totalOrders;
    const list = document.getElementById('admin-menu-list');
    list.innerHTML = products.map(p => `
        <div class="admin-item">
            ${p.name} - R$ ${p.price} 
            <button onclick="deleteProduct(${p.id})">Remover</button>
        </div>
    `).join('');
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    renderAdminDashboard();
}

function logout() {
    localStorage.removeItem('auth');
    window.location.href = 'admin.html';
}
function logout() {
    // Remove a permissão de acesso
    localStorage.removeItem('auth');
    // Volta para a tela de login
    window.location.href = 'admin.html';
}
