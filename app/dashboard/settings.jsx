import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView
  style={styles.container}
  contentContainerStyle={styles.content}
  showsVerticalScrollIndicator={false}
>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      {/* Appearance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={22} color="#555" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>

          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#E5E5E5", true: "#2ECC71" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>

        <SettingItem icon="notifications-outline" label="Notifications" />
        <SettingItem icon="location-outline" label="Location Access" />
        <SettingItem icon="leaf-outline" label="Air Quality Tips" />
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>

        <SettingItem icon="information-circle-outline" label="About AIRTH" />
        <SettingItem icon="shield-checkmark-outline" label="Privacy Policy" />
        <SettingItem icon="document-text-outline" label="Terms of Service" />

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

/* Reusable setting row */
const SettingItem = ({ icon, label }) => (
  <Pressable style={styles.settingRow}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={22} color="#555" />
      <Text style={styles.settingText}>{label}</Text>
    </View>

    <Ionicons name="chevron-forward" size={18} color="#AAA" />
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  content: {
    paddingBottom: 120, // 👈 space for bottom tab bar
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },

  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  versionText: {
    fontSize: 14,
    color: "#888",
  },

  logoutButton: {
    marginTop: 10,
    marginBottom: 50,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E74C3C",
  },
});
