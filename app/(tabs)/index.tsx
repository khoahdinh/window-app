// cd /d D:\Projects\window-app
// npx expo start --tunnel
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth, db } from "../../firebaseConfig";
import WindowGrid, { Moment } from "../../components/WindowGrid";

const MOCK_MOMENTS: Moment[] = [
  { id: "1", text: "Vừa uống trà sữa xong 🧋" },
  { id: "2", text: "😴" },
  { id: "3", text: "Trời mưa to quá bồ ơi" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [moments] = useState<Moment[]>(MOCK_MOMENTS);

  useEffect(() => {
    console.log("Firebase connected successfully!");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Window</Text>
      <WindowGrid
        moments={moments}
        onSlotPress={() => router.push("/compose")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
});
