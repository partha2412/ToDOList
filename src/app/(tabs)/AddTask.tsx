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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">(
    "pending",
  );

  const [dueDate, setDueDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

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

    const newTask = {
      _id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate.toISOString(),
    };

    try {
      const storedTasks = await AsyncStorage.getItem("my_tasks");

      let tasks = [];

      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);

        // Make sure stored data is actually an array
        tasks = Array.isArray(parsed) ? parsed : [];
      }

      tasks.push(newTask);

      await AsyncStorage.setItem("my_tasks", JSON.stringify(tasks));

      Alert.alert("Task added", "Your task has been created.");

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("pending");
      setDueDate(new Date());

      router.push('/');
    } catch (error) {
      console.error("Failed to save task:", error);
      Alert.alert("Error", "Could not save the task.");
    }
  };

  return (
    <ScrollView
      className="flex-1 mt-20"
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
          className="min-h-22.5 rounded-2xl bg-white p-4 text-base text-gray-900 border border-gray-200"
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
                onPress={() => setPriority(item)}
                className={`flex-1 rounded-xl py-3.5 ${
                  active ? "bg-blue-500" : "bg-white border border-gray-200"
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
                onPress={() => setStatus(item)}
                className={`flex-1 rounded-xl py-3.5 ${
                  active ? "bg-blue-500" : "bg-white border border-gray-200"
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
          onPress={() => setShowCalendar(true)}
          className="flex-row items-center rounded-2xl bg-white border border-gray-200 px-4 py-4"
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

      {/* Add button */}

      <Pressable
        onPress={handleAddTask}
        className="h-14 flex-row items-center justify-center rounded-2xl bg-blue-500 active:bg-gray-800"
      >
        <MaterialCommunityIcons name="plus" size={22} color="white" />

        <Text className="ml-2 text-base font-semibold text-white">
          Create task
        </Text>
      </Pressable>
    </ScrollView>
  );
};

export default AddTask;
