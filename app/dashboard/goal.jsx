import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function GoalSetter() {
  const router = useRouter();

  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    Keyboard.dismiss(); //  dismiss keyboard on submit

    if (!targetValue || parseInt(targetValue) <= 0) {
      Alert.alert("Invalid Target", "Please enter a valid number of trips.");
      return;
    }

    if (endDate <= startDate) {
      Alert.alert("Invalid Dates", "End date must be after start date.");
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        router.replace("/");
        return;
      }

      const res = await fetch(
        "http://10.178.75.95:8000/api/goals/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            target_value: parseInt(targetValue),
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
          }),
        }
      );

      if (res.status === 401) {
        await AsyncStorage.removeItem("token");
        Alert.alert("Session expired", "Please login again.");
        router.replace("/");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create goal");
      }

      Alert.alert("Success", "Your clean trip goal has been set!");
      setTargetValue("");

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Set Clean Trip Goal</Text>

          <Text style={styles.label}>Target Clean Trips</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 20"
            value={targetValue}
            onChangeText={setTargetValue}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />

          <Text style={styles.label}>Start Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => {
              Keyboard.dismiss();
              setShowStartPicker(true);
            }}
          >
            <Text>{startDate.toDateString()}</Text>
          </Pressable>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>End Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => {
              Keyboard.dismiss();
              setShowEndPicker(true);
            }}
          >
            <Text>{endDate.toDateString()}</Text>
          </Pressable>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) setEndDate(selectedDate);
              }}
            />
          )}

          <Pressable
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Setting Goal..." : "Set Goal"}
            </Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#2ECC71",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
