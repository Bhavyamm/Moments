import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import images from "@/constants/images";
import { useGlobalContext } from "@/lib/global-provider";
import { login } from "@/lib/appwrite";
import { useAlert } from "@/lib/alert-context";

export default function Welcome() {
  const { refetch, loading, isLogged } = useGlobalContext();
  const { showAlert } = useAlert();

  if (!loading && isLogged) return <Redirect href="/" />;

  const handleLogin = async () => {
    const result = await login();
    if (result) {
      refetch({});
    } else {
      showAlert("error", "Failed to login");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <Image
        source={images.welcome}
        className="w-full h-4/6"
        resizeMode="contain"
      />

      <View className="px-10">
        <Text className="text-5xl text-center font-rubik-bold text-primary-100">
          Memories
        </Text>

        <Text className="text-2xl font-rubik-medium text-primary-100 text-center mt-3">
          Stay in touch {"\n"}
          <Text>with your friends</Text>
        </Text>

        <Text className="text-lg font-rubik text-primary-100 text-center mt-12">
          Login to Memories with Google
        </Text>

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-yellow-100 border-primary-100 border-2 rounded-full w-full py-4 mt-5"
        >
          <View className="flex flex-row items-center justify-center">
            <Image
              source={images.google}
              className="w-5 h-5"
              resizeMode="contain"
            />
            <Text className="text-lg font-rubik-bold text-black-300 ml-2">
              Continue with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
