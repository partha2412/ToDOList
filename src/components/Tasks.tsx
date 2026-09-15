import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  ViewBase,
} from "react-native";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
};

const Tasks = () => {
  const [refreshing, setRefreshing] = useState(false);

  // IMPORTANT: initialize as an empty array
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchData = async () => {
    setRefreshing(true);

    try {
      const my_tasks = await AsyncStorage.getItem("my_tasks");

      const storedTasks: Task[] = my_tasks ? JSON.parse(my_tasks) : [];

      // Make sure we always have an array
      setTasks(Array.isArray(storedTasks) ? storedTasks : []);

    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const updatedTasks = tasks.filter((task) => task._id !== id);

      Alert.alert("Delete the Task ?", "delete the task from your database", [
        {
          text: "Cancel",
        },
        {
          text: "Ok",
          onPress: async () => {
            await AsyncStorage.setItem(
              "my_tasks",
              JSON.stringify(updatedTasks),
            );
            setTasks(updatedTasks);
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Load tasks when component opens
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  function Priority({ priority }: { priority: string }) {
    if (priority === "high") {
      return <Text className="text-[12px] text-red-600">High</Text>;
    }

    if (priority === "low") {
      return <Text className="text-[12px] text-green-600">Low</Text>;
    }

    return <Text className="text-[12px] text-yellow-600">Medium</Text>;
  }

  function StatusIcon({ status }: { status: string }) {
    const size = 20;

    if (status === "in-progress") {
      return (
        <>
          <MaterialCommunityIcons
            name="progress-clock"
            size={size}
            color="#2196F3"
          />

          <Text className="font-mono text-[12px] text-blue-500">
            In Progress
          </Text>
        </>
      );
    }

    if (status === "completed") {
      return (
        <>
          <MaterialCommunityIcons
            name="checkbox-marked-circle-outline"
            size={size}
            color="#4CAF50"
          />

          <Text className="font-mono text-[12px] text-green-500">
            Completed
          </Text>
        </>
      );
    }

    return (
      <>
        <Ionicons name="hourglass-outline" size={size - 1} color="#FF9800" />

        <Text className="font-mono text-[12px] text-orange-500">Pending</Text>
      </>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center gap-4 p-2 pb-36">
        {tasks.length > 0 ? (
          tasks.map((data, index) => (
            <View
              key={data._id}
              className="w-[90%] rounded-2xl border border-gray-200 bg-white p-2 shadow-sm"
            >
              {/* Top */}
              <View className="flex-row gap-3 rounded-xl bg-gray-50/60 p-2">
                {/* Number */}
                <View className="w-12 items-center justify-center">
                  <Text className="text-2xl font-bold text-gray-900">
                    {index + 1}.
                  </Text>

                  <Text className="mt-0.5 font-mono text-[9px] text-gray-400">
                    #{data._id.slice(-4)}
                  </Text>
                </View>

                {/* Content */}
                <View className="flex-1 justify-center">
                  <Text
                    className="text-xl font-semibold tracking-tight text-gray-900"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {data.title}
                  </Text>

                  <Text
                    className="mt-1 text-sm leading-5 text-gray-500"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {data.description}
                  </Text>
                </View>
                <Pressable onPress={()=>deleteTask(data._id)}>
                  <MaterialCommunityIcons name="delete" color="red" size={20} />
                </Pressable>
              </View>

              {/* Metadata */}
              <View className="mt-2 h-9 flex-row items-center border-t border-gray-100 pt-1">
                {/* Date */}
                <View className="flex-1 items-center">
                  <Text className="text-xs font-medium text-gray-500">
                    {new Date(data.dueDate).toLocaleDateString()}
                  </Text>
                </View>

                {/* Status */}
                <View className="flex-1 flex-row items-center justify-center gap-1.5">
                  <StatusIcon status={data.status} />
                </View>

                {/* Priority */}
                <View className="flex-1 items-center">
                  <Priority priority={data.priority} />
                </View>
              </View>
            </View>
          ))
        ) : (
          /* Empty state */
          <View className="w-full items-center justify-center py-20">
            <View className="mb-8 items-center">
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={55}
                color="#A1A1AA"
              />

              <Text className="mt-4 text-xl font-semibold text-gray-700">
                No tasks yet
              </Text>

              <Text className="mt-1 text-sm text-gray-400">
                Create your first task to get started.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/AddTask")}
              className="flex-row items-center rounded-2xl bg-gray-900 px-6 py-4"
            >
              <MaterialCommunityIcons name="plus" size={22} color="white" />

              <Text className="ml-2 font-semibold text-white">Add Task</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Tasks;
