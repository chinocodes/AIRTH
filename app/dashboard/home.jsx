import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Progress from "react-native-progress";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const { width } = Dimensions.get("window");

export default function Home() {
  const [user, setUser] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [temp, setTemp] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);

  // Load stored user
  useEffect(() => {
    AsyncStorage.getItem("user").then((stored) => {
      if (stored) setUser(JSON.parse(stored));
    });
  }, []);

  // Backend city-temperature fetch
  const sendCity = async (city) => {
    try {
      const res = await fetch(
        `http://10.178.72.148:8000/save-city?city=${city}`
      );
      const data = await res.json();
      if (data.temp !== undefined) setTemp(data.temp);
    } catch {}
  };

  useEffect(() => {
    if (location) sendCity(location);
  }, [location]);

  // ---- Fetch AQI from backend ----
  const fetchAqi = async (lat, lon) => {
    try {
      const res = await fetch(
        `http://10.178.72.148:8000/aqi/current?lat=${lat}&lon=${lon}`

      );
      const data = await res.json();
      if (data.aqi !== undefined) setAqi(data.aqi);
    } catch (err) {
      console.log("AQI fetch error:", err);
    }
  };

  // ---- GPS + reverse geocode + AQI fetch ----
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission denied");
        return;
      }

      const coords = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      const [place] = await Location.reverseGeocodeAsync(coords.coords);
      const cityName = place.city || place.region || "Unknown";
      setLocation(cityName);

      // fetch real AQI from backend
      fetchAqi(latitude, longitude);
    })();
  }, []);

  // AQI → color
  const getAqiColor = () => {
    if (aqi <= 50) return "#2ECC71";
    if (aqi <= 100) return "#F1C40F";
    return "#E74C3C";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user ? `Hey ${user.name}` : "Welcome"}
        </Text>
        <Text style={styles.subGreeting}>Here’s your air today</Text>
      </View>

      {/* HERO CARD */}
      <View style={styles.heroCard}>
        <View>
          <Text style={styles.city}>{location || errorMsg}</Text>
          <Text style={styles.temperature}>
            {temp !== null ? `${temp}°` : "--"}
          </Text>
        </View>

        <View
          style={[
            styles.aqiBadge,
            { backgroundColor: getAqiColor() + "22" },
          ]}
        >
          <Text style={styles.aqiLabel}>AQI</Text>
          <Text style={[styles.aqiValue, { color: getAqiColor() }]}>
            {aqi}
          </Text>
        </View>
      </View>

      {/* INFO PILLS */}
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <Text style={styles.pillTitle}>Air Quality</Text>
          <Text style={styles.pillValue}>
            {aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : "Unhealthy"}
          </Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillTitle}>Advice</Text>
          <Text style={styles.pillValue}>
            {aqi <= 50 ? "Great for walking" : aqi <= 100 ? "Sensitive caution" : "Limit exposure"}
          </Text>
        </View>
      </View>

      {/* CLEAN TRIPS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clean Trips</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressText}>29 of 30 trips clean 🌱</Text>
          <Progress.Bar
            progress={0.95}
            width={width - 80}
            height={12}
            color="#2ECC71"
            unfilledColor="#EAEAEA"
            borderWidth={0}
            borderRadius={10}
          />
        </View>
      </View>

      {/* MAP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Area</Text>

        <View style={styles.mapWrapper}>
          {region && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={region}
            >
              <Marker coordinate={region} />
            </MapView>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// ---------------------------
// STYLES
// ---------------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6F8FA",
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  city: {
    fontSize: 18,
    color: "#666",
  },
  temperature: {
    fontSize: 56,
    fontWeight: "800",
    color: "#111",
    marginTop: 6,
  },
  aqiBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  aqiLabel: {
    fontSize: 12,
    color: "#666",
  },
  aqiValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  pillRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  pill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  pillTitle: {
    fontSize: 13,
    color: "#888",
  },
  pillValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  mapWrapper: {
    height: 220,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  map: {
    flex: 1,
  },
});
