import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { evaluationRecordAPI } from "@/services/api";
import Toast from "react-native-toast-message";

interface EvaluationRecord {
  _id: string;
  studentId: string;
  toolId: string;
  toolName: string;
  status: "in_progress" | "completed" | "archived";
  evaluatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  name: string;
}

export default function StudentEvaluationsScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [evaluationRecords, setEvaluationRecords] = useState<
    EvaluationRecord[]
  >([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchEvaluationRecords = async () => {
    if (!studentId) return;

    try {
      const response = await evaluationRecordAPI.getEvaluationRecordsByStudent(
        studentId
      );
      console.log(response.data, "---");
      if (response?.data) {
        setEvaluationRecords(response.data?.data);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "获取评估记录失败",
      });
      console.error("获取评估记录失败:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStudentInfo = async () => {
    if (!studentId) return;

    try {
      const response = await evaluationRecordAPI.getStudentInfo(studentId);
      if (response?.data) {
        setStudent(response.data);
      }
    } catch (error) {
      console.error("获取学生信息失败:", error);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
    fetchEvaluationRecords();
  }, [studentId]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchEvaluationRecords();
  };

  const handleNewEvaluation = () => {
    router.push({
      pathname: "/tool-select",
      params: { studentId },
    });
  };

  const handleEvaluationPress = (record: EvaluationRecord) => {
    if (record.status === "in_progress") {
      // 继续评估
      router.push({
        pathname: "/evaluate/[toolId]",
        params: {
          toolId: record.toolId,
          evaluationRecordId: record._id,
        },
      });
    } else {
      // 查看评估结果
      router.push({
        pathname: "/evaluation-detail/[recordId]",
        params: { recordId: record._id },
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "进行中";
      case "completed":
        return "已完成";
      case "archived":
        return "已归档";
      default:
        return "未知";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "#FF9500";
      case "completed":
        return "#34C759";
      case "archived":
        return "#8E8E93";
      default:
        return "#8E8E93";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEvaluationItem = ({ item }: { item: EvaluationRecord }) => (
    <TouchableOpacity
      style={styles.evaluationItem}
      onPress={() => handleEvaluationPress(item)}
    >
      <View style={styles.evaluationHeader}>
        <Text style={styles.toolName}>{item.toolName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.evaluationInfo}>
        <Text style={styles.statusText}>
          状态: {getStatusText(item.status)}
        </Text>
      </View>

      <View style={styles.evaluationFooter}>
        <Text style={styles.dateText}>
          {item.status === "completed" && item.evaluatedAt
            ? `完成时间: ${formatDate(item.evaluatedAt)}`
            : `创建时间: ${formatDate(item.createdAt)}`}
        </Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂无评估记录</Text>
      <TouchableOpacity
        style={styles.newEvaluationButton}
        onPress={handleNewEvaluation}
      >
        <Text style={styles.newEvaluationButtonText}>开始新评估</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹ 返回</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>
            {student?.name || "学生"}的评估记录
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleNewEvaluation}
        >
          <Text style={styles.newButtonText}>新建</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={evaluationRecords}
          keyExtractor={(item) => item._id}
          renderItem={renderEvaluationItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "500",
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  newButton: {
    padding: 8,
  },
  newButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  evaluationItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evaluationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  toolName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  evaluationInfo: {
    marginBottom: 12,
  },
  evaluationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    color: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  newEvaluationButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newEvaluationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
