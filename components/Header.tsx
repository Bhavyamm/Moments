import { useGlobalContext } from "@/lib/global-provider";
import { useRouter } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureDetector,
  Gesture,
  Directions,
} from "react-native-gesture-handler";

export const Header = () => {
  const { user } = useGlobalContext();
  const router = useRouter();

  const handleAvatarPress = () => {
    router.push("/profile");
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="bg-orange-100 p-2"
      collapsable={false}
    >
      <View className="relative flex h-10 justify-center items-center pb-2">
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
