import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { addTask } from "@/services/dataController";

type NewTask = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
};

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">(
    "pending",
  );

  const [dueDate, setDueDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowCalendar(false);

    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Add a title", "Please enter a task title.");
      return;
    }

    if (loading) return;

    const newTask: NewTask = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate.toISOString(),
    };

    try {
      setLoading(true);

      await addTask(newTask);

      Alert.alert("Task added", "Your task has been created.", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/");
          },
        },
      ]);

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setDueDate(new Date());
    } catch (error) {
      console.error("Failed to create task:", error);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not create the task.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="mt-20 flex-1"
      contentContainerClassName="px-6 pt-8 pb-36"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="mb-10">
        <Text className="text-4xl font-bold tracking-tight text-gray-900">
          New task
        </Text>

        <Text className="mt-2 text-base text-gray-500">
          What needs to be done?
        </Text>
      </View>

      {/* Title */}
      <View className="mb-7">
        <Text className="mb-2 text-sm font-medium text-gray-500">TITLE</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          placeholderTextColor="#A1A1AA"
          maxLength={100}
          editable={!loading}
          className="border-b border-gray-300 pb-3 text-lg text-gray-900"
        />
      </View>

      {/* Description */}
      <View className="mb-8">
        <Text className="mb-2 text-sm font-medium text-gray-500">
          DESCRIPTION
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#A1A1AA"
          multiline
          textAlignVertical="top"
          maxLength={1000}
          editable={!loading}
          className="min-h-22.5 rounded-2xl border border-gray-200 bg-white p-4 text-base text-gray-900"
        />
      </View>

      {/* Priority */}
      <View className="mb-8">
        <Text className="mb-3 text-sm font-medium text-gray-500">PRIORITY</Text>

        <View className="flex-row gap-2">
          {(["low", "medium", "high"] as const).map((item) => {
            const active = priority === item;

            return (
              <Pressable
                key={item}
                disabled={loading}
                onPress={() => setPriority(item)}
                className={`flex-1 rounded-xl py-3.5 ${
                  active ? "bg-blue-500" : "border border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Status */}
      <View className="mb-8">
        <Text className="mb-3 text-sm font-medium text-gray-500">STATUS</Text>

        <View className="flex-row gap-2">
          {(["pending", "in-progress", "completed"] as const).map((item) => {
            const active = status === item;

            return (
              <Pressable
                key={item}
                disabled={loading}
                onPress={() => setStatus(item)}
                className={`flex-1 rounded-xl py-3.5 ${
                  active ? "bg-blue-500" : "border border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-center text-xs font-medium ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item === "in-progress"
                    ? "In Progress"
                    : item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Due Date */}
      <View className="mb-10">
        <Text className="mb-3 text-sm font-medium text-gray-500">DUE DATE</Text>

        <Pressable
          disabled={loading}
          onPress={() => setShowCalendar(true)}
          className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4"
        >
          <MaterialCommunityIcons
            name="calendar-outline"
            size={22}
            color="#52525B"
          />

          <Text className="ml-3 flex-1 text-base text-gray-800">
            {dueDate.toLocaleDateString()}
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#A1A1AA"
          />
        </Pressable>

        {showCalendar && (
          <View className="mt-4 items-center">
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          </View>
        )}
      </View>

      {/* Create Button */}
      <Pressable
        disabled={loading || !title.trim()}
        onPress={handleAddTask}
        className={`h-14 flex-row items-center justify-center rounded-2xl ${
          loading || !title.trim() ? "bg-gray-300" : "bg-blue-500"
        }`}
      >
        <MaterialCommunityIcons
          name={loading ? "loading" : "plus"}
          size={22}
          color={loading || !title.trim() ? "#6B7280" : "white"}
        />

        <Text
          className={`ml-2 text-base font-semibold ${
            loading || !title.trim() ? "text-gray-500" : "text-white"
          }`}
        >
          {loading ? "Creating..." : "Create task"}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddTask;
