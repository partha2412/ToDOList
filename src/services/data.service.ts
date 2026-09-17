import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";
import { Alert } from "react-native";
import { API_URL } from "./api";

type NewTask = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
};

export async function localData() {
  try {
    const storedData = await AsyncStorage.getItem("my_tasks");

    const parsed = storedData ? JSON.parse(storedData) : [];

    const localTasks = Array.isArray(parsed)
      ? parsed.filter((task) => task && task._id)
      : [];

    return localTasks;
  } catch (error) {
    Alert.alert("Failed to load Local Data", `${error}`);
    return [];
  }
}

export async function cloudData() {
  try {
    const token = await AsyncStorage.getItem("token");
    const cloudData = await fetch(`${API_URL}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
    });
    if (!cloudData.ok) {
      throw new Error("Error while loading cloud data");
    }

    const cloudTasks = await cloudData.json();
    return cloudTasks.data;
  } catch (error) {
    Alert.alert("Failed to Fetch cloud data", `${error}`);
  }
}

export async function deleteTask(id: string) {
  try {
    const stored = await AsyncStorage.getItem("my_tasks");
    const tasks = stored ? JSON.parse(stored) : [];

    // Remove immediately from local tasks
    const updatedTasks = tasks.filter(
      (task: { _id: string }) => task._id !== id,
    );

    await AsyncStorage.setItem("my_tasks", JSON.stringify(updatedTasks));

    // If it is a cloud task, remember its ID for next sync
    if (!id.startsWith("local-")) {
      const deletedStored = await AsyncStorage.getItem("deleted_tasks");

      const deletedTasks = deletedStored ? JSON.parse(deletedStored) : [];

      if (!deletedTasks.includes(id)) {
        deletedTasks.push(id);
      }

      await AsyncStorage.setItem("deleted_tasks", JSON.stringify(deletedTasks));
    }

    router.replace("/");
  } catch (error) {
    Alert.alert("Failed to delete task", `${error}`);
  }
}

export async function addTask(data: NewTask) {
  try {
    const localTask = {
      ...data,
      _id: `local-${Date.now()}`,
      synced: false,
    };

    const storedTasks = await AsyncStorage.getItem("my_tasks");

    const parsed = storedTasks ? JSON.parse(storedTasks) : [];

    const tasks = Array.isArray(parsed) ? parsed : [];

    tasks.push(localTask);

    await AsyncStorage.setItem("my_tasks", JSON.stringify(tasks));

    return localTask;
  } catch (error) {
    Alert.alert("Failed to add task", `${error}`);
    return null;
  }
}

export async function syncCloud() {
  try {
    // Get local tasks
    const storedData = await AsyncStorage.getItem("my_tasks");
    const parsed = storedData ? JSON.parse(storedData) : [];

    let localTasks = Array.isArray(parsed) ? parsed : [];

    // Find tasks that haven't been uploaded
    const unsyncedTasks = localTasks.filter((task) => task.synced === false);

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("Please login before syncing");
    }

    // Upload unsynced tasks
    for (const task of unsyncedTasks) {
      const { _id, synced, ...taskData } = task;

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        continue;
      }

      const result = await response.json();
      const serverTask = result.data || result;

      // Replace local temporary task
      localTasks = localTasks.map((item) =>
        item._id === _id
          ? {
              ...serverTask,
              synced: true,
            }
          : item,
      );
    }

    // Get cloud tasks
    const cloudTasks = await cloudData();

    // Merge using task ID
    const uniqueMerged = Array.from(
      new Map(
        [...localTasks, ...cloudTasks].map((task) => [task._id, task]),
      ).values(),
    );

    // Save final data locally
    await AsyncStorage.setItem("my_tasks", JSON.stringify(uniqueMerged));

    return uniqueMerged;
  } catch (error) {
    Alert.alert("Failed to Sync", `${error}`);

    return await localData();
  }
}