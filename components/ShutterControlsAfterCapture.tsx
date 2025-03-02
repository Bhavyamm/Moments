import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ShutterControlsAfterCaptureProps {
  onSend: () => void;
  onDiscard: () => void;
}

export function ShutterControlsAfterCapture({
  onSend,
  onDiscard,
}: ShutterControlsAfterCaptureProps) {
  return (
    <View style={styles.shutterContainer}>
      <Pressable onPress={onDiscard}>
        <Feather name="x" size={32} color="white" />
      </Pressable>
      <Pressable onPress={onSend}>
        <Feather name="send" size={32} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shutterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 24,
    marginTop: 32,
  },
});
