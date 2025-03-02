import { useRouter, SplashScreen, Stack } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import GlobalProvider from "@/lib/global-provider";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { View } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });

  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const onSwipeRight = (event: any) => {
    if (event.nativeEvent.translationX > 50 && router.canGoBack()) {
      router.back();
    }
  };

  return (
    <GlobalProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <PanGestureHandler onEnded={onSwipeRight}>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </PanGestureHandler>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </GlobalProvider>
  );
}
