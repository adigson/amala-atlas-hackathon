

import { View, Text, Image, TouchableOpacity } from "react-native";

export default function SplashScreen({ navigation }) {
  return (
    <View className="flex-1 items-center justify-center bg-yellow-200">
      <Image source={require("../../assets/logo.png")} className="w-40 h-40 mb-6" />
      <Text className="text-2xl font-bold mb-4">Welcome to Amala Spots 🍲</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        className="bg-black px-6 py-3 rounded-2xl"
      >
        <Text className="text-white font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
