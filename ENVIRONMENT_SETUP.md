# 🚀 Environment Configuration Guide

## 📋 Overview

This setup allows you to automatically switch between **local development** and **live production** environments without manually changing URLs.

## 🔧 How It Works

### **Automatic Environment Switching:**
- **Development Mode**: Uses `environment.ts` → Points to `localhost:8000`
- **Production Mode**: Uses `environment.prod.ts` → Points to live server
- **No manual URL changes needed!**

---

## 📁 Environment Files

### **Development Environment** (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',           // Local backend
  imageUrl: 'http://localhost:8000/api/images'   // Local images
};
```

### **Production Environment** (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://interior-architect-backend-main-36p6qz.laravel.cloud/api',        // Live backend
  imageUrl: 'https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images' // Live images
};
```

---

## 🎯 Usage Commands

### **For Local Development:**
```bash
ng serve
# OR
npm start
```
**Result**: Automatically uses `environment.ts` (localhost URLs)

### **For Production Build:**
```bash
ng build --configuration=production
# OR  
npm run build
```
**Result**: Automatically uses `environment.prod.ts` (live server URLs)

---

## 💡 Updated Components

### **✅ Components Now Using Environment Variables:**

1. **ApiService** - Main API calls
2. **AuthService** - Authentication endpoints  
3. **Contact Component** - Contact form submissions
4. **Recent Projects** - Image URLs
5. **Portfolio Component** - Category images

### **🔧 How Components Use It:**
```typescript
// Import environment
import { environment } from '../../environments/environment';

// Use in component
const apiUrl = environment.apiUrl;
const imageUrl = environment.imageUrl;
```

---

## 🍎 iOS Compatibility Fixes

### **iPhone & iPad Issues Resolved:**

1. **Viewport Issues** - Fixed with iOS-specific meta tags
2. **Video Autoplay** - iOS requires user interaction, now handled gracefully
3. **Touch Events** - Optimized for iOS Safari
4. **Service Worker** - iOS-friendly caching strategies
5. **Form Elements** - Prevents zoom on input focus
6. **Safe Area** - Handles notch and home indicator areas

### **iOS-Specific Features:**

- **IOSCompatibilityService** - Automatically detects and fixes iOS issues
- **iOS-friendly Service Worker** - Conservative caching for iOS devices
- **Touch-optimized interactions** - Better iPhone user experience
- **Safe area support** - Proper spacing for modern iPhones

---

## 🚨 Troubleshooting

### **Common Issues & Solutions:**

#### **1. Website Not Working on iPhone**
```bash
# Check if iOS compatibility service is loaded
# Look for console logs: "iOS Detection: { isIOS: true, isIPhone: true }"
```

#### **2. Videos Not Playing on iOS**
- iOS requires user interaction to play videos
- Solution: Touch the play button or screen to start video
- Autoplay is disabled on iOS for better user experience

#### **3. Service Worker Issues on iOS**
- iOS Safari has stricter service worker policies
- Solution: Fallback caching is provided automatically
- Check console for "iOS: Providing fallback functionality"

#### **4. Form Inputs Zooming on iOS**
- iOS Safari zooms on input focus if font size < 16px
- Solution: Automatically fixed with CSS and JavaScript
- All inputs now have proper font sizing

#### **5. CORS Issues with Laravel Cloud**
- Check if your Laravel Cloud backend allows your Vercel domain
- Verify CORS configuration in `backend/config/cors.php`
- Ensure HTTPS is used for production

---

## 🔍 Debug Mode

### **Enable iOS Debug Logging:**
```typescript
// In browser console, check for:
console.log('iOS Detection:', { isIOS, isSafari, isIPhone });
console.log('iOS: Service Worker registration status');
console.log('iOS: Video playback status');
```

### **Check iOS Compatibility:**
```typescript
// In browser console:
const iosService = window['IOSCompatibilityService'];
console.log('iOS Status:', iosService.getIsIOS());
console.log('iPhone Status:', iosService.getIsIPhone());
```

---

## 📱 Mobile Testing

### **Test on Real iOS Devices:**
1. **iPhone Safari** - Primary testing target
2. **iPad Safari** - Tablet experience
3. **iOS Chrome** - Alternative browser testing

### **iOS Simulator Testing:**
```bash
# Use Xcode Simulator for development testing
# Test different iPhone models and iOS versions
```

---

## 🚀 Deployment Checklist

### **Before Deploying to Vercel:**
- [ ] Build with production configuration
- [ ] Test iOS compatibility locally
- [ ] Verify CORS settings on Laravel Cloud
- [ ] Check service worker registration
- [ ] Test video playback on iOS devices

### **After Deploying:**
- [ ] Test on real iPhone devices
- [ ] Verify iOS Safari compatibility
- [ ] Check console for iOS detection logs
- [ ] Test form submissions on iOS
- [ ] Verify image loading on iOS

---

## 🆘 Getting Help

### **iOS Issues:**
1. Check browser console for iOS detection logs
2. Verify iOS compatibility service is loaded
3. Test on real iOS device (not just simulator)
4. Check iOS Safari developer tools

### **Backend Issues:**
1. Verify Laravel Cloud CORS configuration
2. Check API endpoints are accessible
3. Test with Postman or similar tool
4. Verify SSL certificates on Laravel Cloud

### **Frontend Issues:**
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test service worker registration
4. Check for JavaScript errors in console

---

## 📚 Additional Resources

- [iOS Safari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/Introduction/Introduction.html)
- [Vercel iOS Deployment Guide](https://vercel.com/docs/deployments/mobile)
- [Laravel Cloud Documentation](https://laravel.com/docs/cloud)
- [Angular PWA Guide](https://angular.io/guide/service-worker-getting-started)
