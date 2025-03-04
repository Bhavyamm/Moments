import { useGlobalContext } from "@/lib/global-provider";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export const Header = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAvatarPress = () => {
    router.push("/profile");
  };

  const handleFriendsPress = () => {
    // router.push("/friends");
  };

  const handleConversationPress = () => {
    // router.push("/conversations");
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: "black",
        zIndex: 10,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={handleAvatarPress}
          className="bg-gray-700 p-2.5 rounded-full"
        >
          <Ionicons name="person-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFriendsPress}
          className="bg-gray-700 p-2.5 rounded-full flex-row items-center"
        >
          <Ionicons name="people-outline" size={22} color="white" />
          <Text className="text-white ml-2 font-montserrat-medium">
            2 Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConversationPress}
          className="bg-gray-700 p-2.5 rounded-full"
        >
          <Ionicons name="chatbubble-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
