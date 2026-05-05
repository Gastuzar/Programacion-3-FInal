import type { Categoria } from "../../types/Categories";
import type { Producto } from "../../types/Products";
import { logout, verificarClient } from "../../utils/auth";
import { getProducts, getCategories } from "../../utils/localStorage";
import { navigate } from "../../utils/navigate";

/*Obtiene la categoría activa del DOM en lugar de una variable global */
const getCategoriaActiva = (): string | number => {
    const enlaceActivo = document.querySelector<HTMLAnchorElement>('[data-categoria-id].active');
    return enlaceActivo?.dataset.categoriaId || 'all';
};

/*Obtiene el texto de búsqueda actual del input*/
const getTextoBusqueda = (): string => {
    const input = document.getElementById('buscarProductos') as HTMLInputElement;
    return input?.value.toLowerCase().trim() || '';
};

/** Obtiene el criterio de ordenamiento actual del select*/
const getCriterioOrden = (): string => {
    const select = document.getElementById('btn-ordenar') as HTMLSelectElement;
    return select?.value || 'default';
};

/** Filtra productos según categoría, búsqueda y ordenamiento*/
const obtenerProductosFiltrados = (): Producto[] => {
    const todosLosProductos = getProducts();
    const categoriaActiva = getCategoriaActiva();
    const textoBusqueda = getTextoBusqueda();
    const criterioOrden = getCriterioOrden();

    // 1. Filtrar por categoría
    let filtrados = categoriaActiva === 'all' 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoriaId === Number(categoriaActiva));

    // 2. Filtrar por texto de búsqueda
    if (textoBusqueda) {
        filtrados = filtrados.filter(p => 
            p.nombre.toLowerCase().includes(textoBusqueda) ||
            p.descripcion.toLowerCase().includes(textoBusqueda)
        );
    }

    // 3. Ordenar
    const productosOrdenados = ordenarProductos(filtrados, criterioOrden);
    
    return productosOrdenados;
};

/** Ordena un array de productos según el criterio*/
const ordenarProductos = (productos: Producto[], criterio: string): Producto[] => {
    const copia = [...productos];
    
    switch (criterio) {
        case 'precio-asc':
            return copia.sort((a, b) => a.precio - b.precio);
        case 'precio-desc':
            return copia.sort((a, b) => b.precio - a.precio);
        case 'az':
            return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
        case 'za':
            return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
        default:
            return copia;
    }
};


const crearHTMLCategorias = (categoria: Categoria): string => {
    return `<li class="aside__li">
        <a href="#" class="categoria-link" data-categoria-id="${categoria.id}">
            ${categoria.nombre}
        </a>
    </li>`;
};

const crearHTMLProducto = (producto: Producto): string => {
    const estadoClass = producto.estado === 'Disponible' 
        ? 'product-card__badge--disponible' 
        : 'product-card__badge--agotado';
    
    return `
        <article class="product-card" data-producto-id="${producto.id}">
            <img src="${producto.imagen}" 
                alt="${producto.nombre}" 
                class="product-card__image"
                onerror="this.src='../../assets/images/placeholder.jpg'">
            <h3 class="product-card__title">${producto.nombre}</h3>
            <p class="product-card__description">${producto.descripcion}</p>
            <div class="product-card__footer">
                <p class="product-card__price">$${producto.precio.toFixed(2)}</p>
                <span class="product-card__badge ${estadoClass}">
                    ${producto.estado}
                </span>
            </div>
        </article>
    `;
};

const renderizarProductos = (): void => {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    const productos = obtenerProductosFiltrados();

    if (productos.length === 0) {
        const textoBusqueda = getTextoBusqueda();
        const mensaje = textoBusqueda 
            ? `No se encontraron productos que coincidan con "${textoBusqueda}"`
            : 'No hay productos disponibles en esta categoría';
        
        contenedor.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🔍</div>
                <h3 class="empty-state__title">Sin resultados</h3>
                <p class="empty-state__message">${mensaje}</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = productos.map(crearHTMLProducto).join("");
    configurarClickProductos();
};

const renderizarCategorias = (): void => {
    const listaCategorias = document.getElementById("lista-categorias");
    if (!listaCategorias) return;

    const categorias = getCategories();

    if (categorias.length === 0) {
        listaCategorias.innerHTML = `
            <li class="aside__li">
                <p class="aside__empty">No hay categorías creadas</p>
                <small class="aside__help-text">
                    Ve al panel de administración para crear categorías
                </small>
            </li>
        `;
        return;
    }

    const htmlTodas = `
        <li class="aside__li">
            <a href="#" data-categoria-id="all" class="categoria-link active">Todas</a>
        </li>`;        
    
    const htmlCategorias = categorias.map(crearHTMLCategorias).join("");
    listaCategorias.innerHTML = htmlTodas + htmlCategorias;
    
    configurarClickCategorias();
};

const inicializarSelectOrden = (): void => {
    const selectOrden = document.getElementById('btn-ordenar') as HTMLSelectElement;
    if (!selectOrden) return;

    selectOrden.innerHTML = `
        <option value="default" selected>Ordenar por...</option>
        <option value="precio-asc">Precio: Menor a Mayor</option>
        <option value="precio-desc">Precio: Mayor a Menor</option>
        <option value="az">Nombre: A - Z</option>
        <option value="za">Nombre: Z - A</option>
    `;
};

const configurarClickProductos = (): void => {
    document.querySelectorAll<HTMLElement>('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productoId = card.dataset.productoId;
            if (productoId) {
                localStorage.setItem('selectedProductId', productoId);
                navigate('../../pages/client/productDetails');
            }
        });
    });
};

const configurarClickCategorias = (): void => {
    const enlaces = document.querySelectorAll<HTMLAnchorElement>('.categoria-link');
    
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            
            enlaces.forEach(link => link.classList.remove('active'));
            enlace.classList.add('active');
            
            renderizarProductos();
        });
    });
};

const configurarBusqueda = (): void => {
    const form = document.querySelector('.main__form');
    const input = document.getElementById('buscarProductos') as HTMLInputElement;
    
    // Búsqueda al enviar el formulario
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        renderizarProductos();
    });
    
    // Búsqueda en tiempo real
    input?.addEventListener('input', debounce(() => {
        renderizarProductos();
    }, 300));
};

const configurarOrdenamiento = (): void => {
    const select = document.getElementById('btn-ordenar') as HTMLSelectElement;
    
    select?.addEventListener('change', () => {
        renderizarProductos();
    });
};

/* Debounce para optimizar la búsqueda en tiempo real*/
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return function(this: any, ...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const inicializar = (): void => {
    // 1. Verificar autenticación
    verificarClient();

    // 2. Renderizar interfaz inicial
    renderizarCategorias();
    inicializarSelectOrden();
    renderizarProductos();

    // 3. Configurar eventos
    configurarBusqueda();
    configurarOrdenamiento();

    // 4. Configurar logout
    const btnLogout = document.getElementById('logoutButton');
    btnLogout?.addEventListener('click', logout);
};

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', inicializar);