export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    categoriaId: number; 
    stock: number; 
    estado: 'Disponible' | 'Agotado';
}