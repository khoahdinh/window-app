// app/(tabs)/explore.tsx
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function ExploreScreen() {
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{sharedDaysCount}</Text>
      <Text style={styles.label}>
        {sharedDaysCount === 1 ? "day shared together" : "days shared together"}
      </Text>
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
  count: {
    fontSize: 64,
    fontWeight: "700",
    color: "#007AFF",
  },
  label: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
  },
});
