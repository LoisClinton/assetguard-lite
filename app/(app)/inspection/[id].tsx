import { saveInspection } from "@/src/repositories/inspectionRepository";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function InspectionScreen() {
  const { id: jobId } = useLocalSearchParams<{ id: string }>();
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    await saveInspection({
      id: `inspection-${jobId}`,
      jobId,
      notes,
      status: "queued",
      updatedAt: new Date().toISOString(),
    });
    router.push(`/sync`);
  };

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Inspection for Job {jobId}
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Enter inspection notes"
        multiline
        style={{ borderWidth: 1, padding: 10, borderRadius: 4, minHeight: 100 }}
      />
      <Button title="Save Inspection" onPress={handleSave} />
    </View>
  );
}
