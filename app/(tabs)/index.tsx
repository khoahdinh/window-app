// cd /d D:\Projects\window-app
// npx expo start --tunnel
import { useEffect } from "react";
import { Text, View } from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function HomeScreen() {
  useEffect(() => {
    console.log("Auth object:", auth);
    console.log("Firestore object:", db);
    console.log("✅ Firebase connected successfully!");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Testing Firebase connection...</Text>
      <Text>Check console for result</Text>
    </View>
  );
}
