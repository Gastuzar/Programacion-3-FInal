import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
        input: {
            // ── Entrada principal ──────────────────────────
            index: resolve(__dirname, 'index.html'),

            // ── Auth ───────────────────────────────────────
            login:    resolve(__dirname, 'src/pages/auth/login/login.html'),
            registro: resolve(__dirname, 'src/pages/auth/registro/registro.html'),

            // ── Cliente ────────────────────────────────────
            clientHome:    resolve(__dirname, 'src/pages/client/home.html'),
            clientOrders:  resolve(__dirname, 'src/pages/client/orders.html'),
            clientCart:    resolve(__dirname, 'src/pages/client/cart.html'),
            productDetail: resolve(__dirname, 'src/pages/client/productDetails.html'),

            // ── Admin ──────────────────────────────────────
            adminHome:       resolve(__dirname, 'src/pages/admin/admin.html'),
            adminCategorias: resolve(__dirname, 'src/pages/admin/categorias.html'),
            adminProductos:  resolve(__dirname, 'src/pages/admin/productos.html'),
            adminOrders:     resolve(__dirname, 'src/pages/admin/orders.html'),
        },
        },
    },
    base: './',
});