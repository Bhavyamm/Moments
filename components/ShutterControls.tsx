import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { CameraMode } from "expo-camera";

type ShutterControlsProps = {
  mode: CameraMode;
  onToggleMode: () => void;
  onCapture: () => void;
  onToggleFacing: () => void;
};

export default function ShutterControls({
  mode,
  onToggleMode,
  onCapture,
  onToggleFacing,
}: ShutterControlsProps) {
  return (
    <View style={styles.shutterContainer}>
      <Pressable onPress={onToggleMode}>
        {mode === "picture" ? (
          <AntDesign name="picture" size={32} />
        ) : (
          <Feather name="video" size={32} />
        )}
      </Pressable>
      <Pressable onPress={onCapture}>
        {({ pressed }) => (
          <View
            style={[
              styles.shutterBtn,
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.shutterBtnInner,
                {
                  backgroundColor: mode === "picture" ? "white" : "red",
                },
              ]}
            />
          </View>
        )}
      </Pressable>
      <Pressable onPress={onToggleFacing}>
        <FontAwesome6 name="arrows-rotate" size={32} />
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
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});
