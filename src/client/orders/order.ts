import { getOrders } from "../../utils/localStorage";
import { logout } from "../../utils/auth";
import type { Pedido } from "../../types/Pedido";

// Verificar admin
const verificarAdmin = (): void => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    const adminPanel = document.getElementById("adminPanel");
    
    if (adminPanel && userData?.role === "admin") {
        adminPanel.style.display = "block";
    }
};

// Obtener color del badge según estado
const getEstadoColor = (estado: string): string => {
    const colores: Record<string, string> = {
        'Pendiente': '#ffc107',
        'Procesado': '#17a2b8',
        'En Preparación': '#6c757d',
        'Enviado': '#007bff',
        'Entregado': '#28a745'
    };
    return colores[estado] || '#6c757d';
};

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
    const estadoColor = getEstadoColor(pedido.estado);
    
    return `
        <div class="order-card">
            <div class="order-card__header">
                <div class="order-card__info">
                    <h3 class="order-card__title">Pedido #${pedido.id}</h3>
                    <p class="order-card__date">📅 ${fecha}</p>
                </div>
                <span class="order-badge" style="background-color: ${estadoColor}">
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
    
    // Ordenar por fecha (más reciente primero)
    pedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    // Filtrar por estado
    if (filtro !== 'Todos') {
        pedidos = pedidos.filter(p => p.estado === filtro);
    }
    
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
    
    container.innerHTML = pedidos.map(crearHTMLPedido).join('');
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
    const currentUser = JSON.parse(localStorage.getItem("userData") || "null");
    if (!currentUser) {
        logout();
        return;
    }
    
    verificarAdmin();
    renderizarPedidos();
    configurarFiltro();
    
    // Logout
    const btnLogout = document.getElementById('logoutButton');
    btnLogout?.addEventListener('click', logout);
});