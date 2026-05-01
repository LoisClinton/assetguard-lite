import * as SQLite from "expo-sqlite";

export const dbPromise = SQLite.openDatabaseAsync("assetguard-v2.db");
