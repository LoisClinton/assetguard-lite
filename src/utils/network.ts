import { checkFirestoreAccess } from "@/src/services/firebase";

export async function isOnline() {
  try {
    const reachable = await checkFirestoreAccess();
    console.log("Firebase reachability:", reachable);
    return reachable;
  } catch (error) {
    console.log("Reachability check error:", error);
    return false;
  }
}
