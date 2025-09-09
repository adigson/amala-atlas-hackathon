
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import api from "../config/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    api.post("/auth/login", { email, password })
      .then(res => {
        // You can save token in state/AsyncStorage
        navigation.replace("Home");
      })
      .catch(() => Alert.alert("Login Failed", "Invalid credentials"));
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold mb-6">Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="w-full border p-3 rounded-lg mb-4"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="w-full border p-3 rounded-lg mb-4"
      />
      <TouchableOpacity
        onPress={handleLogin}
        className="bg-black px-6 py-3 rounded-2xl w-full"
      >
        <Text className="text-white text-center font-semibold">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
