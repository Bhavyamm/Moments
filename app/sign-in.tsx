import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  AppState,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = () => {};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.textContainer}>
              <Text
                style={[styles.title, { lineHeight: 40 }]}
                className="text-5xl text-center font-montserrat-bold text-primary-100 mb-4"
              >
                Enter your phone{"\n"}
                <Text style={{ lineHeight: 40 }}>number</Text>
              </Text>
              <Text
                style={[styles.subtitle, { lineHeight: 24 }]}
                className="text-lg text-primary-100 font-montserrat-medium text-center mb-2"
              >
                A confirmation code will be sent to your number to connect with
                the app
              </Text>
            </View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity
              onPress={handleStart}
              className="bg-yellow-100 rounded-full w-full py-4 mt-14 border-primary-100 border-2"
            >
              <Text
                style={styles.buttonText}
                className="text-center font-montserrat-medium text-primary-100 font-bold text-xl"
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    alignItems: "center",
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  button: {
    borderRadius: 25,
    width: "100%",
    paddingVertical: 16,
    borderWidth: 2,
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
});
