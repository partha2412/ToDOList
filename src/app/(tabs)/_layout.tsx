import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, View ,Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  
  const insets = useSafeAreaInsets();

  function TabButton({
    isFocused,
    label,
    icon,
    ...props
  }: TabTriggerSlotProps & {
    label: string;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
  }) {
    return (
      <Pressable {...props}>
        <View className="justify-center items-center self-center">
          <FontAwesome
            name={icon}
            size={24}
            color={isFocused ? "#2563eb" : "#9CA3AF"}
          />

          <Text
            className={
              isFocused
                ? "font-semibold text-blue-500"
                : "font-semibold text-gray-400"
            }
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Tabs>
      <TabSlot />

      <TabList
        style={{
          bottom: insets.bottom + 16,
        }}
        className="absolute px-8 pt-1 w-[80%] self-center h-18 rounded-3xl bg-white/90 shadow-lg flex-row justify-center items-center"
      >
        <TabTrigger name="index" href="/" asChild>
          <TabButton label="Tasks" icon="list-ul" />
        </TabTrigger>

        <TabTrigger name="AddTask" href="/AddTask" asChild>
          <TabButton label="Add Task" icon="calendar-plus-o" />
        </TabTrigger>

        <TabTrigger name="setting" href="/setting" asChild>
          <TabButton label="Cloud" icon="cloud" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
