import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { deleteTask, loadData } from "@/services/dataController";

import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
};

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

const statusOrder = {
  pending: 1,
  "in-progress": 2,
  completed: 3,
};

const Tasks = () => {
  const [refreshing, setRefreshing] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [sortBy, setSortBy] = useState<
    "recent" | "dueDate" | "priority" | "status" | "title"
  >("recent");

  const [showSort, setShowSort] = useState(false);

  const getSortLabel = () => {
    switch (sortBy) {
      case "dueDate":
        return "Due Date";

      case "priority":
        return "Priority";

      case "status":
        return "Status";

      case "title":
        return "Title";

      default:
        return "Recent";
    }
  };

  const getSortedTasks = () => {
    const sorted = tasks.slice();

    switch (sortBy) {
      case "dueDate":
        return sorted.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );

      case "priority":
        return sorted.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
        );

      case "status":
        return sorted.sort(
          (a, b) => statusOrder[a.status] - statusOrder[b.status],
        );

      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      default:
        return sorted;
    }
  };

  const fetchData = async () => {
    setRefreshing(true);

    try {
      const result = await loadData();

      setTasks(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    // const updatedTasks = tasks.filter((task) => task._id !== id);

    Alert.alert("Delete the Task?", "Delete this task from your database?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(id);
            await fetchData();
          } catch (error) {
            console.error("Failed to delete task:", error);
          }
        },
      },
    ]);
  };

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
    <View className="flex-1">
      {/* SORT HEADER */}
      <View className="absolute -top-20 right-4 z-50 flex-row items-center justify-end px-5 py-3">
        <Pressable
          onPress={() => setShowSort(!showSort)}
          className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-2"
        >
          <MaterialCommunityIcons name="sort" size={18} color="#374151" />

          <Text className="ml-2 text-sm font-medium text-gray-700">
            {getSortLabel()}
          </Text>

          <MaterialCommunityIcons
            name={showSort ? "chevron-up" : "chevron-down"}
            size={18}
            color="#6B7280"
          />
        </Pressable>

        {/* DROPDOWN */}
          {showSort && (
            <View className="absolute right-5 top-14 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              {/* Recent */}
              <Pressable
                onPress={() => {
                  setSortBy("recent");
                  setShowSort(false);
                }}
                className="px-4 py-3"
              >
                <Text
                  className={
                    sortBy === "recent"
                      ? "font-semibold text-sky-500"
                      : "text-gray-700"
                  }
                >
                  Recent
                </Text>
              </Pressable>

              {/* Due Date */}
              <Pressable
                onPress={() => {
                  setSortBy("dueDate");
                  setShowSort(false);
                }}
                className="px-4 py-3"
              >
                <Text
                  className={
                    sortBy === "dueDate"
                      ? "font-semibold text-sky-500"
                      : "text-gray-700"
                  }
                >
                  Due Date
                </Text>
              </Pressable>

              {/* Priority */}
              <Pressable
                onPress={() => {
                  setSortBy("priority");
                  setShowSort(false);
                }}
                className="px-4 py-3"
              >
                <Text
                  className={
                    sortBy === "priority"
                      ? "font-semibold text-sky-500"
                      : "text-gray-700"
                  }
                >
                  Priority
                </Text>
              </Pressable>

              {/* Status */}
              <Pressable
                onPress={() => {
                  setSortBy("status");
                  setShowSort(false);
                }}
                className="px-4 py-3"
              >
                <Text
                  className={
                    sortBy === "status"
                      ? "font-semibold text-sky-500"
                      : "text-gray-700"
                  }
                >
                  Status
                </Text>
              </Pressable>

              {/* Title */}
              <Pressable
                onPress={() => {
                  setSortBy("title");
                  setShowSort(false);
                }}
                className="px-4 py-3"
              >
                <Text
                  className={
                    sortBy === "title"
                      ? "font-semibold text-sky-500"
                      : "text-gray-700"
                  }
                >
                  Title A-Z
                </Text>
              </Pressable>
            </View>
          )}
      </View>

      {/* TASK LIST */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-4 p-2 pb-36">
          {tasks.length > 0 ? (
            getSortedTasks().map((data, index) => (
              <View
                key={data._id}
                className="w-[90%] rounded-2xl border border-gray-200 bg-white p-2 shadow-sm"
              >
                {/* TOP */}
                <View className="flex-row gap-3 rounded-xl bg-gray-50/60 p-2">
                  {/* NUMBER */}
                  <View className="w-12 items-center justify-center">
                    <Text className="text-2xl font-bold text-gray-900">
                      {index + 1}.
                    </Text>

                    <Text className="mt-0.5 font-mono text-[9px] text-gray-400">
                      #{data._id.slice(-4)}
                    </Text>
                  </View>

                  {/* CONTENT */}
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

                  {/* DELETE */}
                  <Pressable
                    onPress={() => handleDeleteTask(data._id)}
                    className="h-9 w-9 items-center justify-center rounded-lg bg-red-50"
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      color="#EF4444"
                      size={20}
                    />
                  </Pressable>
                </View>

                {/* METADATA */}
                <View className="mt-2 h-9 flex-row items-center border-t border-gray-100 pt-1">
                  {/* DATE */}
                  <View className="flex-1 items-center">
                    <Text className="text-xs font-medium text-gray-500">
                      {new Date(data.dueDate).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* STATUS */}
                  <View className="flex-1 flex-row items-center justify-center gap-1.5">
                    <StatusIcon status={data.status} />
                  </View>

                  {/* PRIORITY */}
                  <View className="flex-1 items-center">
                    <Priority priority={data.priority} />
                  </View>
                </View>
              </View>
            ))
          ) : (
            /* EMPTY STATE */

            <View className="w-full items-center justify-center py-6">
              <View className="mb-10 items-center">
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
    </View>
  );
};

export default Tasks;
