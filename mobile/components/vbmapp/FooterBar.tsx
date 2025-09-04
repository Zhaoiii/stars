import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function FooterBar() {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerLeft}>
        <Ionicons name="arrow-back" size={18} color="#4b5563" />
        <Text style={styles.footerLeftText}>返回</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>保存进度</Text>
        <Ionicons name="checkmark" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLeftText: {
    marginLeft: 6,
    color: "#4b5563",
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 8,
  },
});
