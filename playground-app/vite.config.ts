import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { alphaTab } from '@coderline/alphatab-vite';
import { fileURLToPath } from 'node:url';

// builds only the playground (src/components/AlphaTabPlayground) as a standalone static app
const siteSrc = fileURLToPath(new URL('../src', import.meta.url));
const appSrc = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
    base: process.env.BASE_PATH ?? '/',
    plugins: [react(), alphaTab()],
    resolve: {
        alias: [
            { find: '@site/src/site-base', replacement: `${appSrc}/site-base` },
            { find: '@site/src', replacement: siteSrc },
            { find: /^@theme\/(.*)$/, replacement: `${appSrc}/shims/$1` },
            { find: '@docusaurus/useIsBrowser', replacement: `${appSrc}/shims/useIsBrowser` },
            { find: '@docusaurus/theme-common', replacement: `${appSrc}/shims/theme-common` }
        ]
    }
});
