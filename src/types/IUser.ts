import type { Rol } from "./Rol";

export interface IUser {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    loggedIn: boolean | null;
    telefono?: string;
    password: string;
    rol: Rol;
}

export const userExample: IUser = {
    id: 1111,
    nombre: "Admin",
    apellido: "Admin",
    email: "admin@admin.com",
    loggedIn: null,
    telefono: "3584567890",
    password: "Admin123",
    rol: "admin"
}
export const userExample2: IUser = {
    id: 2222,
    nombre: "Cliente",
    apellido: "Cliente",
    email: "cliente@cliente.com",
    loggedIn: null,
    telefono: "3584567890",
    password: "Client123",
    rol: "client"
}
