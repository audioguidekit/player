import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import macrosPlugin from 'vite-plugin-babel-macros';

// Sync tour data from src to public for test HTTP access
function syncTourDataPlugin(): Plugin {
  const srcDir = 'src/data/tour';
  const destDir = 'public/data/tour';

  // Recursively walk srcDir (tours now live in per-tour subfolders, e.g.
  // src/data/tour/<tourId>/metadata.json) and mirror the structure into destDir.
  function syncDir(srcRoot: string, destRoot: string) {
    for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
      const src = path.join(srcRoot, entry.name);
      const dest = path.join(destRoot, entry.name);
      if (entry.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        syncDir(src, dest);
      } else if (entry.name.endsWith('.json')) {
        // The public copy lives deeper than src, so rewrite the editor-only
        // `$schema` hint to keep it resolving to src/schema/*.
        const content = fs.readFileSync(src, 'utf8').replace(/"(\.\.\/)+schema\//g, '"../../../src/schema/');
        fs.writeFileSync(dest, content);
      } else if (entry.name.endsWith('.geojson')) {
        fs.copyFileSync(src, dest);
      }
    }
  }

  // Mirror a single tour folder's data files flat into destRoot (no subfolder).
  function syncTourFlat(tourDir: string, destRoot: string) {
    for (const file of fs.readdirSync(tourDir)) {
      const src = path.join(tourDir, file);
      const dest = path.join(destRoot, file);
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(src, 'utf8').replace(/"(\.\.\/)+schema\//g, '"../../../src/schema/');
        fs.writeFileSync(dest, content);
      } else if (file.endsWith('.geojson')) {
        fs.copyFileSync(src, dest);
      }
    }
  }

  function syncFiles() {
    if (!fs.existsSync(srcDir)) return;
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    // Mirror every per-tour subfolder into public/data/tour/<tourId>/.
    syncDir(srcDir, destDir);

    // Also emit a flat copy of the default (first, alphabetically — matching
    // Vite's import.meta.glob ordering) tour at the public root, so the legacy
    // /data/tour/metadata.json paths used by the Playwright HTTP tests keep
    // resolving to the default tour.
    const tourDirs = fs.readdirSync(srcDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();
    if (tourDirs.length > 0) {
      syncTourFlat(path.join(srcDir, tourDirs[0]), destDir);
    }
  }

  return {
    name: 'sync-tour-data',
    buildStart() {
      syncFiles();
    },
    handleHotUpdate({ file }) {
      if (file.includes('src/data/tour') && (file.endsWith('.json') || file.endsWith('.geojson'))) {
        syncFiles();
      }
    }
  };
}

// React Grab plugin - injects client scripts when enabled
function reactGrabPlugin(): Plugin {
  let enabled = false;

  return {
    name: 'react-grab-inject',
    configResolved() {
      try {
        const envFile = fs.readFileSync('.env', 'utf8');
        enabled = envFile.includes('REACT_GRAB=true');
      } catch {
        enabled = false;
      }
    },
    transformIndexHtml(html) {
      if (!enabled) return html;

      const script = `
    <script type="module">
      import("react-grab");
      import("@react-grab/claude-code/client");
    </script>`;

      return html.replace('<head>', '<head>' + script);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    optimizeDeps: {
      include: ['web-haptics/react'],
    },
    build: {
      minify: 'esbuild',
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    plugins: [
      // HTTPS by default (self-signed, for PWA/geolocation). Set HTTP=1 to serve
      // plain HTTP — useful for previewing on mobile browsers that refuse the
      // self-signed cert (e.g. Arc): `HTTP=1 bun run dev`.
      ...(process.env.HTTP ? [] : [basicSsl()]),
      // Treat .geojson files as JSON modules (Vite only handles .json by default)
      {
        name: 'vite-plugin-geojson',
        transform(src: string, id: string) {
          if (id.endsWith('.geojson')) {
            return { code: `export default ${src}`, map: null };
          }
        },
      } satisfies Plugin,
      syncTourDataPlugin(),
      reactGrabPlugin(),
      react({
        babel: {
          plugins: [
            'babel-plugin-macros',
            ['babel-plugin-styled-components', {
              displayName: true,
              fileName: true,
            }],
          ],
        },
      }),
      macrosPlugin(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectRegister: null, // We register manually in index.html
        manifest: {
          name: 'AudioGuideKit',
          short_name: 'AudioGuideKit',
          description: 'Open source audio guide player',
          theme_color: '#ffffff',
          background_color: '#f3f4f6',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png'
            },
            {
              src: '/icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: '/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: '/icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: '/icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        injectManifest: {
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,woff2}'
            // Tour data is bundled via import.meta.glob, not served as static files
          ],
          globIgnores: ['**/node_modules/**/*'],
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
