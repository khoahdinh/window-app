// nơi bọc ngoài toàn bộ app (chứa cả (tabs) và compose trong <Stack>)
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

import { Text, View } from "react-native";

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

  useEffect(() => {
    // onAuthStateChanged trả về 1 hàm "unsubscribe" — giống kiểu
    // mình đăng ký 1 callback rồi sau này có thể "hủy đăng ký"
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // firebaseUser là object user, hoặc null nếu chưa login
      setInitializing(false); // dù kết quả là gì, giờ mình ĐÃ biết rồi
    });
    // cleanup: hủy listener khi component unmount (tránh memory leak)
    return unsubscribe;
  }, []); // [] = chỉ chạy 1 lần khi component mount, giống setup 1 lần

  // Early return: lúc chưa biết user là ai, KHÔNG render Stack/Navigation.
  // Chỉ hiện tên app đơn giản, tránh flash màn sai.
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Window</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="compose"
          options={{ presentation: "modal", title: "New Moment" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
