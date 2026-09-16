import React from "react";
import { Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import "../../../global.css";
import Tasks from "@/components/Tasks";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8F8F7]">
      <View className="w-screen h-screen">
        {/* Header */}
        <View className="px-6 pt-7 pb-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-4xl font-bold tracking-tight text-gray-900">
                My Tasks
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Keep your day organized
              </Text>
            </View>
          </View>
        </View>

        {/* Small divider */}
        <View className="mx-6 mb-4 h-px bg-gray-200" />

        {/* Task section header */}
        {/* <View className="px-6 mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-gray-900">All tasks</Text>

          <View className="rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-xs font-medium text-gray-500">Recent</Text>
          </View>
        </View> */}

        {/* Tasks */}
        <View className="flex-1">
          <Tasks />
        </View>
      </View>
    </SafeAreaView>
  );
}
