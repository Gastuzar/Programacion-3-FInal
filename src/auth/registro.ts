import type { IUser } from "../types/IUser";
import { saveUser, getUsers } from "../utils/localStorage";
import { navigate } from "../utils/navigate";

const form     = document.getElementById("registro-form") as HTMLFormElement;
const errorMsg = document.getElementById("error-msg")     as HTMLParagraphElement;

form.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  // Obtener valores de los campos
  const email    = (document.getElementById("email")    as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value.trim();


  // Validación básica
  if (!email || !password) {
    mostrarError("Completá todos los campos.");
    return;
  }

  // Verificar que el email no esté ya registrado
  //.some devuelve true si encuentra al menos un elemento que cumple la condición, en este caso, si ya existe un usuario con ese email
  const yaExiste = getUsers().some(u => u.email === email);
  if (yaExiste) {
    mostrarError("Ese email ya está registrado.");
    return;
  }

  if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/)) {
    mostrarError("La contraseña debe tener al menos:\n- una letra mayúscula\n- una letra minúscula\n- un número\n- ser de 6 a 20 caracteres.");
    return;
  }
  const nuevoUsuario: IUser = {
    id: Date.now(),
    nombre: "",
    apellido: "",
    email,
    password,
    rol: "client",
    telefono: "",
    loggedIn: false,
  };

  saveUser(nuevoUsuario);
  alert("¡Registro exitoso! Redirigiendo al login...");
  navigate("/src/pages/auth/login/login.html");
  console.log("Nuevo usuario registrado:", nuevoUsuario);
});

//error predeterminado si no se cumplen las validaciones
function mostrarError(msg: string): void {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}
