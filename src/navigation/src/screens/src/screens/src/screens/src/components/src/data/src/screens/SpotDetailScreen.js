import { View, Text, TouchableOpacity, FlatList, TextInput } from "react-native";
import { useState } from "react";

export default function SpotDetailScreen({ route }) {
  const { spot } = route.params; // get spot data passed from HomeScreen
  const [reviews, setReviews] = useState([
    { id: 1, user: "Tunde", comment: "Best Amala in town!", rating: 5 },
    { id: 2, user: "Aisha", comment: "Nice place but small portions.", rating: 4 }
  ]);
  const [newReview, setNewReview] = useState("");

  const addReview = () => {
    if (newReview.trim() === "") return;
    const review = {
      id: Date.now(),
      user: "Guest",
      comment: newReview,
      rating: 5
    };
    setReviews([review, ...reviews]);
    setNewReview("");
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Spot Info */}
      <Text className="text-2xl font-bold mb-2">{spot.name}</Text>
      <Text className="text-gray-600 mb-1">{spot.location}</Text>
      <Text className="text-yellow-500 mb-4">⭐ {spot.rating}</Text>

      {/* Menu (demo items) */}
      <Text className="text-lg font-bold mb-2">Menu 🍲</Text>
      <View className="bg-gray-100 p-3 rounded-lg mb-4">
        <Text>Amala + Ewedu — ₦1500</Text>
        <Text>Amala + Gbegiri — ₦1700</Text>
        <Text>Amala Special — ₦2000</Text>
      </View>

      {/* Reviews Section */}
      <Text className="text-lg font-bold mb-2">Reviews 💬</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-3 mb-2 rounded-lg">
            <Text className="font-bold">{item.user}</Text>
            <Text>{item.comment}</Text>
            <Text className="text-yellow-500">⭐ {item.rating}</Text>
          </View>
        )}
      />

      {/* Add Review Input */}
      <View className="flex-row mt-4 items-center">
        <TextInput
          value={newReview}
          onChangeText={setNewReview}
          placeholder="Write a review..."
          className="flex-1 border p-3 rounded-lg mr-2"
        />
        <TouchableOpacity
          onPress={addReview}
          className="bg-black px-4 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
