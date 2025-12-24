# PWA Setup - Onja Resources

This document explains how the Progressive Web App (PWA) is implemented in Onja Resources.

## Overview

Onja Resources is now a fully installable Progressive Web App that works offline and provides a native app-like experience on mobile and desktop devices.

## Features

✅ **Installable**: Users can install the app on their devices  
✅ **Offline Support**: Core functionality works without internet  
✅ **Fast Loading**: Cached resources load instantly  
✅ **App-like Experience**: Full-screen mode without browser UI  
✅ **Auto-updates**: Service worker updates automatically  
✅ **Cross-platform**: Works on iOS, Android, Windows, Mac, Linux  
✅ **Install Prompt**: Smart banner prompts users to install  

## Architecture

### 1. Service Worker (`/public/sw.js`)

The service worker handles:
- Caching static assets (HTML, CSS, JS, icons)
- Runtime caching of dynamic content
- Offline fallback for network failures
- Cache versioning and cleanup
- Background updates

**Caching Strategy**:
- **Static Cache**: Critical assets cached on install
- **Dynamic Cache**: Runtime caching with stale-while-revalidate
- **Network First**: Firebase/API requests always use network

### 2. Web App Manifest (`/public/manifest.json`)

Defines the app's appearance and behavior:
- App name and short name
- Theme colors and icons
- Display mode (standalone)
- Start URL and scope
- App shortcuts (Browse, Favorites)
- Screenshots for app stores

### 3. PWA Installer Component (`/src/components/PWAInstaller.tsx`)

Client-side component that:
- Registers the service worker in production
- Handles service worker updates
- Listens for install events
- Manages app lifecycle

### 4. Install Prompt Component (`/src/components/InstallPrompt.tsx`)

User-facing install prompt that:
- Shows a custom install banner
- Triggers the browser's install prompt
- Dismisses after installation
- Only shows when installable

## Icons & Assets

### Generated Icons
Run `npm run generate-icons` to create placeholder icons:
- `icon-192.svg` (192×192)
- `icon-512.svg` (512×512)
- `icon-192-maskable.svg` (with safe area)
- `icon-512-maskable.svg` (with safe area)
- `apple-touch-icon.svg` (180×180)

### For Production
Replace placeholder SVG icons with PNG icons:
1. Create high-quality PNG icons at required sizes
2. Update `manifest.json` to use `.png` extensions
3. Update `layout.tsx` icon references
4. Consider using [RealFaviconGenerator](https://realfavicongenerator.net/)

### Screenshots
Create real app screenshots:
- Wide: 1280×720 (desktop/tablet)
- Mobile: 750×1334 (phone portrait)
- Replace placeholders in `/public/`

## Installation Testing

### Local Testing
```bash
# Build production version
npm run build

# Start production server
npm start

# Visit http://localhost:3000
```

**Note**: Service workers only work in production mode or over HTTPS.

### Test Checklist
- [ ] Manifest loads without errors
- [ ] Service worker registers successfully
- [ ] Install prompt appears (Chrome DevTools: Application > Manifest)
- [ ] App installs on device
- [ ] Icons display correctly
- [ ] App works offline
- [ ] Cached content loads fast

## Browser Support

| Browser | Install | Offline | Notes |
|---------|---------|---------|-------|
| Chrome/Edge | ✅ | ✅ | Full support |
| Safari (iOS) | ✅ | ✅ | Add to Home Screen |
| Firefox | ✅ | ✅ | Full support |
| Samsung Internet | ✅ | ✅ | Full support |
| Safari (macOS) | ⚠️ | ✅ | Limited install UI |

## Deployment

### Production Checklist
1. **Generate Real Icons**
   ```bash
   # Use a tool like sharp or Photoshop
   # Create PNG files at: 192×192, 512×512, 180×180
   ```

2. **Take Screenshots**
   - Open app in browser
   - Take screenshots at specified dimensions
   - Save as PNG in `/public/`

3. **Update Manifest**
   - Change icon types from `image/svg+xml` to `image/png`
   - Update screenshot references
   - Verify all URLs point to production domain

4. **Test HTTPS**
   - Service workers require HTTPS in production
   - Verify SSL certificate is valid
   - Test on actual devices

5. **Update Meta Tags**
   - Set correct `metadataBase` in `layout.tsx`
   - Update Open Graph images
   - Verify canonical URLs

### Environment Variables
No special environment variables needed for PWA.

## Monitoring

### Service Worker Status
Check service worker status in browser DevTools:
- Chrome/Edge: `Application > Service Workers`
- Firefox: `about:debugging#/runtime/this-firefox`
- Safari: `Develop > Service Workers`

### Analytics Tracking
Track PWA metrics:
- Install events: `window.addEventListener('appinstalled')`
- Standalone mode: `window.matchMedia('(display-mode: standalone)')`
- Service worker errors: `registration.addEventListener('error')`

## Troubleshooting

### Service Worker Not Registering
- Verify production mode (`NODE_ENV=production`)
- Check HTTPS is enabled
- Look for errors in console
- Clear cache and reload

### Install Prompt Not Showing
- App must meet PWA criteria (manifest, service worker, HTTPS)
- User might have dismissed prompt before
- Check Chrome: `chrome://flags/#enable-desktop-pwas`
- Test with different browser/device

### Offline Mode Not Working
- Visit app online first (service worker needs to install)
- Check service worker is active: `navigator.serviceWorker.controller`
- Verify static assets are cached
- Check network tab (cached resources show "ServiceWorker")

### Icons Not Displaying
- Verify icon paths in manifest.json
- Check file sizes (192×192, 512×512)
- Ensure correct MIME types
- Clear cache and reinstall app

### Cache Issues
Clear all caches:
```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Best Practices

### Cache Management
- Keep static cache small (only critical assets)
- Set cache version in service worker
- Clean up old caches on activate
- Don't cache user data or API responses

### Performance
- Precache shell assets only
- Use runtime caching for rest
- Implement cache expiration
- Monitor cache storage usage

### User Experience
- Show install prompt at right time
- Provide feedback during installation
- Handle offline gracefully
- Update service worker transparently

### Security
- Always serve over HTTPS
- Validate cached responses
- Sanitize user inputs
- Keep dependencies updated

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)

## Scripts

```bash
# Generate placeholder icons
npm run generate-icons

# Build production version
npm run build

# Start production server
npm start

# Test in development (PWA disabled in dev)
npm run dev
```

## Files

```
├── public/
│   ├── sw.js                    # Service worker
│   ├── manifest.json            # Web app manifest
│   ├── icon-192.svg             # App icon 192×192
│   ├── icon-512.svg             # App icon 512×512
│   ├── icon-192-maskable.svg    # Maskable icon 192×192
│   ├── icon-512-maskable.svg    # Maskable icon 512×512
│   ├── apple-touch-icon.svg     # iOS home screen icon
│   ├── screenshot-wide.svg      # Desktop screenshot
│   └── screenshot-mobile.svg    # Mobile screenshot
│
├── src/
│   ├── components/
│   │   ├── PWAInstaller.tsx     # Service worker registration
│   │   └── InstallPrompt.tsx    # Install banner UI
│   │
│   └── app/
│       └── layout.tsx           # PWA metadata
│
├── scripts/
│   └── generate-pwa-icons.js    # Icon generator
│
└── docs/
    ├── PWA_GUIDE.md             # User installation guide
    └── PWA_SETUP.md             # This file
```

## Next Steps

1. **Generate Production Icons**: Create PNG icons to replace SVG placeholders
2. **Take Screenshots**: Capture real app screenshots
3. **Test Installation**: Verify install works on all target devices
4. **Monitor Metrics**: Track install rate and offline usage
5. **Optimize Caching**: Fine-tune cache strategies based on usage
6. **Add Features**: Consider push notifications, background sync

---

Built with ❤️ by Onja Madagascar
