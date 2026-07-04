// cd /d D:\Projects\window-app
// npx expo start --tunnel
// npx expo start --tunnel --clear
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import WindowGrid, { Moment } from "../../components/WindowGrid";
import { auth, db } from "../../firebaseConfig";
import { getVietnamDateString } from "../../utils/dateHelpers";

import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeMoments: (() => void) | undefined;

    async function setupListener() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Lấy coupleId (giống bên compose.tsx)
      const userSnap = await getDoc(doc(db, "users", uid));
      const coupleId = userSnap.data()?.coupleId;
      if (!coupleId) return;

      const today = getVietnamDateString();

      // Build query, 4 điều kiện: đúng cặp, đúng ngày, sort theo thời gian, giới hạn 4
      const q = query(
        collection(db, "moments"),
        where("coupleId", "==", coupleId),
        where("day", "==", today),
        orderBy("createdAt", "asc"),
        limit(4),
      );

      // OnSnapshot lắng nghe realtime, callback này chạy lại
      // mỗi khi có document mới/sửa/xoá khớp query
      unsubscribeMoments = onSnapshot(q, (snapshot) => {
        const fetched: Moment[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          text: docSnap.data().text,
        }));
        setMoments(fetched);
        setLoading(false);
      });
    }

    setupListener();

    // Cleanup: gỡ listener khi component unmount, tránh memory leak
    // (giống free() con trỏ trong C khi không dùng nữa)
    return () => {
      if (unsubscribeMoments) unsubscribeMoments();
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Our Window</Text>
      <WindowGrid
        moments={moments}
        onSlotPress={() => router.push("/compose")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 100, paddingHorizontal: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
});
