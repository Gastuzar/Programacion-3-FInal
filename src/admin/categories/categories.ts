import type { Categoria } from "../../types/Categories";
import {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getNextId,
    initializeCategories
} from "../../utils/localStorage";
import { verificarAdmin } from "../../utils/auth";

// Variables del DOM
let modal: HTMLElement | null;
let formulario: HTMLFormElement | null;
let btnNuevaCategoria: HTMLElement | null;
let btnCerrarModal: HTMLElement | null;
let tablaBody: HTMLElement | null;
let categoriaIdInput: HTMLInputElement | null;
let modalTitulo: HTMLElement | null;

// Inicializar elementos del DOM
const inicializarDOM = (): void => {
    modal = document.getElementById('modal-categoria');
    formulario = document.getElementById('formulario-categoria') as HTMLFormElement;
    btnNuevaCategoria = document.getElementById('btn-nueva-categoria');
    btnCerrarModal = document.querySelector('.modal__close');
    tablaBody = document.getElementById('tabla-categorias');
    categoriaIdInput = document.getElementById('categoria-id') as HTMLInputElement;
    modalTitulo = document.getElementById('modal-titulo');
};

// Crear HTML para una fila de la tabla
const crearFilaCategoria = (categoria: Categoria): string => {
    return `
        <tr class="table__tr">
            <td class="table__td">${categoria.id}</td>
            <td class="table__td">${categoria.nombre}</td>
            <td class="table__td">${categoria.descripcion}</td>
            <td class="table__td">
                <button class="button button--small button--warning" data-id="${categoria.id}" data-action="editar">
                    Editar
                </button>
                <button class="button button--small button--danger" data-id="${categoria.id}" data-action="eliminar">
                    Eliminar
                </button>
            </td>
        </tr>
    `;
};

// Cargar categorías en la tabla
const cargarCategorias = (): void => {
    const categorias = getCategories(); // Obtener desde localStorage
    
    if (tablaBody) {
        if (categorias.length === 0) {
            tablaBody.innerHTML = `
                <tr class="table__tr">
                    <td class="table__td" colspan="4" style="text-align: center;">
                        No hay categorías registradas
                    </td>
                </tr>
            `;
        } else {
            tablaBody.innerHTML = categorias.map(crearFilaCategoria).join("");
            configurarBotonesAcciones();
        }
    }
};

// Abrir modal
const abrirModal = (categoriaId?: number): void => {
    if (modal && formulario && modalTitulo && categoriaIdInput) {
        // Limpiar formulario y configurar modal para creación o edición
        modal.classList.add('modal--active');
        
        if (categoriaId) {
            // Modo edición
            const categorias = getCategories();
            const categoria = categorias.find(c => c.id === categoriaId);
            
            if (categoria) {
                modalTitulo.textContent = 'Editar Categoría';
                categoriaIdInput.value = categoria.id.toString();
                (document.getElementById('input-nombre') as HTMLInputElement).value = categoria.nombre;
                (document.getElementById('input-descripcion') as HTMLTextAreaElement).value = categoria.descripcion;
            }
        } else {
            // Modo creación
            modalTitulo.textContent = 'Nueva Categoría';
            formulario.reset();
            categoriaIdInput.value = '';
        }
        
        // Focus en el primer input
        const primerInput = document.getElementById('input-nombre') as HTMLInputElement;
        primerInput?.focus();
    }
};

// Cerrar modal
const cerrarModal = (): void => {
    modal?.classList.remove('modal--active');
    formulario?.reset();
};

// Guardar categoría (crear o editar)
const guardarCategoria = (e: Event): void => {
    e.preventDefault();
    
    const nombre = (document.getElementById('input-nombre') as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById('input-descripcion') as HTMLTextAreaElement).value.trim();
    const categoriaIdValue = categoriaIdInput?.value;
    
    if (!nombre || !descripcion) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    if (categoriaIdValue) {
        // Editar categoría existente
        const categoria: Categoria = {
            id: parseInt(categoriaIdValue),
            nombre,
            descripcion
        };
        
        updateCategory(categoria);
        alert('Categoría actualizada exitosamente');
    } else {
        // Crear nueva categoría
        const nuevaCategoria: Categoria = {
            id: getNextId(),
            nombre,
            descripcion
        };
        
        addCategory(nuevaCategoria);
        alert('Categoría creada exitosamente');
    }
    
    cargarCategorias();
    cerrarModal();
};

// Editar categoría
const editarCategoria = (id: number): void => {
    abrirModal(id);
};

// Eliminar categoría
const eliminarCategoria = (id: number): void => {
    const categorias = getCategories();
    const categoria = categorias.find(c => c.id === id);
    
    if (categoria && confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
        deleteCategory(id);
        alert('Categoría eliminada exitosamente');
        cargarCategorias();
    }
};

// Configurar eventos de los botones de acciones (editar/eliminar)
const configurarBotonesAcciones = (): void => {
    const botonesAccion = document.querySelectorAll<HTMLButtonElement>('[data-action]');
    
    botonesAccion.forEach(boton => {
        boton.addEventListener('click', () => {
            const id = parseInt(boton.dataset.id || '0');
            const accion = boton.dataset.action;
            
            if (accion === 'editar') {
                editarCategoria(id);
            } else if (accion === 'eliminar') {
                eliminarCategoria(id);
            }
        });
    });
};

// Configurar eventos generales
const configurarEventos = (): void => {
    // Abrir modal para nueva categoría
    btnNuevaCategoria?.addEventListener('click', () => abrirModal());
    
    // Cerrar modal
    btnCerrarModal?.addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e: MouseEvent) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && modal?.classList.contains('modal--active')) {
            cerrarModal();
        }
    });
    
    // Guardar categoría al enviar formulario
    formulario?.addEventListener('submit', guardarCategoria);
};

// Inicializar aplicación
const init = (): void => {
    initializeCategories(); // Inicializar categorías por defecto si no hay ninguna
    inicializarDOM();
    cargarCategorias();
    configurarEventos();
    verificarAdmin(); // Verificar que el usuario es admin
};

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);