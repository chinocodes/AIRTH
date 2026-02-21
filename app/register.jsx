import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {  // checks if all fields have been filled
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) { // check if passwords match
      Alert.alert('Error', 'Passwords do not match'); 
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://10.178.75.95:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully!');
        // reset fields
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.detail || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Enter your details to register</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={!showPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={styles.toggleBtn}
      >
        <Text style={styles.toggleText}>
          {showPassword ? 'Hide Passwords' : 'Show Passwords'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextBtn, loading && { opacity: 0.6 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.nextText}>{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Need help? Visit our <Text style={styles.helpCenter}>help center</Text>
      </Text>
    </View>
  );
};

export default Register;

const green = '#005F15';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: green,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: green,
    marginTop: 5,
    marginBottom: 30,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: green,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  nextBtn: {
    backgroundColor: green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleBtn: {
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleText: {
    color: green,
    fontWeight: '600',
  },
  helpText: {
    textAlign: 'center',
    color: green,
    fontSize: 12,
    marginTop: 40,
  },
  helpCenter: {
    fontWeight: '700',
  },
});
