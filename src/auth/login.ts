import type { IUser } from "../types/IUser";
import { navigate } from "../utils/navigate";
import { userExample, userExample2, userExample3 } from "../types/IUser";

// Crear usuarios de ejemplo si no existen
const initAuth = () => {
  // Solo crea los usuarios si el storage está vacío
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([userExample, userExample2, userExample3]));
    console.log("Usuarios de prueba creados en LocalStorage");
  }
};

const form     = document.getElementById("login-form")      as HTMLFormElement;
const errorMsg = document.getElementById("error-msg") as HTMLParagraphElement;

form.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  const email    = (document.getElementById("email")    as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value.trim();

  initAuth();
  // Validación básica
  if (!email || !password) {
    mostrarError("Completá todos los campos.");
    return;
  }

  // Obtener usuarios del storage
  const users: IUser[] = JSON.parse(localStorage.getItem("users") || "[]");

  const usuario = users.find(u => u.email === email && u.password === password);

  if (!usuario) {
    mostrarError("Email o contraseña incorrectos.");
    return;
  }
  // Guardar sesión
  localStorage.setItem("userData", JSON.stringify(usuario));

  // Redirigir según rol
  if (usuario.rol === "admin" ) {
    navigate("/src/pages/admin/admin.html");
  } else {
    navigate("/src/pages/client/home.html");
  }
});

function mostrarError(msg: string): void {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}