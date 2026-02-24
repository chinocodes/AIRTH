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
  Image,
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
  const [achievementVisible, setAchievementVisible] = useState(false);

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
        `https://web-production-ca09b.up.railway.app/save-city?city=${city}`
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

    const res = await fetch(`https://web-production-ca09b.up.railway.app/api/goals/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    // console.log("GOAL DATA:", data);

   
    // if (!data.goal) return;
    if (!data.goal) {
      setCurrentValue(0);
      setTargetValue(0);
    };

    setCurrentValue(data.goal.current_value);
    setTargetValue(data.goal.target_value);
    setStartDate(new Date(data.goal.start_date));
    setEndDate(new Date(data.goal.end_date));

  } catch (err) {
    console.log("error message: ", err);
  }
};
// convert dates into displayable format
const formattedStartDate = new Date(startDate).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
const formattedEndDate = new Date(endDate).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
const dateDiff = endDate - startDate;
const daysDiff = dateDiff / (1000 * 60 * 60 * 24) // convert from milliseconds to days

const deleteGoal = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

      await fetch("https://web-production-ca09b.up.railway.app/api/goals/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  } catch (err) {
    console.log("error deleting goal", err)
  }
}

  // get user's location using expo location
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

      
    })();
  }, []);

  // AQI → color
  // const getAqiColor = () => {
  //   if (aqi <= 50) return "#2ECC71";
  //   if (aqi <= 100) return "#F1C40F";
  //   return "#E74C3C";
  // };
  useEffect (() => {
    if (currentValue && targetValue && currentValue >= targetValue ) {
      confettiRef.current?.play(0);
      setGoalComplete("Congrats");
    }
    
  });
  // return the achievement screen if the user clicks on the prgoress card
  if (achievementVisible) {
    return (
      <ScrollView><View style={styles.container}>
        <View style={styles.acheivementContainer}>
        <View style={styles.logoContainer}>
                <Image source={require('../../assets/leaf.png')} style={styles.logo} />
              </View>
        
        <Text style={styles.achievementTexts}>You've completed {currentValue} trips</Text>
        <Text style={styles.achievementTexts}>Your goal is {targetValue} </Text>
        <Text style={styles.achievementTexts}>Start: {formattedStartDate} </Text>
        <Text style={styles.achievementTexts}>End: {formattedEndDate} </Text>
        <Text style={styles.achievementTexts}>{daysDiff} days left </Text>


        </View>
        
        <Pressable style={styles.backButton} onPress={ () => {
          setAchievementVisible(false);
        }}><Text style={styles.backButtonText}>Go Back</Text></Pressable>
        <Pressable style={styles.deleteButton} onPress={ () => {
          deleteGoal(false);
        }}><Text style={styles.backButtonText}>Delete Goal</Text></Pressable>
      
      
      
      
      
      </View></ScrollView>
      
      
    )
  }
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
        <Text style={styles.subGreeting}>Ready for a clean adventure?</Text>
      </View>

      {/* temp card */}
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
          <Text style={styles.pillTitle}>Message</Text>
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
        <Pressable onPress={ () => {
          setAchievementVisible(true);
        }}>
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
        </Pressable>
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

