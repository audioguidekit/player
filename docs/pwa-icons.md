# PWA App Icons

AudioGuideKit is a Progressive Web App (PWA) that can be installed on mobile devices. This requires app icons in multiple sizes.

## Icon Files

Icons are located in `public/icons/`:

| File | Size | Purpose |
|------|------|---------|
| `icon-72x72.png` | 72x72 | Android legacy |
| `icon-96x96.png` | 96x96 | Android legacy |
| `icon-128x128.png` | 128x128 | Chrome Web Store |
| `icon-144x144.png` | 144x144 | Android legacy |
| `icon-152x152.png` | 152x152 | iOS |
| `icon-192x192.png` | 192x192 | Android / iOS |
| `icon-384x384.png` | 384x384 | Android splash |
| `icon-512x512.png` | 512x512 | Android maskable |

The SVG source is `public/favicon.svg`.

## Replacing Icons with Your Own

### Option 1: Replace the SVG (Recommended)

1. Create your icon as a square SVG (256x256 viewBox recommended)
2. Replace `public/favicon.svg` with your design
3. Regenerate PNGs:

```bash
cd public/icons
for size in 72 96 128 144 152 192 384 512; do
  magick -background none -density 300 ../favicon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

> **Note:** Requires ImageMagick. Install with `brew install imagemagick` (macOS) or `apt install imagemagick` (Linux).

### Option 2: Use RealFaviconGenerator

1. Visit https://realfavicongenerator.net/
2. Upload your logo (512x512 or larger)
3. Configure settings for different platforms
4. Download and extract to `public/icons/`

### Option 3: Use PWA Asset Generator

```bash
npx @vite-pwa/assets-generator --preset minimal public/favicon.svg
```

## Icon Guidelines

- **Simple design** - Icons are small, keep it recognizable
- **Square aspect ratio** - All icons must be square
- **Safe zone** - For maskable icons (512x512), keep content in center 80%
- **Transparent or solid background** - Avoid gradients at small sizes
- **Test on both light and dark** - Ensure visibility on all backgrounds

## Manifest Configuration

Icons are configured in `vite.config.ts` under `VitePWA.manifest.icons`. The default configuration:

```typescript
icons: [
  { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
  { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
  { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
  { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
  { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
  { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
  { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
]
```

## Testing PWA Installation

1. Run `bun run build && bun run preview`
2. Open in Chrome/Edge and check DevTools > Application > Manifest
3. On mobile, use "Add to Home Screen" to test installation
4. Verify icons appear correctly on home screen and splash screen
