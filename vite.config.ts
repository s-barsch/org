import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
//import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  build: { watch: {} },
  server: {
    hmr: false
  },
  /*
  server: {
    hmr: {
      // host: "yourdomainname.com",
      port: 5173,
      protocol: "ws",
    },
  },
  */
  plugins: [
    react(),
    svgr({
    // svgr options: https://react-svgr.com/docs/options/
    svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
     include: "**/*.svg",
    }),
   ],
})
