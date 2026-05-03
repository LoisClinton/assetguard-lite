import { auth } from "@/src/services/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true); //default to true

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      router.replace(user ? "/(app)/jobs" : "/(auth)/login");
      setIsLoading(false);
    });
    return unsub;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
}
