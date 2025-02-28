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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-orange-100 p-2">
      <View className="relative flex h-10 justify-center items-center pb-2">
        <TouchableOpacity onPress={handleBack} className="absolute left-2">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text className="text-center font-montserrat-bold text-primary-100 text-3xl">
          Memories
        </Text>

        <TouchableOpacity
          onPress={handleAvatarPress}
          className="absolute right-2"
        >
          <Image
            source={{ uri: user?.avatar }}
            className="w-12 h-12 rounded-full"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
