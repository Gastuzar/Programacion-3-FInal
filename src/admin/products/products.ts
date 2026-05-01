import type { Producto as Product } from "../../types/Products";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getNextProductId,
    getCategories,
    initializeCategories
} from "../../utils/localStorage";
import { verificarAdmin } from "../../utils/auth";

// Variables del DOM
let modal: HTMLElement | null;
let formulario: HTMLFormElement | null;
let btnNuevoProducto: HTMLElement | null;
let btnCerrarModal: HTMLElement | null;
let tablaBody: HTMLElement | null;
let productoIdInput: HTMLInputElement | null;
let modalTitulo: HTMLElement | null;
let selectCategoria: HTMLSelectElement | null;

// Inicializar elementos del DOM
const inicializarDOM = (): void => {
    modal = document.getElementById('modal-producto');
    formulario = document.getElementById('formulario-producto') as HTMLFormElement;
    btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    btnCerrarModal = document.querySelector('.modal__close');
    tablaBody = document.getElementById('tabla-productos');
    productoIdInput = document.getElementById('producto-id') as HTMLInputElement;
    modalTitulo = document.getElementById('modal-titulo');
    selectCategoria = document.getElementById('input-categoriaId') as HTMLSelectElement;
};

// Llenar el select de categorías con datos del localStorage
const cargarOpcionesCategorias = (): void => {
    if (!selectCategoria) return;
    const categorias = getCategories();
    
    selectCategoria.innerHTML = categorias.map(cat => 
        `<option value="${cat.id}">${cat.nombre}</option>`
    ).join("");
};

// Crear HTML para una fila de la tabla
const crearFilaProducto = (producto: Product): string => {
    const categorias = getCategories();
    const nombreCategoria = categorias.find(c => c.id === producto.categoriaId)?.nombre || 'Sin categoría';

    return `
        <tr class="table__tr">
            <td class="table__td">${producto.id}</td>
            <td class="table__td"><img src="${producto.imagen}" alt="${producto.nombre}" class="table__img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td class="table__td"><strong>${producto.nombre}</strong></td>
            <td class="table__td">${producto.descripcion}</td>
            <td class="table__td">$${producto.precio}</td>
            <td class="table__td">${nombreCategoria}</td>
            <td class="table__td">${producto.stock ?? 0}</td>
            <td class="table__td">
                <span class="status status--${producto.estado}">${producto.estado}</span>
            </td>
            <td class="table__td">
                <button class="button button--small button--warning" data-id="${producto.id}" data-action="editar">Editar</button>
                <button class="button button--small button--danger" data-id="${producto.id}" data-action="eliminar">Eliminar</button>
            </td>
        </tr>
    `;
};

// Cargar productos en la tabla
const cargarProductos = (): void => {
    const productos = getProducts();
    if (tablaBody) {
        if (productos.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;">No hay productos registrados</td></tr>`;
        } else {
            tablaBody.innerHTML = productos.map(crearFilaProducto).join("");
            configurarBotonesAcciones();
        }
    }
};

// Abrir modal
const abrirModal = (productoId?: number): void => {
    if (modal && formulario && modalTitulo && productoIdInput) {
        cargarOpcionesCategorias(); // Refrescar categorías al abrir
        modal.classList.add('modal--active');

        if (productoId) {
            const producto = getProducts().find(p => p.id === productoId);
            if (producto) {
                modalTitulo.textContent = 'Editar Producto';
                productoIdInput.value = producto.id.toString();
                (document.getElementById('input-nombre') as HTMLInputElement).value = producto.nombre;
                (document.getElementById('input-descripcion') as HTMLTextAreaElement).value = producto.descripcion;
                (document.getElementById('input-precio') as HTMLInputElement).value = producto.precio.toString();
                (document.getElementById('input-imagen') as HTMLInputElement).value = producto.imagen;
                (document.getElementById('input-categoriaId') as HTMLSelectElement).value = producto.categoriaId.toString();
                (document.getElementById('input-stock') as HTMLInputElement).value = producto.stock?.toString() || '';
                (document.getElementById('input-disponible') as HTMLInputElement).checked = producto.estado === 'Disponible';
            }
        } else {
            modalTitulo.textContent = 'Nuevo Producto';
            formulario.reset();
            productoIdInput.value = '';
        }
        
        document.getElementById('input-nombre')?.focus();
    }
};

const cerrarModal = (): void => {
    modal?.classList.remove('modal--active');
    formulario?.reset();
};

const guardarProducto = (e: Event): void => {
    e.preventDefault();

    const nombre = (document.getElementById('input-nombre') as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById('input-descripcion') as HTMLTextAreaElement).value.trim();
    const precio = parseFloat((document.getElementById('input-precio') as HTMLInputElement).value);
    const imagen = (document.getElementById('input-imagen') as HTMLInputElement).value.trim();
    const categoriaId = parseInt((document.getElementById('input-categoriaId') as HTMLSelectElement).value);
    const stock = parseInt((document.getElementById('input-stock') as HTMLInputElement).value) || 0;

    // Captura del checkbox (esto devuelve true o false)
    const checkboxDisponible = document.getElementById('input-disponible') as HTMLInputElement;
    const disponible = checkboxDisponible ? checkboxDisponible.checked : false;

    // Validar campos obligatorios
    if (!nombre || isNaN(precio) || isNaN(categoriaId)) {
        alert('Por favor, completa los campos obligatorios');
        return;
    }

    const datosProducto: Product = {
        id: productoIdInput?.value ? parseInt(productoIdInput.value) : getNextProductId(),
        nombre,
        descripcion,
        precio,
        imagen,
        categoriaId,
        stock,
        estado: disponible ? 'Disponible' : 'Agotado'
    };

    // Si el productoIdInput tiene valor, es una edición; si no, es un nuevo producto
    if (productoIdInput?.value) {
        updateProduct(datosProducto);
    } else {
        addProduct(datosProducto);
    }

    cargarProductos();
    cerrarModal();
};

const configurarBotonesAcciones = (): void => {
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(boton.dataset.id || '0');
            if (boton.dataset.action === 'editar') abrirModal(id);
            if (boton.dataset.action === 'eliminar' && confirm('¿Eliminar producto?')) {
                deleteProduct(id);
                cargarProductos();
            }
        });
    });
};

const configurarEventos = (): void => {
    btnNuevoProducto?.addEventListener('click', () => abrirModal());
    btnCerrarModal?.addEventListener('click', cerrarModal);
    window.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
    formulario?.addEventListener('submit', guardarProducto);
};

// Ejecución inicial
document.addEventListener('DOMContentLoaded', () => {
    initializeCategories(); // Precarga categorías si no existen
    inicializarDOM();
    configurarEventos();
    cargarProductos();
    verificarAdmin();
});