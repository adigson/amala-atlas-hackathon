
import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import SpotCard from "../components/SpotCard";
import api from "../config/api";

export default function HomeScreen({ navigation }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/spots")
      .then(res => setSpots(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Nearby Amala Spots 🍛</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          className="bg-black px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Profile</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={spots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SpotCard
            spot={item}
            onPress={() => navigation.navigate("SpotDetail", { spotId: item.id })}
          />
        )}
      />
    </View>
  );
}
