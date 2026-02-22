import React, { useState, useEffect, useRef } from "react";
import { GOOGLE_KEY } from '@env';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Travel() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [navigationActive, setNavigationActive] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLabel, setGpsLabel] = useState("Your Location");

  const [manualStartCoords, setManualStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  const mapRef = useRef(null);
  const incrementGoal = async () => { // send post request to update current_value in user_goals table
    try {
      const token = await AsyncStorage.getItem("token");

      await fetch("https://web-production-ca09b.up.railway.app/api/goals/achieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

    } catch (err) {
      console.log("error with update", err);
    }
  };
  //get gps on page load
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setGpsLocation(coords);

      const reverse = await Location.reverseGeocodeAsync(coords);
      if (reverse.length > 0) {
        const place = reverse[0];
        setGpsLabel(
          place.name ||
          place.street ||
          place.city ||
          "Your Location"
        );
      }
    })();
  }, []);

  const convertCoords = (coords) =>
    coords.map(([lat, lon]) => ({
      latitude: lat,
      longitude: lon,
    }));

  const fetchRoute = async () => {
    const start =
      manualStartCoords ||
      (gpsLocation && {
        lat: gpsLocation.latitude,
        lon: gpsLocation.longitude,
      });

    if (!start || !endCoords) return;

    setLoading(true);

    const res = await fetch(
      `https://web-production-ca09b.up.railway.app/travel/eco-route?start_lat=${start.lat}&start_lon=${start.lon}&end_lat=${endCoords.lat}&end_lon=${endCoords.lon}`
    );

    const data = await res.json();
    setRouteData(data);

    const coords = convertCoords(data.best_route.coords);
    setRouteCoords(coords);

    setLoading(false);
  };

  // navigation mode
  useEffect(() => {
    let subscription;

    if (!navigationActive) return;

    const startTracking = async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2,
        },
        (location) => {
          const realUser = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          mapRef.current?.animateCamera({
            center: realUser,
            zoom: 18,
          });
        }
      );
    };

    startTracking();

    return () => subscription?.remove();
  }, [navigationActive]);

  // turn by turn view for navigation
  if (navigationActive) {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          showsUserLocation
          followsUserLocation
        >
          <Polyline
            coordinates={routeCoords}
            strokeColor="#2ECC71"
            strokeWidth={6}
          />

          {/* destination pin */}
          {endCoords && (
            <Marker
              coordinate={{
                latitude: endCoords.lat,
                longitude: endCoords.lon,
              }}
              pinColor="red"
            />
          )}
        </MapView>

        <Pressable
          style={styles.exitButton}
          onPress={ () => {
            
            setNavigationActive(false);
            setRouteData(null);
            setRouteCoords([]);
            setManualStartCoords(null);
            setEndCoords(null);
            incrementGoal().catch((err) => { // backend called in background to prevent front end lag
              console.log("error incrementing goal", err);
            }); 
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            Stop Route
          </Text>
        </Pressable>
      </View>
    );
  }

  // preview mode
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSpacing} />

        <View style={{ paddingHorizontal: 20 }}>
          {/* start input */}
          <GooglePlacesAutocomplete
            placeholder={gpsLabel}
            fetchDetails
            enablePoweredByContainer={false}
            onPress={(data, details = null) => {
              setManualStartCoords({
                lat: details.geometry.location.lat,
                lon: details.geometry.location.lng,
              });
            }}
            query={{ key: GOOGLE_KEY, language: "en" }}
            styles={autoStyles}
          />

          {/* destination input */}
          <GooglePlacesAutocomplete
            placeholder="Where are you going?"
            fetchDetails
            enablePoweredByContainer={false}
            onPress={(data, details = null) => {
              setEndCoords({
                lat: details.geometry.location.lat,
                lon: details.geometry.location.lng,
              });
            }}
            query={{ key: GOOGLE_KEY, language: "en" }}
            styles={autoStyles}
          />

          <Pressable style={styles.findButton} onPress={fetchRoute}>
            <Text style={{ color: "white" }}>Find Route</Text>
          </Pressable>
        </View>

        {loading && (
          <ActivityIndicator size="large" color="#2ECC71" style={{ marginTop: 40 }} />
        )}

        {routeData && (
          <>
            {/* route stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {routeData.best_route.avg_aqi}
                </Text>
                <Text style={styles.statLabel}>Avg AQI</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {routeData.best_route.duration_min} min
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>

            {/* mini map view */}
            <View style={styles.mapWrapper}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: routeCoords[0]?.latitude,
                  longitude: routeCoords[0]?.longitude,
                  latitudeDelta: 0.004,
                  longitudeDelta: 0.004,
                }}
              >
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#2ECC71"
                  strokeWidth={5}
                />

                {endCoords && (
                  <Marker
                    coordinate={{
                      latitude: endCoords.lat,
                      longitude: endCoords.lon,
                    }}
                    pinColor="red"
                  />
                )}
              </MapView>
            </View>

            <Pressable
              style={styles.startButton}
              onPress={() => setNavigationActive(true)}
            >
              <Text style={{ color: "white" }}>Start Navigation</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const autoStyles = {
  container: { flex: 0, marginBottom: 15 },
  textInput: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    fontSize: 16,
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA" },
  content: { paddingBottom: 120 },
  headerSpacing: { height: 60 },

  findButton: {
    backgroundColor: "#2ECC71",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "40%",
  },

  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 14, color: "#777" },

  mapWrapper: {
    height: 220,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
  },

  startButton: {
    backgroundColor: "#2ECC71",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: "center",
  },

  exitButton: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#E74C3C",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});
