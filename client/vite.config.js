import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
    css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {    
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000  
    port: 3000, 
},})
