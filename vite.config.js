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
