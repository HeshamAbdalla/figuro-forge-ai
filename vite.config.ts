
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          animations: ['framer-motion'],
          auth: ['@supabase/supabase-js'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Remove debug code in production
    __DEV__: mode !== 'production',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'framer-motion'
    ]
  }
}));
