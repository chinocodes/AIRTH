import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper(focused)}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? "#2ECC71" : "#777"}
              />
            </View>
          ),
        }}
      />

      {/* Travel (Eco-Friendly Travel Page) */}
      <Tabs.Screen
        name="travel"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper(focused)}>
              <Ionicons
                name={focused ? "leaf" : "leaf-outline"}
                size={24}
                color={focused ? "#2ECC71" : "#777"}
              />
            </View>
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrapper(focused)}>
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={24}
                color={focused ? "#2ECC71" : "#777"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  tabItem: {
    paddingVertical: 10,
  },

  iconWrapper: (focused) => ({
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: focused ? "#EAF8F1" : "transparent",
  }),
});
