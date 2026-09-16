import { View, Text, TextInput, Pressable } from "react-native";
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
    <View className="w-full px-5">
      <View className="w-full max-w-xl self-center gap-7">
        {/* Email */}
        <View className="w-full gap-2">
          <Text className="text-base font-semibold text-gray-700">Email</Text>

          <TextInput
            className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base text-gray-900"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={data.email}
            onChangeText={(text) =>
              setData({
                ...data,
                email: text,
              })
            }
          />
        </View>

        {/* Password */}
        <View className="w-full gap-2">
          <Text className="text-base font-semibold text-gray-700">
            Password
          </Text>

          <View className="w-full">
            <TextInput
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 pr-14 text-base text-gray-900"
              textContentType="password"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!show}
              value={data.password}
              onChangeText={(text) =>
                setData({
                  ...data,
                  password: text,
                })
              }
            />

            <Pressable
              className="absolute right-4 top-0 h-14 items-center justify-center"
              onPress={() => setShow(!show)}
              hitSlop={10}
            >
              <Feather
                name={show ? "eye" : "eye-off"}
                size={21}
                color="#6B7280"
              />
            </Pressable>
          </View>
        </View>

        {/* Login button */}
        <Pressable
          disabled={!isFormValid || loading}
          onPress={handleLogin}
          className={`mt-2 h-14 w-full items-center justify-center rounded-2xl ${
            !isFormValid || loading ? "bg-gray-300" : "bg-sky-500"
          }`}
        >
          <Text
            className={`text-lg font-bold ${
              !isFormValid || loading ? "text-gray-500" : "text-white"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Login;
