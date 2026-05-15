// Importe os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// COLE AQUI AS SUAS CONFIGURAÇÕES DO FIREBASE
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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- FUNÇÕES DE PERSISTÊNCIA ---

// Carregar Produtos em Tempo Real (Serve para Cliente e ADM)
function carregarProdutos() {
    const productsRef = ref(db, 'produtos');
    onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        const listaProdutos = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        
        // Se estiver na página do cliente, renderiza menu cliente
        if (document.getElementById('menu-container')) {
            renderCustomerMenu(listaProdutos);
        }
        // Se estiver na página do adm, renderiza menu adm
        if (document.getElementById('admin-menu-list')) {
            renderAdminDashboard(listaProdutos);
        }
    });
}

// Carregar Métricas (Apenas ADM)
function carregarMetricas() {
    const ordersRef = ref(db, 'orderCount');
    onValue(ordersRef, (snapshot) => {
        const count = snapshot.val() || 0;
        const totalElem = document.getElementById('total-orders');
        if (totalElem) totalElem.innerText = count;
    });
}

// Adicionar Produto (ADM)
window.addProduct = function() {
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);

    if (name && price) {
        const productsRef = ref(db, 'produtos');
        push(productsRef, { name, price });
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
        alert("Item salvo no Banco de Dados!");
    }
}

// Remover Produto (ADM)
window.deleteProduct = function(id) {
    remove(ref(db, `produtos/${id}`));
}

// Finalizar Pedido (Cliente)
window.sendWhatsApp = function(cart) {
    // Incrementa contador no Banco de Dados
    const ordersRef = ref(db, 'orderCount');
    onValue(ordersRef, (snapshot) => {
        const currentCount = snapshot.val() || 0;
        set(ref(db, 'orderCount'), currentCount + 1);
    }, { onlyOnce: true });

    // Lógica do WhatsApp (igual ao anterior)
    // ... código de envio de mensagem ...
}

// Iniciar
carregarProdutos();
carregarMetricas();
import { getDatabase, ref, push, set, runTransaction } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

window.sendWhatsApp = async function() {
    if (cart.length === 0) return alert("Carrinho vazio!");

    // 1. Incrementar o contador de pedidos de forma segura no Banco (Transação)
    const orderCountRef = ref(db, 'orderCount');
    await runTransaction(orderCountRef, (currentValue) => {
        return (currentValue || 0) + 1;
    });

    // 2. Salvar o log do pedido para o ADM ver o histórico depois
    const historicoRef = ref(db, 'historico_pedidos');
    push(historicoRef, {
        itens: cart,
        total: cart.reduce((acc, item) => acc + item.price, 0),
        data: new Date().toISOString()
    });

    // 3. Gerar link do WhatsApp
    let texto = "🔥 *Novo Pedido - Espetinho* 🔥\n\n";
    cart.forEach(item => texto += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`);
    
    const fone = "5517996359526"; // Seu número
    window.open(`https://api.whatsapp.com/send?phone=${fone}&text=${encodeURIComponent(texto)}`);
    
    cart = []; 
    document.getElementById('cart-count').innerText = 0;
};
