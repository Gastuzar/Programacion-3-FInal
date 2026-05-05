import { getOrders, updatePedido, getUsers } from "../../utils/localStorage";
import { logout, verificarAdmin } from "../../utils/auth";
import type { Pedido } from "../../types/Pedido";


// 1. Formatear fecha 
const formatearFecha = (isoString: string): string => {
    const fecha = new Date(isoString);
    return fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
};

const obtenerNombreCliente = (userId: any): string => {
    const usuarios = getUsers();
    
    const cliente = usuarios.find(u => String(u.id) === String(userId));
    
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Usuario Desconocido";
};

// 2. HTML de la Card 
const crearHTMLPedidoAdmin = (pedido: Pedido): string => {
    const fecha = formatearFecha(pedido.fecha);
    const totalProductos = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Usamos una clase dinámica: order-badge--Pendiente, order-badge--Enviado, etc.
    const claseEstado = `order-badge--${pedido.estado.replace(/\s+/g, '')}`;

    return `
        <div class="admin-order-card" data-order-id="${pedido.id}">
            <div class="admin-order-card__header">
                <div>
                    <h3 class="admin-order-card__title">Pedido #${pedido.id}</h3>
                    <p class="admin-order-card__client">Cliente:${obtenerNombreCliente(pedido.userId)}</p>
                    <p class="admin-order-card__date">${fecha}</p>
                </div>
                <span class="order-badge ${claseEstado}">
                    ${pedido.estado}
                </span>
            </div>
            <div class="admin-order-card__body">
                <p class="admin-order-card__products">${totalProductos} producto(s)</p>
            </div>
            <div class="admin-order-card__footer">
                <p class="admin-order-card__total">$${pedido.total.toFixed(2)}</p>
                <button class="button button--small button--primary" data-pedido-id="${pedido.id}">
                    Ver detalles
                </button>
            </div>
        </div>
    `;
};

// Crear HTML de modal de detalles
const crearHTMLDetalles = (pedido: Pedido): string => {
    return `
        <h2 class="modal-title">Detalle del Pedido #${pedido.id}</h2>

        <div class="order-details">
            <div class="order-details__section">
                <h3>Información del Cliente</h3>
                <p class="admin-order-card__client"><strong>Cliente:</strong> ${obtenerNombreCliente(pedido.userId)}</p>
                <p><strong>Fecha:</strong> ${formatearFecha(pedido.fecha)}</p>
                <p><strong>Teléfono:</strong> ${pedido.telefono || 'N/A'}</p>
                <p><strong>Email:</strong> N/A</p>
                <p><strong>Método de pago:</strong> ${pedido.metodoPago || 'Efectivo'}</p>
            </div>
            
            ${pedido.direccion ? `
                <div class="order-details__section">
                    <h3>Dirección de Envío</h3>
                    <p>${pedido.direccion}</p>
                </div>
            ` : ''}
            
            ${pedido.notas ? `
                <div class="order-details__section">
                    <h3>Notas Adicionales</h3>
                    <p>${pedido.notas}</p>
                </div>
            ` : ''}
            
            <div class="order-details__section">
                <h3>Productos:</h3>
                <div class="order-products-list">
                    ${pedido.items.map(item => `
                        <div class="order-product-item">
                            <div class="order-product-item__info">
                                <strong>${item.nombre}</strong>
                                <span class="order-product-item__qty">Cantidad: ${item.cantidad} × $${item.precio.toFixed(2)}</span>
                            </div>
                            <span class="order-product-item__total">$${(item.cantidad * item.precio).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="order-details__totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${pedido.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Envío:</span>
                    <span>$${pedido.envio.toFixed(2)}</span>
                </div>
                <hr>
                <div class="total-row total-row--final">
                    <span>Total:</span>
                    <span>$${pedido.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="order-details__actions">
                <label for="change-status">Cambiar Estado:</label>
                <select id="change-status" class="status-select">
                    <option value="Pendiente" ${pedido.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Procesado" ${pedido.estado === 'Procesado' ? 'selected' : ''}>Procesado</option>
                    <option value="En Preparación" ${pedido.estado === 'En Preparación' ? 'selected' : ''}>En Preparación</option>
                    <option value="Enviado" ${pedido.estado === 'Enviado' ? 'selected' : ''}>Enviado</option>
                    <option value="Entregado" ${pedido.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                </select>
                <button class="button button--success" id="btn-actualizar-estado" data-pedido-id="${pedido.id}">
                    Actualizar Estado
                </button>
            </div>
        </div>
    `;
};

// Renderizar pedidos (admin)
const renderizarPedidosAdmin = (filtro: string = 'Todos'): void => {
    const container = document.getElementById('orders-admin-container');
    if (!container) return;
    
    let pedidos = getOrders();
    
    // Ordenar por fecha
    pedidos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    // Filtrar
    if (filtro !== 'Todos') {
        pedidos = pedidos.filter(p => p.estado === filtro);
    }
    
    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No hay pedidos</h3>
                <p>${filtro !== 'Todos' ? `No hay pedidos con estado "${filtro}"` : 'No se han realizado pedidos aún'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pedidos.map(crearHTMLPedidoAdmin).join('');
    
    // Configurar eventos de los botones "Ver detalles"
    configurarBotonesDetalles();
};

// Configurar botones de ver detalles
const configurarBotonesDetalles = (): void => {
    const botones = document.querySelectorAll<HTMLButtonElement>('[data-pedido-id]');
    
    botones.forEach(boton => {
        // Solo agregar evento si no tiene la clase de actualizar
        if (!boton.id || boton.id !== 'btn-actualizar-estado') {
            boton.addEventListener('click', () => {
                const pedidoId = parseInt(boton.dataset.pedidoId || '0');
                abrirDetallesPedido(pedidoId);
            });
        }
    });
};

// 3. Lógica del Modal (USANDO CLASES)
const abrirDetallesPedido = (pedidoId: number): void => {
    const pedido = getOrders().find(p => p.id === pedidoId);
    if (!pedido) return;

    const modal = document.getElementById('modal-order-details');
    const content = document.getElementById('order-details-content');

    if (modal && content) {
        content.innerHTML = crearHTMLDetalles(pedido);
        // ACTIVAMOS EL MODAL CON LA CLASE DEL CSS
        modal.classList.add('modal--active'); 
        
        document.getElementById('btn-actualizar-estado')?.addEventListener('click', () => {
            actualizarEstadoPedido(pedidoId);
        });
    }
};

// Cerrar modal
const cerrarModal = (): void => {
    const modal = document.getElementById('modal-order-details');
    // DESACTIVAMOS CON CLASE
    modal?.classList.remove('modal--active');
};

// Actualizar estado del pedido
const actualizarEstadoPedido = (pedidoId: number): void => {
    const selectEstado = document.getElementById('change-status') as HTMLSelectElement;
    const nuevoEstado = selectEstado.value as Pedido['estado'];
    
    const pedido = getOrders().find(p => p.id === pedidoId);
    if (!pedido) return;
    
    pedido.estado = nuevoEstado;
    updatePedido(pedido);
    
    alert('Estado actualizado correctamente');
    cerrarModal();
    
    // Re-renderizar
    const filtro = (document.getElementById('filter-status-admin') as HTMLSelectElement)?.value || 'Todos';
    renderizarPedidosAdmin(filtro);
};

// Configurar filtro
const configurarFiltro = (): void => {
    const filterSelect = document.getElementById('filter-status-admin') as HTMLSelectElement;
    
    filterSelect?.addEventListener('change', (e) => {
        const filtro = (e.target as HTMLSelectElement).value;
        renderizarPedidosAdmin(filtro);
    });
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    verificarAdmin();
    renderizarPedidosAdmin();
    configurarFiltro();
    
    // Cerrar modal
    document.getElementById('close-modal')?.addEventListener('click', cerrarModal);
    document.getElementById('modal-order-details')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) cerrarModal();
    });
    
    // Logout
    document.getElementById('logoutButton')?.addEventListener('click', logout);
});