import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TreeNodeItem } from "@/types/vbmapp";

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

export default function Sidebar({
  items,
  selectedId,
  stageItems,
  selectedStageId,
  onSelectStage,
  onSelect,
  sectionTitle = "评估模块",
}: {
  items: TreeNodeItem[];
  selectedId?: string;
  stageItems?: TreeNodeItem[];
  selectedStageId?: string;
  onSelectStage?: (id: string) => void;
  onSelect?: (id: string) => void;
  sectionTitle?: string;
}) {
  return (
    <View style={styles.sidebar}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionLabel}>{sectionTitle}</Text>
        <View style={{ marginBottom: 16 }}>
          {items.map((it) => (
            <Pressable
              key={it._id}
              onPress={() => onSelect && onSelect(it._id)}
            >
              <SidebarItem
                icon={"flag"}
                text={it.name}
                rightText={it.totalCount?.toString()}
                badge={it.totalCount?.toString()}
                active={selectedId === it._id}
              />
            </Pressable>
          ))}
        </View>
        <Text style={styles.sectionLabel}>{sectionTitle}</Text>

        <View>
          {stageItems?.map((it) => (
            <Pressable
              key={it._id}
              onPress={() => onSelectStage && onSelectStage(it._id)}
            >
              <SidebarItem
                icon={"flag"}
                text={it.name}
                rightText={it.totalCount?.toString()}
                badge={it.totalCount?.toString()}
                active={selectedStageId === it._id}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
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
