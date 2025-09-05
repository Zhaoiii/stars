import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { treeAPI, evaluationRecordAPI } from "@/services/api";
import Toast from "react-native-toast-message";

interface TreeRoot {
  _id: string;
  name: string;
  description?: string;
}

export default function ToolSelectScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const router = useRouter();
  const [roots, setRoots] = useState<TreeRoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingRecord, setCreatingRecord] = useState<string | null>(null);

  const fetchRoots = async () => {
    try {
      const res = await treeAPI.getRoots();
      const data = res?.data?.data || [];
      setRoots(data);
    } catch (e) {
      Toast.show({ type: "error", text1: "获取评估工具失败" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoots();
  }, []);

  const handleSelect = async (toolId: string, toolName: string) => {
    if (!studentId) {
      Toast.show({
        type: "error",
        text1: "学生ID缺失",
      });
      return;
    }

    setCreatingRecord(toolId);

    try {
      // 创建评估记录
      const response = await evaluationRecordAPI.createEvaluationRecord(
        studentId,
        toolId
      );

      if (response?.data?.data) {
        const evaluationRecord = response.data.data;

        Toast.show({
          type: "success",
          text1: "评估记录创建成功",
        });

        // 跳转到评估页面
        router.push({
          pathname: "/evaluate/[toolId]",
          params: {
            toolId,
            studentId,
            evaluationRecordId: evaluationRecord._id,
          },
        });
      } else {
        throw new Error("创建评估记录失败");
      }
    } catch (error: any) {
      console.error("创建评估记录失败:", error);

      // 检查是否是因为已存在评估记录
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("已存在此评估工具的评估记录")
      ) {
        Toast.show({
          type: "error",
          text1: "该学生已有此评估工具的评估记录",
          text2: "请返回评估记录页面继续评估",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "创建评估记录失败",
          text2: error.response?.data?.message || "请稍后重试",
        });
      }
    } finally {
      setCreatingRecord(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载评估工具...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Stack.Screen
        options={{ title: "选择评估工具", headerBackTitle: "返回" }}
      />
      <Text style={styles.title}>选择评估工具</Text>
      <FlatList
        data={roots}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              creatingRecord === item._id && styles.cardDisabled,
            ]}
            onPress={() => handleSelect(item._id, item.name)}
            disabled={creatingRecord !== null}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.cardDesc}>{item.description}</Text>
              ) : null}
            </View>
            {creatingRecord === item._id && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>创建评估记录中...</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "700", margin: 16, color: "#333" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  cardDesc: { marginTop: 6, fontSize: 14, color: "#666" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    marginLeft: 8,
    fontSize: 12,
  },
});
