import { getProducts, getCategories, addToCart } from "../../utils/localStorage";
import { navigate } from "../../utils/navigate";
import type { Producto }  from "../../types/Products";
import type { Categoria } from "../../types/Categories";

document.addEventListener("DOMContentLoaded", () => {
    // Recuperar el ID del storage
    const idGuardado = localStorage.getItem("selectedProductId");
    const id = parseInt(idGuardado || "0");
    const productos = getProducts();
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        alert("No se seleccionó ningún producto válido.");
        return navigate("../../pages/client/home.html");
    }

    // Renderizar los datos
    renderizarDatosProducto(producto, getCategories());
    
    // Configurar botón del carrito
    configurarBotonCart(producto);
});

function renderizarDatosProducto(producto: Producto, categorias: Categoria[]) {
    const nombreCat = categorias.find(c => c.id === producto.categoriaId)?.nombre || "Sin categoría";
    
    (document.getElementById("detail-image") as HTMLImageElement).src = producto.imagen;
    (document.getElementById("detail-category") as HTMLElement).textContent = nombreCat;
    (document.getElementById("detail-name") as HTMLElement).textContent = producto.nombre;
    (document.getElementById("detail-price") as HTMLElement).textContent = `$${producto.precio.toFixed(2)}`;
    (document.getElementById("detail-description") as HTMLElement).textContent = producto.descripcion;

    const statusEl = document.getElementById("detail-status");
    if (statusEl) {
        const enStock = (producto.stock || 0) > 0;
        const color = enStock ? "#1a9c6d" : "#ff3d77";
        const texto = enStock ? "Disponible" : "Agotado";
        
        statusEl.innerHTML = `
            <span style="background: ${color}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                ${texto.toUpperCase()} ${enStock ? `(Stock: ${producto.stock})` : ''}
            </span>
        `;
    }

    // Evento botón volver
    document.getElementById("btn-back")?.addEventListener("click", () => {
        window.history.back();
    });

    // Lógica del selector de cantidad
    const inputQty = document.getElementById("quantity") as HTMLInputElement;
    const stockMax = producto.stock || 1;
    
    document.getElementById("btn-plus")?.addEventListener("click", () => {
        const val = parseInt(inputQty.value);
        if (val < stockMax) {
            inputQty.value = (val + 1).toString();
        } else {
            alert(`Stock máximo disponible: ${stockMax}`);
        }
    });
    
    document.getElementById("btn-minus")?.addEventListener("click", () => {
        const val = parseInt(inputQty.value);
        if (val > 1) inputQty.value = (val - 1).toString();
    });
}

// Configurar botón agregar al carrito
const configurarBotonCart = (producto: Producto): void => {
    const btnCart = document.getElementById("btn-add-cart") as HTMLButtonElement;
    const inputQty = document.getElementById("quantity") as HTMLInputElement;
    
    // Deshabilitar si no hay stock
    if (!producto.stock || producto.stock <= 0) {
        btnCart.disabled = true;
        btnCart.textContent = "Sin Stock";
        btnCart.style.opacity = "0.5";
        btnCart.style.cursor = "not-allowed";
        return;
    }
    
    btnCart.addEventListener("click", () => {
        const cantidad = parseInt(inputQty.value) || 1;
        
        // Validar cantidad
        if (cantidad <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
        }
        
        if (producto.stock && cantidad > producto.stock) {
            alert(`Solo hay ${producto.stock} unidades disponibles`);
            return;
        }
        
        // Agregar al carrito
        addToCart(producto, cantidad);
        
        // Mostrar confirmación
        const confirmacion = confirm(
            `✅ ${cantidad} x ${producto.nombre} agregado al carrito\n\n` +
            `¿Deseas ir al carrito ahora?`
        );
        
        if (confirmacion) {
            navigate("../../pages/client/cart.html");
        } else {
            // Resetear cantidad
            inputQty.value = "1";
            
            // Opcional: Mostrar notificación
            mostrarNotificacion(`${producto.nombre} agregado al carrito`);
        }
    });
};

// Mostrar notificación temporal
const mostrarNotificacion = (mensaje: string): void => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = mensaje;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a9c6d;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
};