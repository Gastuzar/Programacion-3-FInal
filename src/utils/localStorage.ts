import type { IUser } from "../types/IUser";
import type { Producto } from "../types/Products";
import type { Categoria } from "../types/Categories";
import type { CartItem } from "../types/Cart";
import type { Pedido } from "../types/Pedido";

// USUARIOS Y SESIÓN EN LOCALSTORAGE


//claves para localStorage son string
const USERS_KEY : string = "users";
const SESSION_KEY : string = "userData";

//users
// Obtengo el array de usuarios desde localStorage, si no hay nada devuelvo un array vacío
export function getUsers(): IUser[] {
    try {
        // devuelvo un array vacío si no hay nada o si el JSON es inválido
        return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as IUser[];
    } catch {
        // Si el JSON es inválido, limpio el localStorage para evitar futuros errores
        return [];
    }
}

export function saveUser(user: IUser): void {
    // Agrego el nuevo usuario al array existente y lo guardo de nuevo en localStorage
    const users = getUsers();
    users.push(user);
    // Guardo el array actualizado en localStorage
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

//busco un usuario por email y password, si no lo encuentro devuelvo undefined
export function findUser(email: string, password: string): IUser | undefined {
    // busco un usuario que coincida con el email y password proporcionados
    return getUsers().find(u => u.email === email && u.password === password);
}

//session

// Guardo los datos del usuario logueado en localStorage para mantener la sesión activa
export function setSession(user: IUser): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Obtengo los datos del usuario logueado de localStorage, si no hay sesión activa devuelvo null
export function getSession(): IUser | null {
    try {
        // Intento obtener los datos del usuario logueado
        const data = localStorage.getItem(SESSION_KEY);
        // Si hay datos, los parseo y los devuelvo como IUser, si no hay datos devuelvo null
        return data ? (JSON.parse(data) as IUser) : null;
    } catch {
        return null;
    }
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

// PRODUCTOS

const STORAGE_KEY = "products";

export function getProducts(): Producto[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error al parsear productos:", error);
        return [];
    }
}

export function saveProducts(products: Producto[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Producto): void {
    const products = getProducts();
    // Opcional: Validar que el ID no se repita
    if (products.some(p => p.id === product.id)) {
        console.warn("El producto ya existe");
        return;
    }
    products.push(product);
    saveProducts(products);
}

export function updateProduct(product: Producto): void {
    const products = getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
        products[index] = product;
        saveProducts(products);
    }
}

// Función extra: Eliminar producto
export function deleteProduct(id: number): void {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    saveProducts(filteredProducts);
}

export function getNextProductId(): number {
    const products = getProducts();
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}


// CATEGORIAS

const CATEGORY_KEY = "categories";

export function getCategories(): Categoria[] {
    try {
        const data = localStorage.getItem(CATEGORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error al parsear categorías:", error);
        return [];
    }
}

export function saveCategories(categories: Categoria[]): void {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

export function addCategory(category: Categoria): void {
    const categories = getCategories();
    
    // Validar que el ID no se repita
    if (categories.some(c => c.id === category.id)) {
        console.warn("La categoría con ese ID ya existe");
        return;
    }
    
    categories.push(category);
    saveCategories(categories);
}

export function updateCategory(category: Categoria): void {
    const categories = getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    
    if (index !== -1) {
        categories[index] = category;
        saveCategories(categories);
    } else {
        console.warn("Categoría no encontrada");
    }
}

export function deleteCategory(id: number): void {
    const categories = getCategories();
    const filteredCategories = categories.filter(c => c.id !== id);
    saveCategories(filteredCategories);
}

// Función para obtener una categoría por ID
export function getCategoryById(id: number): Categoria | undefined {
    const categories = getCategories();
    return categories.find(c => c.id === id);
}

// Función para generar un nuevo ID automático
export function getNextId(): number {
    const categories = getCategories();
    if (categories.length === 0) return 1;
    return Math.max(...categories.map(c => c.id)) + 1;
}

// Función para inicializar con datos de ejemplo (opcional)
export function initializeCategories(): void {
    const categories = getCategories();
    
    if (categories.length === 0) {
        const defaultCategories: Categoria[] = [
            { id: 1, nombre: "Hamburguesas", descripcion: "Deliciosas hamburguesas artesanales" },
            { id: 2, nombre: "Pizzas", descripcion: "Pizzas al horno de leña" },
            { id: 3, nombre: "Bebidas", descripcion: "Refrescos y bebidas naturales" },
            { id: 4, nombre: "Postres", descripcion: "Dulces y postres caseros" }
        ];
        
        saveCategories(defaultCategories);
    }
}

//cart CRUD


const CART_KEY = "cart";

export const getCart = (): CartItem[] => {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveCart = (cart: CartItem[]): void => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (producto: Producto, cantidad: number): void => {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === producto.id);

    if (index !== -1) {
        cart[index].cantidad += cantidad;
    } else {
        cart.push({ ...producto, cantidad });
    }
    saveCart(cart);
};

export const removeFromCart = (id: number): void => {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== id);
    saveCart(updatedCart);
};

export const updateQuantity = (id: number, newQuantity: number): void => {
    const cart = getCart();
    const updatedCart = cart.map(item => (item.id === id ? { ...item, cantidad: newQuantity } : item));
    saveCart(updatedCart);
};

const ORDER_KEY = "orders";

export const getOrders = (): Pedido[] => {
    try {
        const data = localStorage.getItem(ORDER_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error al parsear pedidos:", error);
        return [];
    }
}

export const saveOrders = (orders: Pedido[]): void => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

export const addPedido = (pedido: Pedido): void => {
    const orders = getOrders();
    orders.push(pedido);
    saveOrders(orders);
}

export const updatePedido = (pedido: Pedido): void => {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === pedido.id);

    if (index !== -1) {
        orders[index] = pedido;
        saveOrders(orders);
    } else {
        console.warn("Pedido no encontrado");
    }
}

export const deletePedido = (id: number): void => {
    const orders = getOrders();
    const filteredOrders = orders.filter(o => o.id !== id);
    saveOrders(filteredOrders);
}

export const getPedidoById = (id: number): Pedido | undefined => {
    const orders = getOrders();
    return orders.find(o => o.id === id);
}