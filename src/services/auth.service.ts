import { Alert } from "react-native";
import { API_URL } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type CredentialData = {
  email: string;
  password: string;
};

export const login = async (data: CredentialData) => {
  try {
    const result = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await result.json();

    // console.log("Login response:", responseData);

    if (!result.ok) {
      throw new Error(responseData.message || "Invalid email or password");
    }
    const token = result.headers.get("set-cookie");

    if (!token) {
      throw new Error("Token not received from server");
    }

    await AsyncStorage.setItem("token", token);

    Alert.alert("Login successful!", "Click OK to see your tasks", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/");
        },
      },
    ]);

    return responseData;
  } catch (error) {
    console.error("Login error:", error);

    Alert.alert(
      "Server error",
      error instanceof Error ? error.message : "Something went wrong",
    );

    throw error;
  }
};

export async function checkAuth(){
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
    });
    const res = await response.json();
    // console.log(res.data);
    return res.success;
  } catch (error) {
    Alert.alert("server error");
    return false;
  }
}