import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const Header = () => {
  return (
    <SafeAreaView edges={["top"]} className="bg-orange-100 p-2">
      <View className="h-10 bg-orange-100 justify-end items-center pb-2">
        <Text className="text-center font-montserrat-bold text-primary-100 text-3xl">
          Memories
        </Text>
      </View>
    </SafeAreaView>
  );
};
