import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="jobs/index" options={{ title: "Jobs" }} />
      <Stack.Screen name="jobs/[id]" options={{ title: "Job Details" }} />
      <Stack.Screen
        name="inspection/[id]"
        options={{ title: "Inspection Details" }}
      />
      <Stack.Screen name="sync/index" options={{ title: "Sync Inspections" }} />
    </Stack>
  );
}
