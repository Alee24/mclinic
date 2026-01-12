# Progressive Web App (PWA) Setup

M-Clinic is now a fully installable Progressive Web App! Users can install it on their phones and desktops like a native app.

## ✅ What's Enabled:

### 1. **Installable App**
- Users can install M-Clinic from their browser
- Works on Android, iOS, Windows, Mac, and Linux
- Appears in app drawer/home screen/start menu
- Launches in standalone mode (no browser UI)

### 2. **Offline Support**
- Service worker caches API requests
- 24-hour cache for offline access
- Network-first strategy for fresh data when online

### 3. **App Features**
- **Name**: M-Clinic Healthcare Platform
- **Theme Color**: Emerald Green (`#10b981`)
- **Icons**: Professional M+Cross logo in all sizes
- **Shortcuts**: Quick actions for booking appointments

## 📱 How Users Install:

### **Android (Chrome/Edge)**
1. Open `https://yourdomain.com` in Chrome
2. Tap the **menu (⋮)** button
3. Select **"Install app"** or **"Add to Home Screen"**
4. M-Clinic icon appears on home screen

### **iOS (Safari)**
1. Open `https://yourdomain.com` in Safari
2. Tap the **Share button** (box with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. M-Clinic icon appears on home screen

### **Desktop (Chrome/Edge)**
1. Open `https://yourdomain.com` in Chrome/Edge
2. Look for **install icon (+)** in address bar
3. Click **"Install"**
4. M-Clinic opens as a standalone app

### **Desktop (Manual)**
1. Click browser **menu (⋮)**
2. Select **"Install M-Clinic..."**
3. App appears in Start Menu/Applications

## 🎨 Customization:

### Update App Name/Description:
Edit `apps/web/public/manifest.json`:
```json
{
  "name": "Your Custom Name",
  "short_name": "Short Name",
  "description": "Your description"
}
```

### Change Theme Color:
Update in `apps/web/src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  themeColor: "#yourcolor",
  //...
}
```

### Replace Icons:
1. Create icons in these sizes: 72, 96, 128, 144, 152, 192, 384, 512
2. Place in `apps/web/public/icons/`
3. Name format: `icon-{size}x{size}.png`

## 🚀 Testing PWA:

### Development:
PWA is **disabled** in development mode to avoid caching issues.

### Production:
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Open in browser and test install

### Chrome DevTools:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** section
4. Check **Service Workers** section
5. Use **Lighthouse** tab to audit PWA

## 📊 PWA Features Checklist:

✅ HTTPS (required for PWA - enabled in production)  
✅ Web App Manifest  
✅ Service Worker  
✅ Installable  
✅ Works Offline  
✅ App Icons (all sizes)  
✅ Theme Color  
✅ Splash Screen (auto-generated)  
✅ App Shortcuts  
✅ Caching Strategy  

## 🔧 Configuration Files:

- **Manifest**: `apps/web/public/manifest.json`
- **PWA Config**: `apps/web/next.config.ts`
- **Metadata**: `apps/web/src/app/layout.tsx`
- **Icons**: `apps/web/public/icons/`

## 📝 Important Notes:

1. **HTTPS Required**: PWA only works on HTTPS in production (localhost works)
2. **Cache Duration**: 24 hours (modify in `next.config.ts`)
3. **Development**: PWA disabled during dev to avoid cache conflicts
4. **Updates**: Service worker auto-updates on page refresh
5. **Storage**: PWA can use up to 200 cached entries

## 🌐 Browser Support:

- ✅ Chrome/Edge (Full support)
- ✅ Firefox (Full support)
- ⚠️ Safari (Partial - no push notifications)
- ✅ Samsung Internet (Full support)
- ✅ Opera (Full support)

## 🎯 Next Steps:

1. **Deploy to HTTPS domain** (PWA requires secure connection)
2. **Test installation** on different devices
3. **Add push notifications** (optional - for appointment reminders)
4. **Custom splash screen** (optional - auto-generated from manifest)
5. **Advanced caching** (optional - for completely offline experience)

---

**Your users can now install M-Clinic as a native-like app!** 🎉

For questions or issues, contact: info@mclinic.co.ke
