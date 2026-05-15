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

// Variáveis Globais
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
    document.getElementById('cart-count').innerText = carrinho.length;
};

window.sendWhatsApp = async function() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    // 1. Incrementa contador de pedidos
    const orderCountRef = ref(db, 'orderCount');
    await runTransaction(orderCountRef, (current) => (current || 0) + 1);

    // 2. Monta mensagem
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
    document.getElementById('cart-count').innerText = 0;
};

// --- LOGICA DO ADM ---

window.addProduct = function() {
    const name = document.getElementById('p-name').value;


window.addProduct = function() {
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);

    if (name && !isNaN(price)) {
        const productsRef = ref(db, 'produtos');
        // O push envia para o Firebase de forma persistente
        push(productsRef, { 
            name: name, 
            price: price 
        }).then(() => {
            console.log("Dado gravado com sucesso no Firebase!");
            document.getElementById('p-name').value = "";
            document.getElementById('p-price').value = "";
        }).catch((error) => {
            console.error("Erro ao gravar:", error);
            alert("Erro de permissão no banco de dados!");
        });
    } else {
        alert("Por favor, insira um nome e um valor numérico válido.");
    }
};
    const price = parseFloat(document.getElementById('p-price').value);

    if (name && price) {
        push(ref(db, 'produtos'), { name, price });
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
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
    localStorage.removeItem('auth');
    localStorage.removeItem('auth_persistence');
    window.location.href = 'admin.html';
};

// --- INICIALIZAÇÃO E ESCUTA DO BANCO ---

const productsRef = ref(db, 'produtos');
onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    const lista = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    
    if (document.getElementById('menu-container')) renderCustomerMenu(lista);
    if (document.getElementById('admin-menu-list')) renderAdminDashboard(lista);
});

const ordersRef = ref(db, 'orderCount');
onValue(ordersRef, (snapshot) => {
    const totalElem = document.getElementById('total-orders');
    if (totalElem) totalElem.innerText = snapshot.val() || 0;
});
