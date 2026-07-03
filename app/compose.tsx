import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { Colors } from "@/constants/theme";
import { auth, db } from "../firebaseConfig";
import { getVietnamDateString } from "../utils/dateHelpers";
import { maybeIncrementSharedDays } from "../utils/scoreHelpers";

const MAX_LENGTH = 80;

export default function ComposeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // useState lưu nội dung text đang gõ
  // Giống biến local trong 1 hàm C++, nhưng React tự re-render UI mỗi khi giá trị đổi
  const [text, setText] = useState("");

  const [sending, setSending] = useState(false); // chặn double-tap khi đang gửi

  // useRouter cho phép điều hướng bằng code (thay vì chỉ bằng <Link>)
  // router.back() giống lệnh "return" về màn trước, dùng cho nút Cancel/Close
  const router = useRouter();

  const handleSend = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return; // chưa login thì thoát

    setSending(true);
    try {
      // Bước 1: lấy coupleId của user hiện tại từ users/{uid}
      // (giống dereference con trỏ để lấy field trong struct vậy)
      const userSnap = await getDoc(doc(db, "users", uid));
      const coupleId = userSnap.data()?.coupleId;

      if (!coupleId) {
        console.error("User chưa có coupleId, không thể gửi moment");
        return;
      }

      const day = getVietnamDateString();

      // Bước 2: tạo document mới trong collection "moments"
      await addDoc(collection(db, "moments"), {
        coupleId,
        authorUid: uid,
        text: text.trim(),
        createdAt: serverTimestamp(),
        day,
      });

      // Check xem sau lần gửi này, cả 2 đã đủ điều kiện tính điểm ngày hôm nay chưa
      await maybeIncrementSharedDays(coupleId, day);

      router.back();
    } catch (error) {
      console.error("Lỗi khi gửi moment:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 125 : 0}
    >
      {/* Header: nút đóng bên trái, không cần tiêu đề lớn vì đã có title từ Stack.Screen options */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.closeButton, { color: colors.tint }]}>
            Cancel
          </Text>
        </Pressable>
      </View>

      {/* Text input chính */}
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="What's your moment today?"
        placeholderTextColor={colors.icon}
        multiline
        value={text}
        onChangeText={setText}
        maxLength={MAX_LENGTH}
        autoFocus
        editable={!sending}
      />

      {/* Bộ đếm ký tự, đổi màu khi gần chạm giới hạn để nhắc nhẹ */}
      <Text
        style={[
          styles.charCount,
          { color: colors.icon },
          text.length >= MAX_LENGTH && styles.charCountLimit,
        ]}
      >
        {text.length}/{MAX_LENGTH}
      </Text>

      {/* Nút gửi, disable nếu chưa gõ gì để tránh gửi rỗng */}
      <Pressable
        style={[
          styles.sendButton,
          { backgroundColor: colors.tint },
          (!text.trim() || sending) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!text.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator color={colorScheme === "dark" ? "#000" : "#fff"} />
        ) : (
          <Text
            style={[
              styles.sendButtonText,
              { color: colorScheme === "dark" ? "#000" : "#fff" },
            ]}
          >
            Send
          </Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  closeButton: { fontSize: 16 },
  input: { fontSize: 20, minHeight: 100, textAlignVertical: "top" },
  charCount: { textAlign: "right", fontSize: 12, marginTop: 4 },
  charCountLimit: { color: "#FF3B30" },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { fontSize: 16, fontWeight: "600" },
});
