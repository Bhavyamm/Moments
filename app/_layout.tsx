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
import { AlertProvider } from "@/lib/alert-context";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
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
      <AlertProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <PanGestureHandler onEnded={onSwipeRight}>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }} />
              </View>
            </PanGestureHandler>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </AlertProvider>
    </GlobalProvider>
  );
}
