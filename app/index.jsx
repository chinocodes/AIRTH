import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
 // check if all fields have been filled
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://10.178.75.95:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      // store jwt token
      await AsyncStorage.setItem("token", data.access_token);

      
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // navigate to dashboard
      router.replace("/dashboard/home");

    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Enter your email and password{"\n"}to login
      </Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={{ marginBottom: 15 }}>
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.helperText}>
            {showPassword ? 'Hide Password' : 'Show Password'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      
      <Text style={styles.registerText}>
        Don't have an account?{" "}
        <Link href="register" style={styles.boldText}>
          Register
        </Link>
      </Text>

      
    </View>
  );
};

export default Login;

const GREEN = '#0a5c0a';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingTop: 60
  },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 80, height: 80, marginBottom: 5 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: GREEN,
    textAlign: 'center',
    marginTop: 20
  },
  subtitle: {
    textAlign: 'center',
    color: GREEN,
    marginVertical: 20,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: GREEN,
    borderRadius: 10,
    padding: 12,
    fontSize: 16
  },
  helperText: {
    color: GREEN,
    textAlign: 'right',
    marginTop: 5,
    fontSize: 13,
    fontWeight: '500'
  },
  loginButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700'
  },
  orText: {
    textAlign: 'center',
    marginVertical: 20,
    color: GREEN
  },
  registerText: {
    textAlign: 'center',
    color: GREEN,
    marginTop: 10
  },
  boldText: { fontWeight: '700' },
});
