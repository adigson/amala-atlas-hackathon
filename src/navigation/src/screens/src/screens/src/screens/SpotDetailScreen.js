import { View, Text, TouchableOpacity, FlatList, TextInput } from "react-native";
import { useEffect, useState } from "react";
import api from "../config/api";

export default function SpotDetailScreen({ route }) {
  const { spotId } = route.params;
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");

  useEffect(() => {
    api.get(`/spots/${spotId}`)
      .then(res => {
        setSpot(res.data);
        setReviews(res.data.reviews || []);
      })
      .catch(err => console.error(err));
  }, [spotId]);

  const addReview = () => {
    if (!newReview.trim()) return;
    api.post(`/spots/${spotId}/review`, {
      user: "Guest",
      comment: newReview,
      rating: 5
    })
    .then(res => {
      setReviews([res.data, ...reviews]);
      setNewReview("");
    })
    .catch(err => console.error(err));
  };

  if (!spot) {
    return <Text className="p-4">Loading spot...</Text>;
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-2">{spot.name}</Text>
      <Text className="text-gray-600 mb-1">{spot.location}</Text>
      <Text className="text-yellow-500 mb-4">⭐ {spot.rating}</Text>

      <Text className="text-lg font-bold mb-2">Menu 🍲</Text>
      {spot.menu?.map((item, idx) => (
        <Text key={idx}>• {item.name} — ₦{item.price}</Text>
      ))}

      <Text className="text-lg font-bold mt-4 mb-2">Reviews 💬</Text>
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
