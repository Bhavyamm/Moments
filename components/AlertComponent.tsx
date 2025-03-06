import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type AlertProps = {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose: () => void;
};

const AlertComponent: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const hideTimeout = setTimeout(() => {
      handleClose();
    }, 2700);

    return () => clearTimeout(hideTimeout);
  }, []);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

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

  const messageLines = message.split("\n");
  const hasMultipleLines = messageLines.length > 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.contentWrapper}>
        <Feather
          name={getIconName()}
          size={24}
          color="white"
          style={styles.icon}
        />

        <View style={styles.messageContainer}>
          {hasMultipleLines ? (
            messageLines.map((line, index) => (
              <Text key={index} style={styles.message}>
                {line}
              </Text>
            ))
          ) : (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  icon: {
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default AlertComponent;
