import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#e38b3d",
          headerStyle: {
            backgroundColor: "#ffffff",
            height: 60,
          },
          headerShadowVisible: false,
          headerTintColor: "#333",
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#e0e0e0",
            height: 70,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "600",
          },
          tabBarIconStyle: {
            marginBottom: 4,
          },
        }}
      >
        <Tabs.Screen
          name="students"
          options={{
            title: "学生列表",
            headerTitle: "学生列表",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                color={color}
                size={20}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "我的信息",
            headerTitle: "个人信息",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color}
                size={20}
              />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
