import { getFriendsByUserId } from "@/lib/appwrite";
import {
  Alert,
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Models } from "react-native-appwrite";

interface Friend extends Models.Document {
  name: string;
  avatar?: string;
  email: string;
  lastActive?: string;
}

interface FriendsProps {
  userId: string;
}

export default function FriendsList({ userId }: FriendsProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFriends = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getFriendsByUserId(userId);

      if (response && Array.isArray(response)) {
        // Map the response to ensure all required properties are present
        const friendsList = response.map((doc) => ({
          ...doc,
          name: doc.name || "",
          email: doc.email || "",
          avatar: doc.avatar || undefined,
          lastActive: doc.lastActive || undefined,
        }));

        setFriends(friendsList);
        console.log(`Loaded ${friendsList.length} friends`);
      } else {
        setFriends([]);
        console.log("No friends found or invalid response format");
      }
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", "Failed to load friends");
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [userId]);

  const renderFriendItem = ({ item }: { item: Friend }) => {
    return (
      <View className="flex-row items-center py-4 border-b border-gray-800">
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            className="w-12 h-12 rounded-full mr-4"
          />
        ) : (
          <View className="w-12 h-12 rounded-full mr-4 bg-gray-700 items-center justify-center">
            <Text className="text-white text-lg font-montserrat-medium">
              {item.name && item.name.charAt(0)}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-white font-montserrat-medium">{item.name}</Text>
          <Text className="text-gray-400 text-sm">{item.email}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-montserrat-bold text-white">
          My Friends
        </Text>
        <TouchableOpacity onPress={loadFriends}>
          <Feather name="refresh-cw" size={18} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#00E5FF" size="large" />
          <Text className="text-gray-400 font-montserrat mt-4">
            Loading friends...
          </Text>
        </View>
      ) : friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.$id || String(Math.random())}
          renderItem={renderFriendItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      ) : (
        <View className="flex-1 justify-center items-center py-10">
          <Feather name="users" size={48} color="#333" />
          <Text className="text-gray-400 font-montserrat mt-4 text-center">
            You don't have any friends yet.{"\n"}Add some from your contacts!
          </Text>
        </View>
      )}
    </View>
  );
}
