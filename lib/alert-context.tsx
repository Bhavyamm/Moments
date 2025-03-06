import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { StyleSheet, View, Platform, StatusBar } from "react-native";
import AlertComponent from "../components/AlertComponent";

type AlertContextType = {
  showAlert: (
    type: "success" | "error" | "info" | "warning",
    message: string,
    title?: string
  ) => void;
};

const defaultContext: AlertContextType = {
  showAlert: () => {
    console.warn("AlertContext used before it was initialized");
  },
};

export const AlertContext = createContext<AlertContextType>(defaultContext);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    message: string;
    title?: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = useCallback(
    (
      type: "success" | "error" | "info" | "warning",
      message: string,
      title?: string
    ) => {
      if (title) {
        setAlert({ show: true, type, message, title });
      } else {
        setAlert({ show: true, type, message });
      }
    },
    []
  );

  useEffect(() => {
    if (alert.show) {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
        timeoutRef.current = null;
      }, 3000);
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [alert.show]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <View style={styles.alertContainer}>
        {alert.show && (
          <AlertComponent
            type={alert.type}
            message={
              alert.title ? `${alert.title}\n${alert.message}` : alert.message
            }
            onClose={() => {
              if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              setAlert((prev) => ({ ...prev, show: false }));
            }}
          />
        )}
      </View>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});

export const useAlert = () => useContext(AlertContext);
