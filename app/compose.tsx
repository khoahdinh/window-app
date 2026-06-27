import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ComposeScreen() {
  // useState lưu nội dung text đang gõ
  // Giống biến local trong 1 hàm C++, nhưng React tự re-render UI mỗi khi giá trị đổi
  const [text, setText] = useState("");

  // useRouter cho phép điều hướng bằng code (thay vì chỉ bằng <Link>)
  // router.back() giống lệnh "return" về màn trước, dùng cho nút Cancel/Close
  const router = useRouter();

  const handleSend = () => {
    // TODO: logic lưu vào Firestore sẽ thêm ở session sau
    console.log("Sending moment:", text);
    router.back(); // đóng modal sau khi gửi
  };

  return (
    <View style={styles.container}>
      {/* Header: nút đóng bên trái, không cần tiêu đề lớn vì đã có title từ Stack.Screen options */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>Cancel</Text>
        </Pressable>
      </View>

      {/* Text input chính, multiline để gõ được nhiều dòng nếu cần */}
      <TextInput
        style={styles.input}
        placeholder="What's your moment today?"
        placeholderTextColor="#999"
        multiline
        value={text}
        onChangeText={setText}
        autoFocus // tự bật bàn phím ngay khi mở modal, đỡ phải bấm thêm 1 lần
      />

      {/* Nút gửi, disable nếu chưa gõ gì để tránh gửi rỗng */}
      <Pressable
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  input: {
    fontSize: 20,
    minHeight: 100,
    textAlignVertical: "top", // Android cần dòng này để text bắt đầu từ trên, không phải giữa
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto", // đẩy nút xuống đáy màn hình
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
