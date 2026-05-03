import { getJobById } from "@/src/repositories/jobsRepository";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState({});
  const [ready, setReady] = useState(false);

  const fetchJobDetails = async () => {
    const job = await getJobById(id);
    await setJob(job);
    if (Object.keys(job).length > 0) {
      setReady(true);
      return;
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  return !ready ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  ) : (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Job Details</Text>
      <Text>Job ID: {id}</Text>
      <Text>Site Name: {job.siteName ? job.siteName : "N/A"}</Text>
      <Text>Asset Name: {job.assetName ? job.assetName : "N/A"}</Text>
      <Text>Due Date: {job.dueDate ? job.dueDate : "N/A"}</Text>
      <Text>Status: {job.status ? job.status : "N/A"}</Text>
      <Button
        title="Begin Inspection"
        onPress={() => router.push(`/inspection/${id}`)}
      />
    </View>
  );
}
