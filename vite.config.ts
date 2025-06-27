
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
        // Enhanced console log removal
        drop_console: mode === 'production',
        drop_debugger: true,
        // Remove all console methods in production
        pure_funcs: mode === 'production' ? [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
          'console.error',
          'console.trace',
          'console.time',
          'console.timeEnd',
          'console.group',
          'console.groupEnd',
          'console.groupCollapsed',
          'console.clear',
          'console.count',
          'console.countReset',
          'console.dir',
          'console.dirxml',
          'console.table'
        ] : [],
        // Remove comments in production
        comments: false,
        // Additional optimizations
        dead_code: true,
        unused: true,
        toplevel: true,
        // Remove process.env.NODE_ENV checks in production
        global_defs: mode === 'production' ? {
          'process.env.NODE_ENV': '"production"'
        } : {}
      },
      mangle: {
        // Mangle all names in production for smaller bundle
        toplevel: mode === 'production'
      },
      format: {
        // Remove all comments in production
        comments: false
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Remove debug code in production
    __DEV__: mode !== 'production',
    // Define production mode for conditional compilation
    'process.env.NODE_ENV': JSON.stringify(mode),
    // Additional production flags
    __PRODUCTION__: mode === 'production',
    __DEVELOPMENT__: mode === 'development'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'framer-motion'
    ]
  },
  // Additional production settings
  esbuild: {
    // Remove console logs during build with esbuild
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Minify identifiers in production
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production'
  }
}));
