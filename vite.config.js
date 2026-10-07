import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the FCAJ Document Management System front-end.
// - `npm run dev`   : start the local dev server (http://localhost:3000)
// - `npm run build` : create the production bundle in the `dist/` folder
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    // The bundle includes Amplify, Bootstrap and Font Awesome (~510 kB).
    chunkSizeWarningLimit: 1000,
  },
});
