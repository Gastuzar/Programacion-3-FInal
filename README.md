Food Store — Sistema de Gestión de Pedidos de Comida
Aplicación web para la gestión de un negocio de comidas. Permite a clientes navegar el catálogo, agregar productos al carrito y realizar pedidos; y a administradores gestionar categorías, productos y el estado de los pedidos.

Requisitos previos
HerramientaVersión mínimaNode.js18.x o superiornpm9.x o superior
Verificá tus versiones con:
bash node -v
pnpm -v

Instalación y ejecución

1. Clonar el repositorio
bash git clone https://github.com/tu-usuario/final-prog3.git
cd final-prog3

2. Instalar dependencias
bash pnpm install

3. Ejecutar en modo desarrollo
bash pnpm run dev
El proyecto estará disponible en: http://localhost:5173

4. Compilar para producción
bash pnpm run build

5. Previsualizar la build de producción
bash pnpm run preview

Usuarios de prueba (precargados automáticamente)
Al iniciar sesión por primera vez, el sistema crea automáticamente los siguientes usuarios:

Rol: Admin / Admin / Cliente

Email: admin@admin.com / cliente@cliente.com

Contraseña:  Admin123 /  Client123

Estos usuarios se inicializan en localStorage la primera vez que se accede al login. 

Flujo de autenticación

El usuario ingresa credenciales en /src/pages/auth/login/login.html
El frontend valida contra los usuarios en localStorage
Si es exitoso, guarda userData en localStorage y redirige según el rol:

Admin → /src/pages/admin/admin.html
Cliente → /src/pages/client/home.html


Cada página protegida verifica localStorage al cargar
El logout limpia userData y redirige al login


Scripts disponibles
Comando: pnpm run dev / pnpm run build / pnpm run preview
Descripción: Inicia el servidor de desarrollo con hot-reload / Compila TypeScript y genera la build de producción en /dist / Sirve la build de producción localmente


Video presentacion: https://drive.google.com/file/d/1QgBa6cqw343VnxjXIFzdVEg6J5t649J_/view?usp=sharing


