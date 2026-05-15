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
