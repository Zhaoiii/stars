import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const Avatar = require("@/assets/images/icon.png");

export default function Header({
  onToggleSidebar,
  onOpenSearch,
}: {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onToggleSidebar}
          accessibilityLabel="打开/关闭侧边栏"
        >
          <Ionicons name="menu" size={22} color="#4b5563" />
        </TouchableOpacity>
        <Image source={Avatar} style={styles.avatar} />
        <View>
          <Text style={styles.childName}>李明（3岁6个月）</Text>
          <Text style={styles.childSub}>评估ID: VB-2023-056</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenSearch}>
          <Ionicons name="search" size={20} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={22} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={20} color="#4b5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  childSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
});
