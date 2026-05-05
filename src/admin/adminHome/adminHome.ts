import {  logout } from "../../utils/auth";
import { getProducts, getCategories, getOrders } from "../../utils/localStorage";
import { verificarAdmin } from "../../utils/auth";

// Elementos del DOM para las estadísticas
const countProductsEl = document.getElementById('count-products');
const countCategoriesEl = document.getElementById('count-categories');
const countAvailableEl = document.getElementById('count-available');

// Elementos del DOM para resumen de estadísticas
const totalRevenueEl = document.getElementById('total-revenue');
const countPendingEl = document.getElementById('count-pending');
const countPreparingEl = document.getElementById('count-preparing');
const countCompletedEl = document.getElementById('count-completed');


const actualizarEstadisticas = () => {
    
    const productos = getProducts();
    const categorias = getCategories();
    // 1. Contar totales
    if (countProductsEl) countProductsEl.textContent = productos.length.toString();
    if (countCategoriesEl) countCategoriesEl.textContent = categorias.length.toString();
    
    // 2. Contar solo disponibles
    const disponibles = productos.filter(p => p.estado === 'Disponible').length;
    if (countAvailableEl) countAvailableEl.textContent = disponibles.toString();
    
    // 3. Simular Pedidos (Si aún no tienes el storage de pedidos)
    const countOrdersEl = document.getElementById('count-orders');
    if (countOrdersEl) countOrdersEl.textContent = "0"; 
};

//FUNCION PARA MODIFICAR  EL RESUMEN DE ESTADISTICAS, SE DEBE LLAMAR CADA VEZ QUE SE REALICE UNA MODIFICACION EN LOS PRODUCTOS O CATEGORIAS
const actualizarResumen = () => {
    const pedidos = getOrders();
    if (totalRevenueEl) totalRevenueEl.textContent = pedidos.reduce(((total, p) => total + (p.estado === 'Entregado' ? p.total : 0)), 0).toString(); 
    if (countPendingEl) countPendingEl.textContent = pedidos.filter(p => p.estado === 'Pendiente').length.toString();
    if (countPreparingEl) countPreparingEl.textContent = pedidos.filter(p => p.estado === 'En Preparación').length.toString();
    if (countCompletedEl) countCompletedEl.textContent = pedidos.filter(p => p.estado === 'Entregado').length.toString();
};
const setupEventListeners = () => {
    const buttonLogout = document.getElementById("logoutButton");
    buttonLogout?.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
    });
};

const init = (): void => {
    setupEventListeners();
    actualizarEstadisticas();
    verificarAdmin();
    actualizarResumen();
};

document.addEventListener('DOMContentLoaded', init);