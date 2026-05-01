import type { Categoria } from "../../types/Categories";
import type { Producto } from "../../types/Products";
import { logout } from "../../utils/auth";
import { getProducts } from "../../utils/localStorage";
import { getCategories } from "../../utils/localStorage";
import { navigate } from "../../utils/navigate";

// --- Funciones de Renderizado ---

const crearHTMLCategorias = (categoria: Categoria): string => {
    return `<li class="aside__li">
        <a href="#" data-categoria-id="${categoria.id}">${categoria.nombre}</a>
    </li>`;
};

const crearHTMLProducto = (producto: Producto): string => {
    return `
        <article class="article" data-id="${producto.id}" style="cursor: pointer;">
            <img src="${producto.imagen}" alt="${producto.nombre} imagen" class="article__img">
            <h3 class="article__title">${producto.nombre}</h3>
            <p class="article__description">${producto.descripcion}</p>
            <p class="article__price">Precio: <strong class="article__strong">$${producto.precio}</strong></p>
            <p class="article__stock"><strong class="article__strong">${producto.estado}</strong></p>
        </article>
    `;
};
const mostrarPanelAdmin = (rol: string): void => {
    const adminPanelLink = document.getElementById("adminPanel");
    if (adminPanelLink) {
        if (rol === "admin") {
            adminPanelLink.style.display = "block";
        } else {
            adminPanelLink.style.display = "none";
        }
    }
};

// --- Funciones de Carga ---

const cargarProductos = (productos: Producto[]): void => {
    const contenedorProductos = document.getElementById("contenedor-productos");


    if (contenedorProductos) {
        if (productos.length > 0) {
            contenedorProductos.innerHTML = productos.map(crearHTMLProducto).join("");
        } else {
            contenedorProductos.innerHTML = `
                <div class="empty-state">
                    <p>No hay productos disponibles en este momento</p>
                </div>
            `;
        }
    }
};

const cargarCategorias = (categorias: Categoria[]): void => {
    const listaCategorias = document.getElementById("lista-categorias");
    
    if (listaCategorias) {
        if (categorias.length > 0) {
            // Agregar opción "Todas" al inicio
            const htmlTodas = `<li class="aside__li">
                <a href="#" data-categoria-id="all" class="categoria-link active">Todas</a>
            </li>`;
            
            const htmlCategorias = categorias.map(crearHTMLCategorias).join("");
            listaCategorias.innerHTML = htmlTodas + htmlCategorias;
            
            // Configurar eventos de filtrado por categoría
            configurarFiltrosCategorias();
        } else {
            listaCategorias.innerHTML = `
                <li class="aside__li">
                    <p class="aside__empty">No hay categorías creadas</p>
                    <small>Ve al panel de administración para crear categorías</small>
                </li>
            `;
        }
    } else {
        console.error("No se encontró el elemento #lista-categorias en el HTML");
    }
};

// Nueva función: Filtrar productos por categoría
const filtrarProductosPorCategoria = (categoriaId: number | string): void => {
    const todosProductos = getProducts();
    
    let productosFiltrados: Producto[];
    
    if (categoriaId === 'all') {
        productosFiltrados = todosProductos;
    } else {
        productosFiltrados = todosProductos.filter(
            p => p.categoriaId === Number(categoriaId)
        );
    }
    
    cargarProductos(productosFiltrados);
    configurarEventosBotones();
};

// Nueva función: Configurar eventos de filtros de categorías
const configurarFiltrosCategorias = (): void => {
    const enlacesCategorias = document.querySelectorAll<HTMLAnchorElement>('[data-categoria-id]');
    
    enlacesCategorias.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            enlacesCategorias.forEach(link => link.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            enlace.classList.add('active');
            
            // Filtrar productos
            const categoriaId = enlace.dataset.categoriaId;
            if (categoriaId) {
                filtrarProductosPorCategoria(categoriaId);
            }
        });
    });
};
//sacarle agregar al carrito y ver detalles y solo diga precio y disponibilidad
const configurarEventosBotones = (): void => {
    // Botones de ver detalles
    document.querySelectorAll<HTMLElement>(".article").forEach(card => {
        card.addEventListener("click", () => {         
            const productoId = card.dataset.id;
            if (productoId) {
                localStorage.setItem("selectedProductId", productoId);
                // Navegamos pasando el ID como parámetro en la URL
                navigate(`../../pages/client/productDetails`);
            }
        });
    });
};


// --- Inicialización UNIFICADA ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificación de sesión
    const currentUser = JSON.parse(localStorage.getItem("userData") || "null");
    if (!currentUser) {
        logout();
        return;
    }
    mostrarPanelAdmin(currentUser.rol);

    // 2. OBTENER DATOS REALES DEL STORAGE
    const productosData = getProducts();
    const categoriasData = getCategories(); // ← OBTENER CATEGORÍAS DEL STORAGE

    // 3. RENDERIZAR CATEGORÍAS
    cargarCategorias(categoriasData);

    // 4. RENDERIZAR PRODUCTOS
    if (productosData.length > 0) {
        cargarProductos(productosData);
        configurarEventosBotones();
    } else {
        console.log("No hay productos en el LocalStorage");
        // Mostrar mensaje en el contenedor
        const contenedorProductos = document.getElementById("contenedor-productos");
        if (contenedorProductos) {
            contenedorProductos.innerHTML = `
                <div class="empty-state">
                    <h3>No hay productos disponibles</h3>
                    <p>Actualmente no tenemos productos en el catálogo.</p>
                    <p>Por favor, vuelve más tarde o contacta al administrador.</p>
                </div>
            `;
        }
    }

    
    // 5. Configurar Logout
    const buttonLogout = document.getElementById("logoutButton") as HTMLButtonElement;
    buttonLogout?.addEventListener("click", logout);
});