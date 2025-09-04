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
import { treeAPI } from "@/services/api";
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

  const handleSelect = (toolId: string) => {
    router.push({
      pathname: "/evaluate/[toolId]",
      params: { toolId, studentId },
    });
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
            style={styles.card}
            onPress={() => handleSelect(item._id)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.cardDesc}>{item.description}</Text>
            ) : null}
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
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  cardDesc: { marginTop: 6, fontSize: 14, color: "#666" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 12, color: "#666" },
});
