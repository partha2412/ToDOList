import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { login } from "@/services/auth.service";

type CredentialData = {
  email: string;
  password: string;
};

const Login = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<CredentialData>({
    email: "",
    password: "",
  });

  const isFormValid =
    data.email.trim().length > 0 && data.password.trim().length > 0;

  const handleLogin = async () => {
    if (!isFormValid) {
      return;
    }

    setLoading(true);

    try {
      await login(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F7F5]">
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center">
            <View className="w-full max-w-md self-center">
              <View className="mb-10">
                {/* <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-gray-950">
                  <Feather name="check" size={22} color="white" />
                </View> */}

                <Text className="text-3xl font-bold tracking-tight text-gray-950">
                  Log in
                </Text>

                <Text className="mt-2 text-[15px] leading-6 text-gray-500">
                  Sign in to continue managing your tasks.
                </Text>
              </View>

              <View className="gap-5">
                <View>
                  <Text className="mb-2.5 text-[13px] font-semibold text-gray-700">
                    Email
                  </Text>

                  <View className="h-14 w-full flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
                    <Feather name="mail" size={18} color="#A1A1AA" />

                    <TextInput
                      className="ml-3 flex-1 text-[15px] text-gray-900"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Enter your email"
                      placeholderTextColor="#A1A1AA"
                      value={data.email}
                      onChangeText={(text) => setData({ ...data, email: text })}
                    />
                  </View>
                </View>

                <View>
                  <View className="mb-2.5 flex-row items-center justify-between">
                    <Text className="text-[13px] font-semibold text-gray-700">
                      Password
                    </Text>

                    <Pressable hitSlop={8}>
                      <Text className="text-[13px] font-semibold text-gray-500">
                        Forgot password?
                      </Text>
                    </Pressable>
                  </View>

                  <View className="h-14 w-full flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
                    <Feather name="lock" size={18} color="#A1A1AA" />

                    <TextInput
                      className="ml-3 flex-1 text-[15px] text-gray-900"
                      textContentType="password"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Enter your password"
                      placeholderTextColor="#A1A1AA"
                      secureTextEntry={!show}
                      value={data.password}
                      onChangeText={(text) =>
                        setData({ ...data, password: text })
                      }
                    />

                    <Pressable
                      className="ml-2 h-10 w-10 items-center justify-center"
                      onPress={() => setShow(!show)}
                      hitSlop={10}
                    >
                      <Feather
                        name={show ? "eye" : "eye-off"}
                        size={19}
                        color="#71717A"
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  disabled={!isFormValid || loading}
                  onPress={handleLogin}
                  className={`mt-2 h-14 w-full items-center justify-center rounded-2xl ${
                    !isFormValid || loading ? "bg-gray-300" : "bg-gray-950"
                  }`}
                >
                  <Text
                    className={`text-[15px] font-bold ${
                      !isFormValid || loading ? "text-gray-500" : "text-white"
                    }`}
                  >
                    {loading ? "Logging in..." : "Sign in"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
