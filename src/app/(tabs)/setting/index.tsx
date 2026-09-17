import { View, Text, ActivityIndicator, Pressable } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Login from "@/components/Login";
import { syncCloud } from "@/services/data.service";
import { checkAuth, logout } from "@/services/auth.service";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Setting = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      checkUser();
    }, []),
  );

  const checkUser = async () => {
    try {
      const result = await checkAuth();

      setAuthenticated(result);
    } catch (error) {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async ()=>{
    await logout();
  }

  const handleSync = async () => {
    try {
      setSyncing(true);

      await syncCloud();
    } catch (error) {
      console.log("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  // Checking authentication
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F7F7F5]">
      {authenticated ? (
        <View className="flex-1 items-center justify-center px-6">
          <Pressable
            onPress={handleLogout}
            className="absolute right-6 top-16 flex-row items-center gap-2 rounded-xl bg-white px-4 py-3"
          >
            <MaterialCommunityIcons name="logout" size={22} color="black" />
            <Text className="font-semibold text-gray-900">Log out</Text>
          </Pressable>

          <View className="w-full max-w-md items-center">
            <Text className="mb-6 text-2xl font-bold text-gray-950">
              You are logged in
            </Text>

            <Pressable
              onPress={handleSync}
              disabled={syncing}
              className={`h-14 w-full items-center justify-center rounded-2xl ${
                syncing ? "bg-gray-300" : "bg-gray-950"
              }`}
            >
              <Text
                className={`text-[15px] font-bold ${
                  syncing ? "text-gray-500" : "text-white"
                }`}
              >
                {syncing ? "Syncing..." : "Sync Cloud"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="flex-1 px-6">
          <View className="flex-1 w-full max-w-md self-center">
            <Login />
          </View>
        </View>
      )}
    </View>
  );
};

export default Setting;
