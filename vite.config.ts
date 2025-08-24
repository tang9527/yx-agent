import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  define: {
    'process.env.VITE_GRAPHQL_ENDPOINT': JSON.stringify(
      process.env.VITE_GRAPHQL_ENDPOINT || 'http://api.pdf2json.com/graphql'
    ),
  },
})