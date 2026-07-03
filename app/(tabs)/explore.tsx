// app/(tabs)/explore.tsx
import { Colors } from "@/constants/theme";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [sharedDaysCount, setSharedDaysCount] = useState<number | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupListener() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const userSnap = await getDoc(doc(db, "users", uid));
      const coupleId = userSnap.data()?.coupleId;
      if (!coupleId) return;

      // onSnapshot ở đây để nếu partner vừa gửi xong (đủ điều kiện tính điểm),
      // số hiện lên tự nhảy realtime, không cần thoát vào lại tab
      unsubscribe = onSnapshot(doc(db, "couples", coupleId), (snap) => {
        setSharedDaysCount(snap.data()?.sharedDaysCount ?? 0);
      });
    }

    setupListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (sharedDaysCount === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.count, { color: colors.tint }]}>
        {sharedDaysCount}
      </Text>
      <Text style={[styles.label, { color: colors.icon }]}>
        {sharedDaysCount === 1 ? "day shared together" : "days shared together"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  count: { fontSize: 64, fontWeight: "700" },
  label: { fontSize: 16, marginTop: 8 },
});
