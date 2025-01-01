import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'MotionLib',
            fileName: (format) => `motion-lib.${format}.js`,
            formats: ['es', 'umd'], // Include ESM for tree-shaking
        },
        rollupOptions: {
            external: ['motion'], // Mark dependencies as external
            output: {
                globals: {
                    motion: 'motion',
                },
            },
        },
    },
});
