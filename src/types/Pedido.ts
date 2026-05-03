import type { CartItem } from "./Cart";
import type { IUser } from "./IUser";

export interface Pedido {
    id: number; // Cambiar a number para usar Date.now()
    userId: IUser['id'];
    items: CartItem[];
    subtotal: number; // Añadir subtotal
    envio: number; // Añadir costo de envío
    total: number;
    fecha: string; // ISO string
    estado: 'Pendiente' | 'Procesado' | 'En Preparación' | 'Enviado' | 'Entregado';
    // Datos adicionales del pedido
    telefono?: string;
    direccion?: string;
    metodoPago?: string;
    notas?: string;
}