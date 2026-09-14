import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use repository base path for GitHub Pages, root for Vercel and local development
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES === 'true' || (process.env.GITHUB_ACTIONS && !process.env.VERCEL) ? '/MVP-FixTag/' : '/'),
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
})
