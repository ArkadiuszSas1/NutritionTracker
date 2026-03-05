import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true,
    allowedHosts: ['.nip.io'],
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    proxy: {
      '/analyzeFood': {
        target: 'http://127.0.0.1:5001/nutritiontracker-706c4/us-central1',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
