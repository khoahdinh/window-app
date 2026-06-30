// Import các function cần thiết từ Firebase SDK
// Giống kiểu #include từng module riêng trong C++ (modular, chỉ lấy cái cần dùng)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Đọc config từ biến môi trường (đã set trong .env)
// process.env.EXPO_PUBLIC_... — Expo tự nhúng các biến có prefix này vào code lúc build
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// initializeApp giống như "khởi tạo 1 connection/instance" tới Firebase project
// Giống việc mở 1 connection tới MySQL trong nose-water-station,
// nhưng đây Firebase tự quản lý connection, mình chỉ cần gọi 1 lần
const app = initializeApp(firebaseConfig);

// Export các service đã khởi tạo sẵn, để file khác import dùng trực tiếp
// (không phải khởi tạo lại mỗi lần dùng — giống singleton pattern)

// initializeAuth thay cho getAuth — cho phép custom persistence
// getReactNativePersistence(AsyncStorage) nói rõ: "lưu session vào AsyncStorage"
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// export const auth = getAuth(app);

export const db = getFirestore(app);
