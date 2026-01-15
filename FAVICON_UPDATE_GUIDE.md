# M-Clinic Favicon & PWA Icon Update Guide

## Overview
This guide will help you update the M-Clinic favicon and PWA icons with the new heart + heartbeat logo.

## Step 1: Prepare the Logo Image

1. Save your heart logo image (the one you uploaded) as `mclinic-logo.png`
2. Make sure it's at least 512x512 pixels for best quality

## Step 2: Generate Icon Sizes

You need to create multiple sizes for different devices. Use an online tool like:
- **Favicon Generator**: https://realfavicongenerator.net/
- **PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator

### Required Sizes:

**For PWA (Progressive Web App):**
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

**For Favicon:**
- favicon.ico (16x16, 32x32, 48x48 combined)
- apple-touch-icon.png (180x180)

## Step 3: File Locations

Place the generated files in these locations:

```
apps/web/public/
├── favicon.ico                    # Browser tab icon
├── apple-touch-icon.png          # iOS home screen icon
├── logo.png                       # Replace existing logo
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## Step 4: Update manifest.json

File: `apps/web/public/manifest.json`

```json
{
  "name": "M-Clinic Kenya",
  "short_name": "M-Clinic",
  "description": "Professional healthcare at your doorstep",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#C2003F",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Step 5: Update HTML Head Tags

File: `apps/web/src/app/layout.tsx`

Add/update these meta tags in the `<head>` section:

```tsx
<head>
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  {/* Favicon */}
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/icons/icon-192x192.png" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  
  {/* PWA Manifest */}
  <link rel="manifest" href="/manifest.json" />
  
  {/* Theme Color */}
  <meta name="theme-color" content="#C2003F" />
  
  {/* Apple Mobile Web App */}
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="M-Clinic" />
</head>
```

## Step 6: Quick Online Generation Method

### Using RealFaviconGenerator (Recommended):

1. Go to https://realfavicongenerator.net/
2. Upload your heart logo image
3. Configure settings:
   - **iOS**: Select "Add a solid, plain background" with color #C2003F
   - **Android**: Keep default or customize
   - **Windows**: Customize tile color to #C2003F
   - **macOS Safari**: Keep default
4. Click "Generate your Favicons and HTML code"
5. Download the package
6. Extract and copy files to `apps/web/public/`

### Using PWA Builder:

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo
3. Set padding to 10-15%
4. Download the generated icons
5. Copy to `apps/web/public/icons/`

## Step 7: Deploy

After updating all files:

```bash
cd apps/web
npm run build
pm2 restart mclinic-web
```

## Step 8: Clear Cache

After deployment, users should:
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + Shift + R)
3. For PWA: Uninstall and reinstall the app

## Verification Checklist

- [ ] Favicon appears in browser tab
- [ ] Icon appears when bookmarked
- [ ] iOS home screen icon looks correct
- [ ] Android home screen icon looks correct
- [ ] PWA install prompt shows correct icon
- [ ] All icon sizes load without errors

## Color Scheme

Use these colors for consistency:
- **Primary Red**: #C2003F
- **Pink**: #FF4D6D
- **Green**: #00C65E
- **Dark**: #1D2B36
- **White**: #FFFFFF

## Notes

- Icons should have transparent backgrounds where possible
- For iOS, use solid background (#C2003F or white)
- Test on multiple devices and browsers
- Icons are cached heavily - may need to clear cache to see changes

## Troubleshooting

**Icon not updating?**
- Clear browser cache
- Check file paths are correct
- Verify manifest.json is valid JSON
- Check browser console for errors

**PWA not showing new icon?**
- Uninstall PWA
- Clear all site data
- Reinstall PWA

**iOS icon not showing?**
- Ensure apple-touch-icon.png is 180x180
- Check it's in the public root folder
- Verify HTML meta tag is correct
