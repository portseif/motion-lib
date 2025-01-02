<<<<<<< HEAD
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: true,
        hmr: {
            host: 'motion-lib.test',
            protocol: 'http'
        }
    },
    build: {
        lib: {
            entry: 'src/main.js',
            name: 'MotionLib',
            fileName: (format) => `motion-lib.${format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            external: ['motion'],
            output: {
                globals: {
                    motion: 'motion',
                },
                exports: 'named',
            },
        },
        minify: 'esbuild',
        sourcemap: true,
    },
    resolve: {
        alias: {
            'motion': 'motion'
        }
    },
    optimizeDeps: {
        include: ['motion']
    },
    base: '/',
});
=======
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // Basic configuration
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
})
>>>>>>> 8f36d269d46cb68d6c399952765e36fa871d46ae
