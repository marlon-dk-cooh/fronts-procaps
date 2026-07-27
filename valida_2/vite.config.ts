import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // VALIDA va montado adentro del hub en /valida (con un <iframe>), así que
  // todos los assets y rutas tienen que colgar de esta base. Aplica igual en
  // dev (detrás del proxy de Vite del hub) y en prod (nginx sirviendo /valida-app/).
  base: '/valida-app/',
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 5174,
  },
})
