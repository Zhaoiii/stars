import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function SidebarItem({
  icon,
  text,
  rightText,
  badge,
  active,
  subtle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  rightText?: string;
  badge?: string;
  active?: boolean;
  subtle?: boolean;
}) {
  return (
    <View
      style={[
        styles.sidebarItem,
        active ? styles.sidebarItemActive : undefined,
        subtle ? styles.sidebarItemSubtle : undefined,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? "#2563EB" : "#6b7280"}
        style={{ width: 22 }}
      />
      <Text
        style={[
          styles.sidebarText,
          active ? { color: "#1f2937", fontWeight: "600" } : undefined,
        ]}
      >
        {text}
      </Text>
      {rightText ? <Text style={styles.sidebarRight}>{rightText}</Text> : null}
      {badge ? (
        <View style={styles.badgeChip}>
          <Text style={styles.badgeChipText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionLabel}>评估模块</Text>
        <View style={{ marginBottom: 16 }}>
          <SidebarItem icon="flag" text="里程碑评估" badge="进行中" active />
          <SidebarItem icon="warning" text="障碍评估" />
          <SidebarItem icon="swap-horizontal" text="转衔评估" />
        </View>

        <Text style={styles.sectionLabel}>里程碑领域</Text>
        <SidebarItem
          icon="chatbubble-ellipses"
          text="语言行为"
          rightText="65%"
          active
          subtle
        />
        <SidebarItem icon="people" text="社会交往" rightText="30%" />
        <SidebarItem icon="eye" text="视觉感知" rightText="100%" />
        <SidebarItem icon="copy" text="模仿能力" rightText="40%" />
        <SidebarItem icon="game-controller" text="游戏技能" rightText="0%" />
        <SidebarItem icon="book" text="学业预备技能" rightText="0%" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  sectionLabel: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 8,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  sidebarItemActive: {
    backgroundColor: "#e0ebff",
  },
  sidebarItemSubtle: {
    backgroundColor: "#f3f4f6",
  },
  sidebarText: {
    color: "#4b5563",
    fontSize: 14,
  },
  sidebarRight: {
    marginLeft: "auto",
    color: "#6b7280",
    fontSize: 11,
  },
  badgeChip: {
    marginLeft: "auto",
    backgroundColor: "#2563EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeChipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
