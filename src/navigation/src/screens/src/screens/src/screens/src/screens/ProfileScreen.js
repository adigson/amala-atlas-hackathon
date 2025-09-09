import { View, Text, TouchableOpacity, Image } from "react-native";

export default function ProfileScreen({ navigation }) {
  const user = {
    name: "Guest User",
    email: "guest@example.com",
    avatar: "https://ui-avatars.com/api/?name=Guest+User&background=000&color=fff"
  };

  const handleLogout = () => {
    // For hackathon demo: redirect to Login
    navigation.replace("Login");
  };

  return (
    <View className="flex-1 bg-white p-6 items-center">
      {/* User Avatar */}
      <Image
        source={{ uri: user.avatar }}
        className="w-28 h-28 rounded-full mb-4"
      />

      {/* User Info */}
      <Text className="text-2xl font-bold mb-1">{user.name}</Text>
      <Text className="text-gray-500 mb-6">{user.email}</Text>

      {/* Buttons */}
      <TouchableOpacity
        className="bg-black px-6 py-3 rounded-2xl w-full mb-3"
      >
        <Text className="text-white text-center font-semibold">Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 rounded-2xl w-full"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
