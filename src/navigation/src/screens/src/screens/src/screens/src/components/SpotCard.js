import { View, Text, TouchableOpacity } from "react-native";

export default function SpotCard({ spot, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white p-4 mb-3 rounded-2xl shadow"
    >
      <Text className="text-lg font-bold">{spot.name}</Text>
      <Text className="text-gray-600">{spot.location}</Text>
      <Text className="text-yellow-500">⭐ {spot.rating}</Text>
    </TouchableOpacity>
  );
}
