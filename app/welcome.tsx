import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";

export default function Welcome() {
  const handleStart = () => {};

  return (
    <SafeAreaView className="bg-white h-full">
      <Image
        source={images.welcome}
        className="w-full h-4/6"
        resizeMode="contain"
      />

      <View className="px-10">
        <Text className="text-5xl text-center font-roboto font-bold text-primary-100">
          Moment
        </Text>

        <Text className="text-2xl font-roboto text-primary-100 text-center mt-3">
          Stay in touch {"\n"}
          <Text>with your friends</Text>
        </Text>

        <TouchableOpacity
          onPress={handleStart}
          className="bg-yellow-100 rounded-full w-full py-4 mt-14 border-primary-100 border-2"
        >
          <Text className="text-center font-roboto text-primary-100 font-bold text-xl">
            Start
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
