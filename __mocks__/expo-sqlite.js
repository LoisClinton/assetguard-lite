// Mock for expo-sqlite
const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
};
