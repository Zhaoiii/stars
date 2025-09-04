import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Milestone } from "@/types/vbmapp";

export default function SearchModal({
  visible,
  onClose,
  milestones,
}: {
  visible: boolean;
  onClose: () => void;
  milestones: Milestone[];
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalCard}>
          <View style={styles.searchRow}>
            <Ionicons
              name="search"
              size={18}
              color="#9ca3af"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="搜索里程碑编号或关键词..."
              style={styles.searchInput}
            />
          </View>
          <ScrollView style={{ maxHeight: 240 }}>
            {milestones.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.searchItem}
                onPress={onClose}
              >
                <Text style={styles.searchTitle}>
                  {m.id} {m.title.replace(/^.{0,} /, "")}
                </Text>
                <Text style={styles.searchSub}>语言行为 - 阶段1</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
  },
  searchItem: {
    paddingVertical: 10,
  },
  searchTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  searchSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
});
