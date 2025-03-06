import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAlert } from "@/lib/alert-context";

export default function Profile() {
  const { user, refetch } = useGlobalContext();
  const { showAlert } = useAlert();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      showAlert("success", "Logged out successfully!");
      refetch({});
    } else {
      showAlert("error", "Failed to logout!");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-4 py-6 flex-1">
        <View className="items-center mb-6">
          <Image
            source={{ uri: user?.avatar }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <Text className="text-2xl font-rubik-bold text-white mb-1">
            {user?.name}
          </Text>
          <Text className="text-gray-400 font-rubik">{user?.email}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-gray-800 rounded-xl py-3 px-6 mb-6 flex-row items-center justify-center"
        >
          <Feather name="log-out" size={20} color="#fff" />
          <Text className="text-white font-rubik-medium ml-2">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
