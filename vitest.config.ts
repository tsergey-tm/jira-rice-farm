import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        tsconfigPaths(),
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,test.ts,test.tsx,spec,spec.ts,spec.tsx}']
    }
})
