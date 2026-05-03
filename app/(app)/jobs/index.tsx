import { Job } from "@/src/models/Job";
import { getJobs } from "@/src/repositories/jobsRepository";
import { auth } from "@/src/services/firebase";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";

export default function JobsScreen() {
  const [ready, setReady] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchJobs() {
    const localJobs = await getJobs();
    setJobs(localJobs);
    setReady(true);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Button title="📤 Sync" onPress={() => router.push("/sync")} />
        <Button
          title="Logout"
          onPress={async () => {
            setError(null);
            try {
              await signOut(auth);
              router.replace("/");
            } catch (error) {
              console.log("Error signing out: ", error);
              setError("Failed to sign out. Please try again.");
            }
          }}
        />
      </View>

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      {!ready ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Assigned Jobs
          </Text>
          {jobs.map((job) => (
            <Pressable
              key={job.id}
              onPress={() => router.push(`/jobs/${job.id}`)}
              style={{
                borderWidth: 1,
                padding: 12,
                backgroundColor: "#2196f3",
                borderColor: "#ffffff",
                borderRadius: 15,
              }}
            >
              <View
                key={job.id}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 15,
                }}
              >
                <Text style={{ color: "#ffffff" }}>Site: {job.siteName}</Text>
                <Text style={{ color: "#ffffff" }}>Asset: {job.assetName}</Text>
                <Text style={{ color: "#ffffff" }}>
                  Due: {new Date(job.dueDate).toLocaleDateString()}
                </Text>
                <Text style={{ color: "#ffffff" }}>Status: {job.status}</Text>
              </View>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}
