import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Milestone, Score } from "@/types/vbmapp";

function ScoreOption({
  selected,
  color,
  border,
  label,
  onPress,
}: {
  selected: boolean;
  color: string;
  border: string;
  label: Score;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.scoreBtn,
        { borderColor: border, backgroundColor: selected ? color : "#fff" },
      ]}
    >
      <Text style={[styles.scoreText, { color: selected ? "#fff" : color }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MilestoneCard({
  m,
  onChangeScore,
}: {
  m: Milestone;
  onChangeScore: (id: string, score: Score) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.badgeBlue}>
            <Text style={styles.badgeBlueText}>{m.id}</Text>
          </View>
          <Text style={styles.cardTitle}>{m.title}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
          <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.scoreRow}>
        <ScoreOption
          selected={m.score === "已掌握"}
          color="#16A34A"
          border="#16A34A"
          label="已掌握"
          onPress={() => onChangeScore(m.id, "已掌握")}
        />
        <ScoreOption
          selected={m.score === "部分掌握"}
          color="#D97706"
          border="#D97706"
          label="部分掌握"
          onPress={() => onChangeScore(m.id, "部分掌握")}
        />
        <ScoreOption
          selected={m.score === "未掌握"}
          color="#DC2626"
          border="#DC2626"
          label="未掌握"
          onPress={() => onChangeScore(m.id, "未掌握")}
        />
      </View>

      {m.note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{m.note}</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.noteButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
          <Text style={styles.noteButtonText}>添加观察记录</Text>
        </TouchableOpacity>
      )}
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
  scoreRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  scoreBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
  },
  noteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  noteButtonText: {
    marginLeft: 6,
    color: "#6b7280",
    fontSize: 13,
  },
  noteBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 10,
  },
  noteText: {
    color: "#374151",
    fontSize: 13,
  },
});
