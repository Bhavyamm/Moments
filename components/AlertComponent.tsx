import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type AlertProps = {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose: () => void;
};

const AlertComponent: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "check-circle";
      case "error":
        return "x-circle";
      case "info":
        return "info";
      case "warning":
        return "alert-triangle";
      default:
        return "info";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "info":
        return "#2196F3";
      case "warning":
        return "#FFC107";
      default:
        return "#2196F3";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Feather name={getIconName()} size={24} color="white" />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Feather name="x" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    margin: 10,
  },
  message: {
    flex: 1,
    color: "white",
    marginLeft: 10,
  },
});

export default AlertComponent;
