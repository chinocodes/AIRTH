import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    return !!token;
  };

  useEffect(() => {
    const verify = async () => {
      const loggedIn = await checkAuth();
      const onDashboard = segments[0] === "dashboard";
      const onRegister = segments[0] === "register";
      const onRoot = segments.length === 0;

      if (!loggedIn && onDashboard) {
        router.replace("/");
      }

      if (loggedIn && (onRoot || onRegister)) {
        router.replace("/dashboard/home");
      }

      setCheckingAuth(false);
    };

    verify();
  }, [segments]);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ECC71" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
