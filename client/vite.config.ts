// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Include if you're using React
import path from 'path'; // Correctly import 'path'

// If you're using TypeScript's `__dirname`, ensure it's correctly used
// Alternatively, you can use `import.meta.url` for ESM compatibility

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Use __dirname now that TypeScript recognizes it
    },
  },
  server: {
    fs: {
      allow: ["C:/health-center/client"], // Adjust if necessary
    },
  },
  build: {
    rollupOptions: {
      external: [
        // List the problematic third-party modules here
        'module_name_1',
        'module_name_2',
        // Add all modules causing errors
      ],
    },
  },
});
