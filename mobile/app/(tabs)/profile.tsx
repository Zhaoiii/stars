import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    // landscapeAlert.destructive("确认登出", "您确定要退出登录吗？", async () => {
    await logout();
    router.replace("/login");
    // });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "管理员";
      case "teacher":
        return "教师";
      case "parent":
        return "家长";
      default:
        return "用户";
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#e38b3d"]}
            tintColor="#007AFF"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.username}</Text>
          <Text style={styles.userRole}>{getRoleText(user.role)}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>基本信息</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>用户名</Text>
                <Text style={styles.infoValue}>{user.username}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>手机号</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>角色</Text>
                <Text style={styles.infoValue}>{getRoleText(user.role)}</Text>
              </View>

              {user.createdAt && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>注册时间</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(user.createdAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
              <Text style={styles.actionButtonText}>刷新信息</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
                退出登录
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
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
  header: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  userRole: {
    fontSize: 18,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  actionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  actionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
  },
  logoutButtonText: {
    color: "white",
  },
});
