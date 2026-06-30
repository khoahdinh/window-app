import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin() {
    setErrorMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      //  onAuthStateChanged ở _layout.tsx tự bắt được và chuyển màn
    } catch (error: any) {
      setErrorMessage("Sai email hoặc mật khẩu");
    }
  }

  async function handleCreateAccount() {
    setErrorMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const newUser = userCredential.user;

      // Tạo document users/{uid} ngay sau khi Auth user được tạo
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        coupleId: null,
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Email này đã được đăng ký");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Mật khẩu quá yếu (tối thiểu 6 ký tự)");
      } else {
        setErrorMessage("Không thể tạo tài khoản, thử lại");
      }
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Window</Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
        placeholder="Email"
        placeholderTextColor={colors.icon}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
        placeholder="Password"
        placeholderTextColor={colors.icon}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Pressable
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={handleLogin}
      >
        <Text
          style={[
            styles.buttonText,
            { color: colorScheme === "dark" ? "#000" : "#fff" },
          ]}
        >
          Log In
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={handleCreateAccount}
      >
        <Text
          style={[
            styles.buttonText,
            { color: colorScheme === "dark" ? "#000" : "#fff" },
          ]}
        >
          Create Account
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, textAlign: "center", marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  button: { padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { fontWeight: "600" },
  errorText: { color: "red", textAlign: "center" },
});
