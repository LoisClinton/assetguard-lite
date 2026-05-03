import { SyncQueueItem } from "@/src/models/SyncQueueItem";
import { getPendingQueueItems } from "@/src/repositories/queueRepository";
import { syncPendingInspections } from "@/src/services/syncService";
import { isOnline } from "@/src/utils/network";
import NetInfo from "@react-native-community/netinfo";
import { Button as ButtonB } from "@react-navigation/elements";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";

export default function SyncScreen() {
  const [status, setStatus] = useState("Loading queue...");
  const [networkMessage, setNetworkMessage] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [hasConnection, setHasConnection] = useState<boolean | null>(null);

  const refreshQueueCount = async () => {
    try {
      const queue = (await getPendingQueueItems()) as SyncQueueItem[];
      setQueueItems(queue);
      setQueueCount(queue.length);

      if (queue.length === 0) {
        setStatus("No pending inspections to sync.");
      } else {
        setStatus(`Ready to sync ${queue.length} inspection(s).`);
      }
    } catch (error) {
      console.error("Error loading queue:", error);
      setStatus("Error loading queue");
    }
  };

  useEffect(() => {
    refreshQueueCount();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(
        state.isConnected && state.isInternetReachable !== false,
      );
      setHasConnection(connected);

      if (!connected) {
        setNetworkMessage("❌ No network connection. Sync not available.");
      } else {
        setNetworkMessage("✅ Connection available. Ready to sync");
      }
    });

    return unsubscribe;
  }, []);

  const handleSync = async () => {
    if (!hasConnection) {
      setNetworkMessage("❌ No network connection. Sync not available.");
      return;
    }

    setIsSyncing(true);
    setSyncResult("");

    try {
      const backendReachable = await isOnline();

      if (!backendReachable) {
        setNetworkMessage(
          "❌ Connected to network, but server is not reachable.",
        );
        setSyncResult("Please try again in a moment.");
        return;
      }

      setStatus("🔄 Syncing pending inspections...");
      await syncPendingInspections();
      await refreshQueueCount();

      setStatus("✅ Sync complete!");
      setSyncResult("All pending inspections have been synced to the cloud.");
    } catch (error) {
      console.error("Sync error:", error);
      setStatus("❌ Sync failed");
      setSyncResult(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const syncButtonDisabled =
    isSyncing || queueCount === 0 || hasConnection !== true;

  const syncButtonColor =
    hasConnection === null ? "#999999" : hasConnection ? "#007AFF" : "#CCCCCC";

  const syncButtonLabel =
    hasConnection === null
      ? "Checking connection..."
      : isSyncing
        ? "Syncing..."
        : "Sync Now";

  return (
    <View style={{ padding: 24, gap: 12, height: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          width: "100%",
        }}
      >
        <Button title="Return to Jobs" onPress={() => router.push("/jobs")} />
        {networkMessage ? (
          <Text
            style={{ fontSize: 12, color: hasConnection ? "green" : "red" }}
          >
            {networkMessage}
          </Text>
        ) : null}
      </View>

      <ScrollView style={{ gap: 12, minHeight: "90%" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Sync Status</Text>

        <View
          style={{ backgroundColor: "#f0f0f0", padding: 12, borderRadius: 4 }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>{status}</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Pending Queue ({queueCount})
        </Text>

        {queueCount === 0 ? (
          <Text style={{ color: "#666" }}>No inspections waiting to sync.</Text>
        ) : (
          <>
            {queueItems.map((item) => (
              <View
                key={item.id}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  padding: 10,
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "500" }}>
                  Inspection: {item.entityId}
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Status: {item.status}
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Type: {item.entityType}
                </Text>
              </View>
            ))}

            <ButtonB
              onPress={handleSync}
              disabled={syncButtonDisabled}
              variant="filled"
              color={syncButtonColor}
            >
              {syncButtonLabel}
            </ButtonB>
          </>
        )}

        {syncResult && (
          <View
            style={{
              backgroundColor: syncResult.includes("Error")
                ? "#ffe0e0"
                : "#e0ffe0",
              padding: 12,
              borderRadius: 4,
              marginTop: 12,
            }}
          >
            <Text>{syncResult}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
