# EcomeCustomer - React Native App

## 📱 Giới Thiệu

Ứng dụng mua sắm trực tuyến được xây dựng bằng React Native và Expo.

## 🚀 Đã Chuyển Đổi Sang React Native

### ✅ Hoàn Thành
1. **App.tsx** - Main app component với SafeAreaView, ScrollView
2. **EnhancedHeader** - Header với Ionicons
3. **BottomNav** - Bottom navigation với Ionicons  
4. **Banner** - Image carousel với ScrollView
5. **ProductCard** - Template component (file .new)
6. **Context API** - CartContext và AppContext
7. **Cấu trúc thư mục** - Feature-based architecture

### 🔄 Cần Hoàn Thiện

Các components còn lại cần chuyển sang React Native - Xem [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 🛠️ Cài Đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Start Expo Dev Server
npm start
```

## 📁 Cấu Trúc

```
src/
├── features/          # Feature modules (home, product, cart, etc)
├── shared/           # Shared components, contexts, types
└── core/             # Data, services, config
```

## 📖 Tài Liệu

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Hướng dẫn chuyển đổi chi tiết
- [STRUCTURE.md](./STRUCTURE.md) - Cấu trúc thư mục

## 🎨 Template Components

Tham khảo các components đã chuyển đổi:
- `src/shared/components/layout/EnhancedHeader.tsx`
- `src/shared/components/layout/BottomNav.tsx`
- `src/features/home/components/Banner.tsx`
