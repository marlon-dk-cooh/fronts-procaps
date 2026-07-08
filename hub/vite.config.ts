import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8501,
    watch: {
      usePolling: false,
      interval: 1000
    },
    // El iframe de /valida pide /valida-app/*. Lo reenviamos al dev server de
    // VALIDA (valida_2, en el puerto 5174) para que en dev cargue desde el mismo
    // origen. Necesitas tener corriendo `npm run dev` también en valida_2.
    // ws: true reenvía el websocket del HMR de VALIDA.
    proxy: {
      '/valida-app': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
