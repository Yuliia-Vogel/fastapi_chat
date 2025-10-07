 import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react-swc'
    
    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      server: {
        host: '0.0.0.0', // слухати на всіх мережевих інтерфейсах
        port: 3000,
        // для hot-reload всередині Docker
        watch: {
          usePolling: true,
        },
      },
    })