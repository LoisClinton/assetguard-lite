import { initDatabase } from "@/src/db/schema";
import { seedJobs } from "@/src/repositories/jobsRepository";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  async function setup() {
    await initDatabase();
    await seedJobs();
    setReady(true);
  }

  useEffect(() => {
    setup();
  }, []);

  if (ready) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    );
  }
}
