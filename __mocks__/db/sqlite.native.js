// Mock for sqlite.native (used for native testing)
let jobsTable = [];

const mockDb = {
  execAsync: jest.fn(async (sql) => {
    if (sql.includes("DROP TABLE")) {
      jobsTable = [];
    } else if (sql.includes("CREATE TABLE")) {
      // Table created
    }
  }),

  getAllAsync: jest.fn(async (sql, ...params) => {
    if (sql.includes("COUNT")) {
      return [{ count: jobsTable.length }];
    } else if (sql.includes("SELECT * FROM jobs WHERE id")) {
      const id = params[0];
      return jobsTable.filter((job) => job.id === id);
    } else {
      return jobsTable.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
    }
  }),

  runAsync: jest.fn(async (sql, ...params) => {
    if (sql.includes("INSERT")) {
      jobsTable.push({
        id: params[0],
        siteName: params[1],
        assetName: params[2],
        dueDate: params[3],
        status: params[4],
      });
    }
  }),
};

module.exports = {
  dbPromise: Promise.resolve(mockDb),
};
