import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // дозволяю Vite приймати з'єднання ззовні контейнера
    port: 3000, // вказую, який саме порт
    // для хот-релоад всередині докера
    watch: {
      usePolling: true,
    },
  },
})