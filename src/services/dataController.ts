import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "./api";
import { Alert } from "react-native";
import { router } from "expo-router";

type NewTask = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
};

export async function loadData() {
  // Get local data
  const localData = await AsyncStorage.getItem("my_tasks");

  let localTasks = [];

  try {
    const parsed = localData ? JSON.parse(localData) : [];
    localTasks = Array.isArray(parsed) ? parsed : [];
  } catch {
    localTasks = [];
  }

  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return localTasks;
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
    });

    if (!response.ok) {
      return localTasks;
    }

    const result = await response.json();

    const apiTasks = Array.isArray(result.data) ? result.data : [];

    // Combine local + API and remove duplicate IDs
    const taskMap = new Map();

    for (const task of localTasks) {
      taskMap.set(task._id, task);
    }

    for (const task of apiTasks) {
      taskMap.set(task._id, task);
    }

    return Array.from(taskMap.values());
  } catch (error) {
    console.error("API error:", error);

    // API failed → only local
    return localTasks;
  }
}

export async function deleteTask(id: string) {
  try {
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

    if (result.status === 200) {
      const storedTasks = await AsyncStorage.getItem("my_tasks");

      const tasks = storedTasks ? JSON.parse(storedTasks) : [];

      const updatedTasks = tasks.filter(
        (task: { _id: string }) => task._id !== id,
      );
      await AsyncStorage.setItem("my_tasks", JSON.stringify(updatedTasks));

      router.push("/");
    }
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