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
    const storedTasks = await AsyncStorage.getItem("my_tasks");
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];

    // Local task
    if (id.startsWith("local-")) {
      const updatedTasks = tasks.filter(
        (task: { _id: string }) => task._id !== id,
      );

      await AsyncStorage.setItem("my_tasks", JSON.stringify(updatedTasks));

      router.push("/");
      return;
    }

    // Cloud task
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.log("No token found");
      return;
    }

    const result = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (!result.ok) {
      throw new Error("Failed to delete cloud task");
    }

    // Delete from local storage too
    const updatedTasks = tasks.filter(
      (task: { _id: string }) => task._id !== id,
    );

    await AsyncStorage.setItem("my_tasks", JSON.stringify(updatedTasks));

    router.push("/");
  } catch (error) {
    Alert.alert("Server Error", `${error}`);
  }
}

export async function addTask(data: NewTask) {
  // Create a local task
  const localTask = {
    ...data,
    _id: `local-${Date.now()}`,
    synced: false,
  };

  // 1. Store locally FIRST
  const storedTasks = await AsyncStorage.getItem("my_tasks");

  let tasks = [];

  if (storedTasks) {
    const parsed = JSON.parse(storedTasks);
    tasks = Array.isArray(parsed) ? parsed : [];
  }

  tasks.push(localTask);

  await AsyncStorage.setItem("my_tasks", JSON.stringify(tasks));

  // 2. Try API
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.log("No token. Task saved locally.");
      return localTask;
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create task");
    }

    // 3. API succeeded
    const serverTask = result.data || result;

    // Get latest local tasks
    const latestStored = await AsyncStorage.getItem("my_tasks");

    const latestParsed = latestStored ? JSON.parse(latestStored) : [];

    const latestTasks = Array.isArray(latestParsed) ? latestParsed : [];

    // Replace local task with server task
    const updatedTasks = latestTasks.map((task: typeof localTask) =>
      task._id === localTask._id
        ? {
            ...serverTask,
            synced: true,
          }
        : task,
    );

    await AsyncStorage.setItem("my_tasks", JSON.stringify(updatedTasks));

    return serverTask;
  } catch (error) {
    // API failed, but local task is already saved
    console.log("API failed. Task saved locally and will be synced later.");

    console.error("addTask API error:", error);

    // IMPORTANT:
    // Don't throw here because local creation succeeded.
    return localTask;
  }
}

export async function syncCloud() {
  try {
    const localData = await AsyncStorage.getItem("my_tasks");
    const parsed = localData ? JSON.parse(localData) : [];
    const localTasks = Array.isArray(parsed) ? parsed : [];

    const cloudTasks = await cloudData();

    const uniqueMerged = localTasks
      .concat(cloudTasks)
      .filter((item, index, self) => {
        return self.indexOf(item) === index;
      });

    console.log(uniqueMerged);

    // Save to local storage
    await AsyncStorage.setItem("my_tasks", JSON.stringify(uniqueMerged));

    return uniqueMerged;
  } catch (error) {
    Alert.alert("Failed to Sync", `${error}`);

    // Keep existing local data if sync fails
    const localData = await AsyncStorage.getItem("my_tasks");
    const parsed = localData ? JSON.parse(localData) : [];

    return Array.isArray(parsed) ? parsed : [];
  }
}
