import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Milestone } from "@/types/vbmapp";

export default function MilestoneCard({
  m,
  onChangeCount,
  isUpdating = false,
}: {
  m: Milestone;
  onChangeCount: (id: string, next: number) => void;
  isUpdating?: boolean;
}) {
  const current = Math.max(0, Math.min(m.count || 0, m.totalCount || 0));
  const total = Math.max(0, m.totalCount || 0);
  const progress = total > 0 ? (current / total) * 100 : 0;

  const adjust = (delta: number) => {
    const next = Math.max(0, Math.min((m.count || 0) + delta, total));
    onChangeCount(m.id, next);
  };

  const setTo = (value: number) => {
    const next = Math.max(0, Math.min(value, total));
    onChangeCount(m.id, next);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.badgeBlue}>
            <Text style={styles.badgeBlueText}>{m.id}</Text>
          </View>
          <Text style={styles.cardTitle}>{m.title}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {current}/{total}
            </Text>
            {isUpdating && (
              <ActivityIndicator
                size="small"
                color="#2563EB"
                style={styles.updatingIndicator}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => adjust(-10)}>
          <Ionicons name="remove" size={16} color="#374151" />
          <Text style={styles.ctrlText}>-10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => adjust(-1)}>
          <Ionicons name="remove" size={16} color="#374151" />
          <Text style={styles.ctrlText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctrlBtnPrimary}
          onPress={() => adjust(+1)}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={[styles.ctrlText, { color: "#fff" }]}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => adjust(+10)}>
          <Ionicons name="add" size={16} color="#374151" />
          <Text style={styles.ctrlText}>+10</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.pillBtn} onPress={() => setTo(0)}>
          <Text style={styles.pillText}>清零</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pillBtn} onPress={() => setTo(total)}>
          <Text style={styles.pillText}>满分</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  badgeBlue: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeBlueText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: "#10B981",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctrlBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ctrlBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ctrlText: {
    marginLeft: 4,
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  pillBtn: {
    backgroundColor: "#eef2ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  pillText: {
    color: "#4f46e5",
    fontSize: 12,
    fontWeight: "700",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },
  updatingIndicator: {
    marginLeft: 4,
  },
});
