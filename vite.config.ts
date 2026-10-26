import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [reactRouter()],
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
})
