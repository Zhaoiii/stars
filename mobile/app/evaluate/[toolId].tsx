import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { treeAPI } from "@/services/api";
import Toast from "react-native-toast-message";
import Header from "@/components/vbmapp/Header";
import Sidebar from "@/components/vbmapp/Sidebar";
import Chip from "@/components/vbmapp/Chip";
import MilestoneCard from "@/components/vbmapp/MilestoneCard";

interface TreeNodeItem {
  _id: string;
  name: string;
  isLeaf: boolean;
  parentId?: string | null;
  totalCount?: number;
}

export default function EvaluateScreen() {
  const { toolId, studentId } = useLocalSearchParams<{
    toolId: string;
    studentId: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<TreeNodeItem[]>([]);
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<TreeNodeItem | null>(null);

  const loadNode = async (nodeId: string | null) => {
    try {
      setLoading(true);
      if (nodeId) {
        const nodeRes = await treeAPI.getNode(nodeId);
        setCurrentNode(nodeRes?.data?.data);
      } else {
        setCurrentNode(null);
      }
      const res = await treeAPI.getChildren(nodeId);
      setChildren(res?.data?.data || []);
    } catch (e) {
      Toast.show({ type: "error", text1: "加载节点失败" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载：以根工具ID作为当前节点
    if (typeof toolId === "string") {
      setPathStack([toolId]);
      loadNode(toolId);
    }
  }, [toolId]);

  const handleEnter = (node: TreeNodeItem) => {
    if (node.isLeaf) {
      // 叶子节点：进入评估项明细（此处先占位，后续可扩展记录与打分）
      Toast.show({ type: "info", text1: `进入评估项：${node.name}` });
      return;
    }
    setPathStack((prev) => [...prev, node._id]);
    loadNode(node._id);
  };

  const handleBack = () => {
    setPathStack((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      loadNode(next[next.length - 1] || null);
      return next;
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载评估内容...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* <Stack.Screen
        options={{
          title: currentNode ? currentNode.name : "评估",
          headerBackTitle: "返回",
        }}
      />

      <FlatList
        data={children}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleEnter(item)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.isLeaf ? "评估项" : "分类"}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      /> */}
      <Header onToggleSidebar={() => {}} onOpenSearch={() => {}} />
      <View style={styles.container}>
        <Sidebar />
        <View>
          <Chip text="评估内容" onPress={() => {}} />
          <MilestoneCard
            m={{ id: "1", title: "评估内容" }}
            onChangeScore={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 12, color: "#666" },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#333" },
  backBtn: { marginTop: 8 },
  backText: { color: "#007AFF", fontSize: 14, fontWeight: "600" },
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
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  cardMeta: { marginTop: 4, fontSize: 12, color: "#888" },
});
