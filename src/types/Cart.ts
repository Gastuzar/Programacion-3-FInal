import type { Producto } from "./Products";
export interface CartItem extends Producto {
    cantidad: number;
}