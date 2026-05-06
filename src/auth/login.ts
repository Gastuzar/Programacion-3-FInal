import { navigate } from "../utils/navigate";
import { userExample, userExample2 } from "../types/IUser";
import { findUser, setSession } from "../utils/localStorage";


const form     = document.getElementById("login-form")      as HTMLFormElement;
const errorMsg = document.getElementById("error-msg") as HTMLParagraphElement;
const users = [userExample, userExample2];  

form.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  const email    = (document.getElementById("email")    as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value.trim();

  const userFound = users.find(u => u.email === email && u.password === password);

  if (userFound) {
      // 2. Establecer la sesión con el usuario ENCONTRADO únicamente
      setSession(userFound); 
      localStorage.setItem("userData", JSON.stringify(userFound));
      if (userFound.rol === "admin") {
          navigate("/src/pages/admin/admin.html");
      } else {
          navigate("/src/pages/client/home.html");
      }
    }

  // Validación básica
  if (!email || !password) {
    mostrarError("Completá todos los campos.");
    return;
  }

  // Obtener usuarios del storage

  const usuario = findUser(email, password);
  if (!usuario) {
      mostrarError("Email o contraseña incorrectos.");
      return;
  }
  setSession(usuario);
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