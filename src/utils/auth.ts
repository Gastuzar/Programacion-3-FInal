import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { navigate } from "./navigate";
import { clearSession } from "./localStorage";

// Función para verificar la autenticación y autorización del usuario
export function checkAuth(rolRequerido: Rol): IUser | null {
    const userDataRaw = localStorage.getItem("userData");

    if (!userDataRaw) {
        navigate("/src/pages/auth/login/login.html");
        return null; 
    }

    const userData: IUser = JSON.parse(userDataRaw);

    if (rolRequerido === "admin" && userData.rol !== "admin") {
        alert("No tenés permisos para acceder a esta sección");
        navigate("/src/pages/client/home.html");
        return null;
    }
    return userData;

}

//para la page admin
export const verificarAdmin = (): void => {
    // Intentamos obtener el usuario validado
    const userData = checkAuth("admin");
    
    // Si no hay user, checkAuth ya redirigió, así que cortamos ejecución aquí
    if (!userData) return;
    
    // Mostrar nombre del admin
    const adminNameEl = document.getElementById("admin-name");
    if (adminNameEl) {
        adminNameEl.textContent = `${(userData.nombre.toString())} ${userData.apellido.toString()}`;
    }
};

//Para ocultar el panel de admin
const mostrarPanelAdmin = (rol: string): void => {
    const adminPanelLink = document.getElementById("adminPanel");
    if (adminPanelLink) {
        if (rol === "admin") {
            adminPanelLink.style.display = "block";
        } else {
            adminPanelLink.style.display = "none";
        }
    }
};
//Para las pages client
export const verificarClient = (): void => {
    const userData = checkAuth("client");
    if (!userData) return;
    mostrarPanelAdmin(userData.rol);
}

// Función para cerrar sesión
export const logout = () => {
    clearSession();
    navigate("/src/pages/auth/login/login.html");
}