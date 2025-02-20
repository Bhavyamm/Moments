import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
// import { supabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // let { data, error } = await supabase.auth.signInWithOtp({
    //   phone: `+91${phoneNumber}`,
    // });
    // if (error) {
    //   Alert.alert("Error", error.message);
    //   return null;
    // }
    // router.navigate("/verify-otp");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text
                  style={[styles.title, { lineHeight: 40 }]}
                  className="text-4xl text-center font-montserrat-bold text-primary-100 mb-4"
                >
                  Enter your phone{"\n"}
                  <Text style={{ lineHeight: 40 }}>number</Text>
                </Text>
                <Text
                  style={[styles.subtitle, { lineHeight: 24 }]}
                  className="text-lg text-primary-100 font-montserrat-medium text-center mb-2"
                >
                  A confirmation code will be sent to your number to connect
                  with the app
                </Text>
              </View>
              <TextInput
                placeholder="Enter phone number"
                placeholderTextColor="#888"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="numeric"
                className="mt-4"
              />
            </View>
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-yellow-100 rounded-full w-full py-4 mt-14 border-primary-100 border-2"
            >
              <Text
                style={styles.buttonText}
                className="text-center font-montserrat-bold text-primary-100 text-xl"
              >
                Send OTP
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
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
  },
  textContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  button: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 25,
    paddingVertical: 16,
    borderWidth: 2,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
});
