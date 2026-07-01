import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

// 3 trạng thái UI của màn này
type PairingMode = null | "create" | "join";

type Props = {
  onPaired: (coupleId: string) => void;
};

export default function PairingScreen({ onPaired }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [mode, setMode] = useState<PairingMode>(null);
  const [pairingCode, setPairingCode] = useState(""); // code sinh ra (luồng A) hoặc code nhập vào (luồng B)
  const [errorMessage, setErrorMessage] = useState("");

  // --- Hàm ---

  function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function handleCreatePair() {
    setErrorMessage("");
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const code = generateCode();

    // Ghi pairingCodes/{code}, document ID chính là code luôn
    await setDoc(doc(db, "pairingCodes", code), {
      createdBy: uid,
    });

    // Hiện code lên UI để user copy cho partner
    setPairingCode(code);

    // Lắng nghe users/{uid} của mình, khi partner join xong,
    // _layout.tsx sẽ cập nhật coupleId vào đây
    const unsubscribe = onSnapshot(doc(db, "users", uid), (snapshot) => {
      const data = snapshot.data();
      if (data?.coupleId) {
        unsubscribe(); // hủy listener ngay sau khi có coupleId, tránh leak
        onPaired(data.coupleId);
      }
    });
  }

  async function handleJoinPair() {
    setErrorMessage("");
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Tra thẳng theo document ID
    const codeDoc = await getDoc(doc(db, "pairingCodes", pairingCode));

    if (!codeDoc.exists()) {
      setErrorMessage("Code không tồn tại, kiểm tra lại");
      return;
    }

    const uid1 = codeDoc.data().createdBy;

    // Không thể pair với chính mình
    if (uid1 === uid) {
      setErrorMessage("Không thể dùng code của chính mình");
      return;
    }

    // Tạo coupleId từ 2 uid — sort để đảm bảo cùng 1 cặp luôn ra cùng 1 ID
    // dù ai join trước ai (uid1+uid2 hay uid2+uid1 đều ra cùng kết quả)
    const coupleId = [uid1, uid].sort().join("_");

    // Ghi couples/{coupleId}
    await setDoc(doc(db, "couples", coupleId), {
      members: [uid1, uid],
      createdAt: new Date(),
    });

    // Cập nhật coupleId cho cả 2 user
    await updateDoc(doc(db, "users", uid1), { coupleId });
    await updateDoc(doc(db, "users", uid), { coupleId });

    // Xóa pairingCode đã dùng, không cần nữa
    await setDoc(doc(db, "pairingCodes", pairingCode), { used: true });

    // Báo cho _layout.tsx biết để chuyển màn
    onPaired(coupleId);
  }

  // --- Màn chọn ban đầu (mode === null) ---
  if (mode === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Link with your partner
        </Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          One of you creates a pair, the other joins.
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => setMode("create")}
        >
          <Text
            style={[
              styles.buttonText,
              { color: colorScheme === "dark" ? "#000" : "#fff" },
            ]}
          >
            Create a new pair
          </Text>
        </Pressable>

        <Pressable
          style={[styles.buttonOutline, { borderColor: colors.tint }]}
          onPress={() => setMode("join")}
        >
          <Text style={[styles.buttonOutlineText, { color: colors.tint }]}>
            Join with a code
          </Text>
        </Pressable>
      </View>
    );
  }

  // --- Luồng A: Create (mode === "create") ---
  if (mode === "create") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Your pair code
        </Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Share this code with your partner.
        </Text>

        {/* Chỗ hiện code — nếu chưa có thì hiện placeholder */}
        <View style={[styles.codeBox, { borderColor: colors.icon }]}>
          <Text style={[styles.codeText, { color: colors.text }]}>
            {pairingCode || "Generating..."}
          </Text>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Pressable
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleCreatePair} // TODO: handleCreatePair
        >
          <Text
            style={[
              styles.buttonText,
              { color: colorScheme === "dark" ? "#000" : "#fff" },
            ]}
          >
            Generate Code
          </Text>
        </Pressable>

        <Pressable onPress={() => setMode(null)}>
          <Text style={[styles.backText, { color: colors.icon }]}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  // --- Luồng B: Join (mode === "join") ---
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Enter pair code
      </Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Ask your partner for their code.
      </Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
        placeholder="e.g. ABC123"
        placeholderTextColor={colors.icon}
        value={pairingCode}
        onChangeText={(text) => setPairingCode(text.toUpperCase())} // tự uppercase cho dễ nhập
        autoCapitalize="characters"
        maxLength={6}
      />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Pressable
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={handleJoinPair} // TODO: handleJoinPair
      >
        <Text
          style={[
            styles.buttonText,
            { color: colorScheme === "dark" ? "#000" : "#fff" },
          ]}
        >
          Join
        </Text>
      </Pressable>

      <Pressable onPress={() => setMode(null)}>
        <Text style={[styles.backText, { color: colors.icon }]}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 4,
  },
  button: { padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { fontWeight: "600" },
  buttonOutline: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonOutlineText: { fontWeight: "600" },
  codeBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  codeText: { fontSize: 32, fontWeight: "700", letterSpacing: 6 },
  backText: { textAlign: "center", marginTop: 8 },
  errorText: { color: "red", textAlign: "center" },
});
