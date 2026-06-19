import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const localSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
}

const productionCsp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' http://127.0.0.1:1234; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
const developmentCsp = productionCsp.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'").replace("connect-src 'self'", "connect-src 'self' ws://127.0.0.1:4173")

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    port: 4173,
    headers: { ...localSecurityHeaders, 'Content-Security-Policy': developmentCsp },
    proxy: {
      '/lmstudio': {
        target: 'http://127.0.0.1:1234',
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/lmstudio/, ''),
      },
    },
  },
  preview: {
    strictPort: true,
    port: 4173,
    headers: { ...localSecurityHeaders, 'Content-Security-Policy': productionCsp },
  },
})
