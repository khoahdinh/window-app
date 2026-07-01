// nơi bọc ngoài toàn bộ app (chứa cả (tabs) và compose trong <Stack>)
// quan sát trạng thái (onAuthStateChanged) và quyết định route dựa trên trạng thái đó.
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { auth, db } from "@/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";
import AuthScreen from "./auth";
import PairingScreen from "./pairing";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // initializing: true lúc đầu = chưa biết gì cả
  const [initializing, setInitializing] = useState(true);

  // user: null lúc đầu, nhưng nhờ có initializing nên null ở đây
  // không bị hiểu lầm là "chưa login" khi initializing vẫn đang true
  const [user, setUser] = useState<User | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser); // firebaseUser là object user, hoặc null nếu chưa login

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        setCoupleId(userDoc.exists() ? userDoc.data().coupleId : null);
      } else {
        setCoupleId(null);
      }

      setInitializing(false); // dù kết quả là gì, giờ mình đã biết rồi
    });
    // cleanup: hủy listener khi component unmount (tránh memory leak)
    return unsubscribe;
  }, []); // [] = chỉ chạy 1 lần khi component mount, giống setup 1 lần

  function renderContent() {
    // Tầng 1: chưa biết gì cả → đợi
    if (initializing) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Window</Text>
        </View>
      );
    }

    // Tầng 2: đã biết rồi, nhưng chưa login → hiện Auth
    if (!user) {
      return <AuthScreen />;
    }

    // Tầng 3: đã login, nhưng chưa pair với ai → hiện Pairing
    if (!coupleId) {
      return <PairingScreen onPaired={(id) => setCoupleId(id)} />;
    }

    // Tầng 4: đã login + đã pair → vào app thật
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="compose"
          options={{ presentation: "modal", title: "New Moment" }}
        />
      </Stack>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {renderContent()}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
