// cd /d D:\Projects\window-app
// npx expo start --tunnel
import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    console.log("Firebase connected successfully!");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Window</Text>
      <Text style={styles.subtitle}>No moments yet today</Text>

      {/* Nút mở Compose modal */}
      <Pressable style={styles.fab} onPress={() => router.push("/compose")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    // shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // elevation cho Android (Android không dùng shadow* props, cần riêng prop này)
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    lineHeight: 30,
  },
});
