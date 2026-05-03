import { getOrders } from "../../utils/localStorage";
import { logout, verificarClient } from "../../utils/auth";
import type { Pedido } from "../../types/Pedido";

// Formatear fecha
const formatearFecha = (isoString: string): string => {
    const fecha = new Date(isoString);
    const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
};

// Crear HTML de un pedido
const crearHTMLPedido = (pedido: Pedido): string => {
    const fecha = formatearFecha(pedido.fecha);
    const totalProductos = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
    
    return `
        <div class="order-card">
            <div class="order-card__header">
                <div class="order-card__info">
                    <h3 class="order-card__title">Pedido #${pedido.id}</h3>
                    <p class="order-card__date">📅 ${fecha}</p>
                </div>
                <span class="order-badge order-badge--${pedido.estado.replace(/\s+/g, '')}">
                    ${pedido.estado}
                </span>
            </div>
            
            <div class="order-card__body">
                <div class="order-items-preview">
                    ${pedido.items.slice(0, 2).map(item => `
                        <div class="order-item-mini">
                            <span>• ${item.nombre} (x${item.cantidad})</span>
                        </div>
                    `).join('')}
                    ${pedido.items.length > 2 ? `
                        <p class="order-more-items">
                            +${pedido.items.length - 2} producto(s) más
                        </p>
                    ` : ''}
                </div>
                
                <div class="order-summary-mini">
                    <p class="order-products-count">
                        📦 ${totalProductos} producto(s)
                    </p>
                    <p class="order-total">
                        <strong>$${pedido.total.toFixed(2)}</strong>
                    </p>
                </div>
            </div>
        </div>
    `;
};

// Renderizar pedidos
const renderizarPedidos = (filtro: string = 'Todos'): void => {
    const container = document.getElementById('orders-container');
    if (!container) return;
    
    let pedidos = getOrders();

    // 1. Recuperar el usuario actual desde el localStorage
    const sessionData = localStorage.getItem("userData");
    const currentUser = sessionData ? JSON.parse(sessionData) : null;

    if (!currentUser) {
        console.error("No se encontró una sesión activa.");
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    pedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    // Filtrar por estado
    if (filtro !== 'Todos') {
        pedidos = pedidos.filter(p => p.estado === filtro);
    }
    const pedidosUsuario = pedidos.filter(pedido => pedido.userId === currentUser.id);

    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">📦</div>
                <h3>No tienes pedidos</h3>
                <p>${filtro !== 'Todos' ? `No hay pedidos con estado "${filtro}"` : 'Aún no has realizado ningún pedido'}</p>
                <a href="./home.html" class="button button--primary">Ir a la tienda</a>
            </div>
        `;
        return;
    }
    if (pedidosUsuario.length > 0) {
        container.innerHTML = pedidosUsuario.map(pedido => crearHTMLPedido(pedido)).join('');
    }
    
};

// Configurar filtro
const configurarFiltro = (): void => {
    const filterSelect = document.getElementById('filter-status') as HTMLSelectElement;
    
    filterSelect?.addEventListener('change', (e) => {
        const filtro = (e.target as HTMLSelectElement).value;
        renderizarPedidos(filtro);
    });
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    verificarClient();
    renderizarPedidos();
    configurarFiltro();
    
    // Logout
    const btnLogout = document.getElementById('logoutButton');
    btnLogout?.addEventListener('click', logout);
});