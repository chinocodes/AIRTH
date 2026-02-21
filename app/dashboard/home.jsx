import React, { useEffect, useState, useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import styles from "../home.styles"
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Progress from "react-native-progress";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get("window");

export default function Home() {
  const [user, setUser] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [temp, setTemp] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [targetValue, setTargetValue] = useState(30);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [currentValue, setCurrentValue] = useState(0);
  const confettiRef = useRef(null);
  const [goalComplete, setGoalComplete] = useState(null);

  // Load stored user
  useEffect(() => {
    AsyncStorage.getItem("user").then((stored) => {
      if (stored) setUser(JSON.parse(stored));
    });
  }, []);
  useEffect(() => {
  if (user) {
    fetchGoal();
  }
}, [user]);

// refreshes goal progress bar each time the user returns to the page.
useFocusEffect (
  useCallback(() => {
    fetchGoal();
  }, [])
);

  // Backend city-temperature fetch
  const sendCity = async (city) => {
    try {
      const res = await fetch(
        `http://10.178.75.95:8000/save-city?city=${city}`
      );
      const data = await res.json();
      if (data.temp !== undefined) setTemp(data.temp);
    } catch {}
  };

  useEffect(() => {
    if (location) sendCity(location);
  }, [location]);


  const fetchGoal = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`http://10.178.75.95:8000/api/goals/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    // console.log("GOAL DATA:", data);

   
    if (!data.goal) return;

    setCurrentValue(data.goal.current_value);
    setTargetValue(data.goal.target_value);
    setStartDate(new Date(data.goal.start_date));
    setEndDate(new Date(data.goal.end_date));

  } catch (err) {
    console.log("error message: ", err);
  }
};

  // ---- gps + reverse geocode + AQI fetch ----
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
      // fetchAqi(latitude, longitude);
    })();
  }, []);

  // AQI → color
  const getAqiColor = () => {
    if (aqi <= 50) return "#2ECC71";
    if (aqi <= 100) return "#F1C40F";
    return "#E74C3C";
  };
  useEffect (() => {
    if (currentValue && targetValue && currentValue >= targetValue ) {
      confettiRef.current?.play(0);
      setGoalComplete("Congrats");
    }
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* { the confetti component } */}
      <LottieView
        ref={confettiRef}
        source={require('./confetti.json')}
        autoPlay={false}
        loop={false}
        style={styles.lottie}
        resizeMode='cover'
      />
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user ? `Hey ${user.name}` : "Welcome"}
        </Text>
        <Text style={styles.subGreeting}>Here’s your air today</Text>
      </View>

      {/* card */}
      <View style={styles.heroCard}>
        <View>
          <Text style={styles.city}>{location || errorMsg}</Text>
          <Text style={styles.temperature}>
            {temp !== null ? `${temp}°` : "--"}
          </Text>
        </View>

        
      </View>

      {/* info */}
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <Text style={styles.pillTitle}>Recommendations</Text>
          <Text style={styles.pillValue}>
            {temp <= 15 ? "Its a bit chilly outside" : temp <= 20 ? "Nice and warm today" : "Its very hot"}
          </Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillTitle}>Advice</Text>
          <Text style={styles.pillValue}>
            {temp <= 15 ? "Grab your coat" : temp <= 20 ? "Maybe grab a jacket" : "Dress lightly"}
          </Text>
        </View>
      </View>

      {/* clean trips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clean Trips</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressText}>You've completed {currentValue} of {targetValue} 🌱</Text>
          <Text style={styles.progressText}>{goalComplete}</Text>
          <Progress.Bar
            progress={currentValue/targetValue}
            width={width - 80}
            height={12}
            color="#2ECC71"
            unfilledColor="#EAEAEA"
            borderWidth={0}
            borderRadius={10}
          />
        </View>
      </View>
      <View style={styles.reset}>
        <Pressable style={styles.resetButton}>
          <Text style={{ color: "white" }}>Reset</Text>
        </Pressable>
      </View>

      {/* map preview */}
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

