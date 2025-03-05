import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendsList from "@/components/FriendsList";
import ContactsList from "@/components/ContactsList";

export default function Profile() {
  const { user, refetch } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<"friends" | "contacts">("friends");

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch({});
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleFriendStatusChange = () => {
    // This function will be called when a friend request is sent
    // We could refresh the friends list if needed
    console.log("Friend status changed");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-4 py-6 flex-1">
        <View className="items-center mb-6">
          <Image
            source={{ uri: user?.avatar }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <Text className="text-2xl font-montserrat-bold text-white mb-1">
            {user?.name}
          </Text>
          <Text className="text-gray-400 font-montserrat">{user?.email}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-gray-800 rounded-xl py-3 px-6 mb-6 flex-row items-center justify-center"
        >
          <Feather name="log-out" size={20} color="#fff" />
          <Text className="text-white font-montserrat-medium ml-2">Logout</Text>
        </TouchableOpacity>

        {/* <View className="flex-row mb-6 border-b border-gray-800">
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "friends" ? "border-b-2 border-[#00E5FF]" : ""
            }`}
            onPress={() => setActiveTab("friends")}
          >
            <Text
              className={`text-center font-montserrat-medium ${
                activeTab === "friends" ? "text-[#00E5FF]" : "text-gray-400"
              }`}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "contacts" ? "border-b-2 border-[#00E5FF]" : ""
            }`}
            onPress={() => setActiveTab("contacts")}
          >
            <Text
              className={`text-center font-montserrat-medium ${
                activeTab === "contacts" ? "text-[#00E5FF]" : "text-gray-400"
              }`}
            >
              Contacts
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          {activeTab === "friends" ? (
            <FriendsList userId={user?.$id!} />
          ) : (
            <ContactsList
              userId={user?.$id!}
              onFriendStatusChange={handleFriendStatusChange}
            />
          )}
        </View>*/}
      </View>
    </SafeAreaView>
  );
}
