import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cho phép tất cả các host (bao gồm ngrok) truy cập vào Vite Dev Server
    allowedHosts: true
  }
})
