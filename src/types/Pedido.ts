import type { CartItem } from "./Cart";
import type { IUser } from "./IUser";

export interface Pedido {
    id: number; 
    userId: IUser['id'];
    items: CartItem[];
    subtotal: number; 
    envio: number; 
    total: number;
    fecha: string; 
    estado: 'Pendiente' | 'Procesado' | 'En Preparación' | 'Enviado' | 'Entregado';
    // Datos adicionales del pedido
    telefono?: string;
    direccion?: string;
    metodoPago?: string;
    notas?: string;
}