import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");

  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!phone || !password) {
      return;
    }

    if (isRegisterMode && !username) {
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (isRegisterMode) {
        success = await register(username, phone, password);
      } else {
        success = await login(phone, password);
      }

      if (success) {
        Toast.show({
          type: "success",
          text1: isRegisterMode ? "注册成功" : "登录成功",
        });
        router.replace("/students");
      } else {
        Toast.show({
          type: "error",
          text1: isRegisterMode
            ? "注册失败，请重试"
            : "登录失败，请检查手机号和密码",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "网络错误，请重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>BA System</Text>
          <Text style={styles.logoSubtext}>学生管理系统</Text>
        </View>
      </View>

      <View style={styles.rightPanel}>
        <KeyboardAvoidingView
          style={styles.formWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>
                {isRegisterMode ? "注册账号" : "登录"}
              </Text>

              {isRegisterMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>用户名</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="请输入用户名"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>手机号</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="请输入手机号"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>密码</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="请输入密码"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "处理中..." : isRegisterMode ? "注册" : "登录"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsRegisterMode(!isRegisterMode)}
              >
                <Text style={styles.switchButtonText}>
                  {isRegisterMode ? "已有账号？点击登录" : "没有账号？点击注册"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#eee",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#e38b3d",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  logoSubtext: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  rightPanel: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 300,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    height: 50,
  },
  submitButton: {
    backgroundColor: "#e38b3d",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 24,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
