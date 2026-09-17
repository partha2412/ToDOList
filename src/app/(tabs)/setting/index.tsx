import { View, Text, ActivityIndicator, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import Login from "@/components/Login";
import { syncCloud } from "@/services/data.service";
import { checkAuth } from "@/services/auth.service";

const Setting = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

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
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
      <View className="flex-1 bg-amber-00 items-center justify-center gap-10">
        {authenticated ? (
          <>
            <Text className="text-xl font-bold">You are logged in</Text>

            <Pressable
              onPress={handleSync}
              disabled={syncing}
              className="bg-black px-8 py-4 rounded-xl"
            >
              <Text className="text-white font-bold">
                {syncing ? "Syncing..." : "Sync Cloud"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-xl font-bold">Login</Text>

            <Login />
          </>
        )}
      </View>
  );
};

export default Setting;
