import { Pressable, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Chip({
  text,
  active,
  icon,
  subtle,
  onPress,
}: {
  text: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  subtle?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        active ? styles.chipActive : undefined,
        subtle ? styles.chipSubtle : undefined,
      ]}
      onPress={() => {
        onPress();
      }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={subtle ? "#6b7280" : active ? "#fff" : "#4b5563"}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        style={[
          styles.chipText,
          active
            ? { color: "#fff" }
            : subtle
            ? { color: "#6b7280" }
            : undefined,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipSubtle: {
    backgroundColor: "#f3f4f6",
    borderColor: "#f3f4f6",
  },
  chipText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600",
  },
});
