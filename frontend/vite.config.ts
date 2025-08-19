import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Greenstagram - Your Eco Social Network',
          short_name: 'Greenstagram',
          description: 'A social media platform for sustainability enthusiasts',
          theme_color: '#22c55e',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      }),
    ],
    css: {
      postcss: './postcss.config.js',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/services': path.resolve(__dirname, './src/services')
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/api': { target: 'http://localhost:5000', changeOrigin: true },
        '/socket.io': { target: 'http://localhost:5000', ws: true }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            ui: ['framer-motion'],
            utils: ['axios', 'date-fns', 'clsx']
          }
        }
      }
    },
    define: {
      'process.env': env
    }
  };
});
