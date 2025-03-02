import { useGlobalContext } from "@/lib/global-provider";
import { useRouter } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export const Header = () => {
  const { user } = useGlobalContext();
  const router = useRouter();

  const handleAvatarPress = () => {
    router.push("/profile");
  };

  const handleConversationPress = () => {
    // router.push("/conversations");
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-black p-2" collapsable={false}>
      <View className="relative flex h-10 align-center pb-2">
        <Text className="text-left font-montserrat-bold text-primary-100 text-3xl">
          Memories
        </Text>

        <View className="absolute right-2 flex-row items-center gap-4">
          <TouchableOpacity onPress={handleConversationPress}>
            <Ionicons name="chatbubble-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{ uri: user?.avatar }}
              className="w-12 h-12 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
