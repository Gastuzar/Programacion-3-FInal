import { 
    getCart, 
    removeFromCart, 
    updateQuantity, 
    saveCart,
    addPedido,
    getProducts,
    saveProducts
} from "../../utils/localStorage";
import { navigate } from "../../utils/navigate";
import { logout } from "../../utils/auth";
import type { CartItem } from "../../types/Cart";
import type { Pedido } from "../../types/Pedido";

// Constantes
const SHIPPING_COST = 500;

// Renderizar el carrito
const renderCart = (): void => {
    const cart = getCart();
    const contenedor = document.getElementById("cart-items");
    if (!contenedor) return;

    if (cart.length === 0) {
        contenedor.innerHTML = `
            <div class="cart-empty">
                <h3>Tu carrito está vacío</h3>
                <p>¡Agrega algunos productos deliciosos!</p>
                <button class="button button--primary" id="btn-seguir-comprando">
                    Ir a la Tienda
                </button>
            </div>
        `;
        
        document.getElementById("btn-seguir-comprando")?.addEventListener("click", () => {
            navigate("../../pages/client/home.html");
        });
        
        actualizarTotales(0);
        return;
    }

    let subtotal = 0;

    contenedor.innerHTML = cart.map(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;

        return `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item__img" onerror="this.src='../../assets/images/placeholder.jpg'">
                <div class="cart-item__info">
                    <h4>${item.nombre}</h4>
                    <p class="cart-item__description">${item.descripcion}</p>
                    <p class="cart-item__price-unit">$${item.precio.toFixed(2)} c/u</p>
                </div>
                <div class="cart-item__controls">
                    <div class="quantity-selector">
                        <button class="btn-qty" data-id="${item.id}" data-action="minus">-</button>
                        <span class="quantity-display">${item.cantidad}</span>
                        <button class="btn-qty" data-id="${item.id}" data-action="plus">+</button>
                    </div>
                    <span class="cart-item__total">$${totalItem.toFixed(2)}</span>
                    <button class="btn-delete" data-id="${item.id}" title="Eliminar producto">🗑️</button>
                </div>
            </div>
        `;
    }).join("");

    actualizarTotales(subtotal);
    configurarEventosCart();
};

// Crear HTML del modal de pago
const crearHTMLpago = (subtotal: number): string => {
    const total = subtotal + SHIPPING_COST;
    return `
        <div class="modal-overlay" id="modal-pago">
            <div class="payment-modal">
                <button class="modal-close" id="btn-cerrar-modal">&times;</button>
                <h3 class="payment-modal__title">Completar Pedido</h3>
                
                <div class="payment-modal__form">
                    <div class="form__group">
                        <label class="form__label">Teléfono:</label>
                        <input type="tel" id="input-telefono" class="form__input" placeholder="Ej: +54 11 2345-6789" required>
                    </div>
                    
                    <div class="form__group">
                        <label class="form__label">Dirección de Entrega:</label>
                        <input type="text" id="input-direccion" class="form__input" placeholder="Calle, Número, piso, depto" required>
                    </div>
                    
                    <div class="form__group">
                        <label class="form__label">Método de Pago:</label>
                        <select id="input-metodo-pago" class="form__select" required>
                            <option value="">Seleccione un método</option>
                            <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                            <option value="Transferencia bancaria">Transferencia bancaria</option>
                            <option value="Efectivo al recibir">Efectivo al recibir</option>
                        </select>
                    </div>
                    
                    <div class="form__group">
                        <label class="form__label">Notas adicionales (opcional):</label>
                        <textarea id="input-notas" class="form__textarea" placeholder="Instrucciones especiales, timbre, etc." rows="3"></textarea>
                    </div>
                    
                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Envío:</span>
                            <span>$${SHIPPING_COST.toFixed(2)}</span>
                        </div>
                        <hr>
                        <div class="summary-row summary-row--total">
                            <span>Total a pagar:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button class="button button--primary button--full" id="btn-confirmar-pago">
                        Confirmar Pedido
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Actualizar totales
const actualizarTotales = (subtotal: number): void => {
    const subtotalEl = document.getElementById("summary-subtotal");
    const shippingEl = document.getElementById("summary-shipping");
    const totalEl = document.getElementById("summary-total");

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    
    const total = subtotal + shipping;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    actualizarContadorCarrito();
};

// Configurar eventos del carrito
const configurarEventosCart = (): void => {
    document.querySelectorAll<HTMLButtonElement>(".btn-qty").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id || "0");
            const action = btn.dataset.action;
            manejarCambioQuantidad(id, action as "plus" | "minus");
        });
    });

    document.querySelectorAll<HTMLButtonElement>(".btn-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id || "0");
            eliminarProducto(id);
        });
    });
};

// Manejar cambio de cantidad
const manejarCambioQuantidad = (id: number, action: "plus" | "minus"): void => {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    
    if (!item) return;

    let newQuantity = item.cantidad;

    if (action === "plus") {
        if (item.stock && newQuantity >= item.stock) {
            alert(`Stock máximo disponible: ${item.stock}`);
            return;
        }
        newQuantity++;
    } else if (action === "minus") {
        if (newQuantity > 1) {
            newQuantity--;
        } else {
            if (confirm("¿Deseas eliminar este producto del carrito?")) {
                eliminarProducto(id);
                return;
            }
            return;
        }
    }

    updateQuantity(id, newQuantity);
    renderCart();
    animarActualizacion(id);
};

// Eliminar producto del carrito
const eliminarProducto = (id: number): void => {
    const cart = getCart();
    const producto = cart.find(i => i.id === id);
    
    if (!producto) return;
    
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}" del carrito?`)) {
        removeFromCart(id);
        renderCart();
        mostrarNotificacion(`${producto.nombre} eliminado del carrito`);
    }
};

// Vaciar carrito completo
const vaciarCarrito = (): void => {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert("El carrito ya está vacío");
        return;
    }
    
    if (confirm("¿Estás seguro de vaciar todo el carrito?")) {
        saveCart([]);
        renderCart();
        mostrarNotificacion("Carrito vaciado");
    }
};

// Proceder al pago - Mostrar modal
const procederAlPago = (): void => {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de continuar.");
        return;
    }
    
    // Validar stock
    const hayProblemasStock = cart.some(item => {
        if (item.stock !== undefined && item.cantidad > item.stock) {
            alert(`"${item.nombre}" no tiene suficiente stock. Disponible: ${item.stock}`);
            return true;
        }
        return false;
    });
    
    if (hayProblemasStock) return;
    
    // Calcular subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Crear y mostrar modal
    const modalHTML = crearHTMLpago(subtotal);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos del modal
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const btnConfirmarPago = document.getElementById("btn-confirmar-pago");
    const modalOverlay = document.getElementById("modal-pago");
    
    btnCerrarModal?.addEventListener("click", cerrarModal);
    modalOverlay?.addEventListener("click", (e) => {
        if (e.target === modalOverlay) cerrarModal();
    });
    
    btnConfirmarPago?.addEventListener("click", () => {
        validarYConfirmarPedido(cart, subtotal);
    });
};

// Cerrar modal
const cerrarModal = (): void => {
    const modal = document.getElementById("modal-pago");
    modal?.remove();
};

// Validar y confirmar pedido
const validarYConfirmarPedido = (cart: CartItem[], subtotal: number): void => {
    const telefono = (document.getElementById("input-telefono") as HTMLInputElement)?.value.trim();
    const direccion = (document.getElementById("input-direccion") as HTMLInputElement)?.value.trim();
    const metodoPago = (document.getElementById("input-metodo-pago") as HTMLSelectElement)?.value;
    const notas = (document.getElementById("input-notas") as HTMLTextAreaElement)?.value.trim();
    
    // Validaciones
    if (!telefono) {
        alert("Por favor, ingresa un teléfono de contacto");
        return;
    }
    
    if (!direccion) {
        alert("Por favor, ingresa una dirección de entrega");
        return;
    }
    
    if (!metodoPago) {
        alert("Por favor, selecciona un método de pago");
        return;
    }
    
    // Crear pedido
    const total = subtotal + SHIPPING_COST;
    
    const pedido: Pedido = {
        id: Date.now(),
        items: cart,
        subtotal,
        envio: SHIPPING_COST,
        total,
        fecha: new Date().toISOString(),
        estado: 'Pendiente',
        telefono,
        direccion,
        metodoPago,
        notas: notas || undefined
    };
    
    // Guardar pedido
    addPedido(pedido);
    
    // Actualizar stock
    actualizarStockProductos(cart);
    
    // Limpiar carrito
    saveCart([]);
    
    // Cerrar modal
    cerrarModal();
    
    // Mostrar confirmación
    alert(`¡Pedido confirmado!\n\nNúmero de pedido: #${pedido.id}\nTotal: $${total.toFixed(2)}\n\nGracias por tu compra.`);
    
    // Redirigir a mis pedidos
    navigate("../../pages/client/orders.html");
};

// Actualizar stock de productos
const actualizarStockProductos = (cart: CartItem[]): void => {
    const productos = getProducts();
    
    cart.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto && producto.stock !== undefined) {
            producto.stock -= item.cantidad;
        }
    });
    
    saveProducts(productos);
};

// Actualizar contador del carrito
const actualizarContadorCarrito = (): void => {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    
    const badge = document.getElementById("cart-badge");
    if (badge) {
        badge.textContent = totalItems.toString();
        badge.style.display = totalItems > 0 ? "inline" : "none";
    }
};

// Animación de actualización
const animarActualizacion = (productId: number): void => {
    const item = document.querySelector(`[data-product-id="${productId}"]`);
    if (item) {
        item.classList.add('cart-item--updating');
        setTimeout(() => {
            item.classList.remove('cart-item--updating');
        }, 300);
    }
};

// Mostrar notificación
const mostrarNotificacion = (mensaje: string): void => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('notification--show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('notification--show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
};

// Verificar admin
const verificarAdmin = (): void => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    const adminPanel = document.getElementById("adminPanel");
    
    if (adminPanel && userData?.role === "admin") {
        adminPanel.style.display = "block";
    }
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("userData") || "null");
    if (!currentUser) {
        logout();
        return;
    }
    
    verificarAdmin();
    renderCart();
    
    const btnCheckout = document.getElementById("btn-checkout");
    btnCheckout?.addEventListener("click", procederAlPago);
    
    const btnEmptyCart = document.getElementById("btn-empty-cart");
    btnEmptyCart?.addEventListener("click", vaciarCarrito);
    
    const btnLogout = document.getElementById("logoutButton");
    btnLogout?.addEventListener("click", logout);
});