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
export class MyComponent {
  apiUrl = environment.apiUrl;
  
  getImageUrl(path: string): string {
    return `${environment.imageUrl}/${path}`;
  }
}
```

---

## 🚀 Benefits

### **✅ What You Get:**
- ✅ **No more manual URL switching**
- ✅ **Automatic environment detection**
- ✅ **Clean development workflow**
- ✅ **Production-ready builds**

### **🔄 Development Workflow:**
1. **Code locally** → `ng serve` → Uses localhost automatically
2. **Test locally** → Everything points to local backend
3. **Build for production** → `ng build --prod` → Uses live server automatically
4. **Deploy** → No configuration changes needed

---

## 🎯 Quick Start

### **1. Local Development:**
```bash
ng serve
```
→ **Automatically uses localhost:8000**

### **2. Production Build:**
```bash
ng build --configuration=production
```
→ **Automatically uses live server**

### **3. Change URLs (if needed):**
- **Local**: Edit `src/environments/environment.ts`
- **Production**: Edit `src/environments/environment.prod.ts`

---

## 🎉 Result

**No more switching URLs manually!** 
- Development → Uses localhost automatically
- Production → Uses live server automatically
- Clean, professional workflow ✨

---

*Environment configuration for easy local/live URL switching*
