import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDGJl7zSPUBfGNHXJtApjGcZNrtiIV1yik",
    authDomain: "espeto-ec8ec.firebaseapp.com",
    databaseURL: "https://espeto-ec8ec-default-rtdb.firebaseio.com",
    projectId: "espeto-ec8ec",
    storageBucket: "espeto-ec8ec.firebasestorage.app",
    messagingSenderId: "847681769791",
    appId: "1:847681769791:web:62d31d0445f2ee2a97038a",
    measurementId: "G-XTVRQQ2TWJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let carrinho = [];

// --- FUNÇÕES DE RENDERIZAÇÃO ---

window.renderCustomerMenu = function(produtos) {
    const container = document.getElementById('menu-container');
    if (!container) return;
    
    container.innerHTML = produtos.map(p => `
        <div class="product-card">
            <div class="product-info">
                <h3>${p.name}</h3>
                <span>R$ ${p.price.toFixed(2)}</span>
            </div>
            <button class="btn-add" onclick="addToCart('${p.name}', ${p.price})">Adicionar</button>
        </div>
    `).join('');
};

window.renderAdminDashboard = function(produtos) {
    const list = document.getElementById('admin-menu-list');
    if (!list) return;

    list.innerHTML = produtos.map(p => `
        <div class="admin-item">
            <span>${p.name} - R$ ${p.price.toFixed(2)}</span>
            <button class="btn-remove" onclick="deleteProduct('${p.id}')">Excluir</button>
        </div>
    `).join('');
};

// --- LOGICA DO CLIENTE ---

window.addToCart = function(name, price) {
    carrinho.push({ name, price });
    const count = document.getElementById('cart-count');
    if(count) count.innerText = carrinho.length;
};

window.sendWhatsApp = async function() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    const orderCountRef = ref(db, 'orderCount');
    await runTransaction(orderCountRef, (current) => (current || 0) + 1);

    let texto = "🔥 *Novo Pedido - Ramos Espetos* 🔥\n\n";
    let total = 0;
    carrinho.forEach(item => {
        texto += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        total += item.price;
    });
    texto += `\n*Total: R$ ${total.toFixed(2)}*`;
    
    const fone = "5517996359526";
    window.open(`https://api.whatsapp.com/send?phone=${fone}&text=${encodeURIComponent(texto)}`);
    
    carrinho = []; 
    const count = document.getElementById('cart-count');
    if(count) count.innerText = 0;
};

// --- LOGICA DO ADM ---

window.addProduct = function() {
    const nameInput = document.getElementById('p-name');
    const priceInput = document.getElementById('p-price');
    const name = nameInput.value;
    const price = parseFloat(priceInput.value);

    if (name && !isNaN(price)) {
        const productsRef = ref(db, 'produtos');
        push(productsRef, { name, price })
            .then(() => {
                nameInput.value = "";
                priceInput.value = "";
            })
            .catch((error) => alert("Erro: " + error.message));
    } else {
        alert("Preencha os campos corretamente!");
    }
};

window.deleteProduct = function(id) {
    if(confirm("Remover este item?")) {
        remove(ref(db, `produtos/${id}`));
    }
};

window.logout = function() {
    localStorage.clear();
    window.location.href = 'admin.html';
};

// --- ESCUTA DO BANCO EM TEMPO REAL ---

onValue(ref(db, 'produtos'), (snapshot) => {
    const data = snapshot.val();
    const lista = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    
    renderCustomerMenu(lista);
    renderAdminDashboard(lista);
});

onValue(ref(db, 'orderCount'), (snapshot) => {
    const totalElem = document.getElementById('total-orders');
    if (totalElem) totalElem.innerText = snapshot.val() || 0;
});
