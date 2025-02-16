import { View, Text } from "react-native";
import { Redirect, Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  return (
    <SafeAreaView edges={["top"]} className="bg-orange-100 p-2">
      <View className="h-10 bg-orange-100 justify-end items-center pb-2">
        <Text className="text-center font-roboto text-primary-100 font-bold text-3xl">
          Moments
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default function AppLayout() {
  let isLogged = true;

  if (!isLogged) {
    return <Redirect href="/welcome" />;
  }

  return <Header />;
}
