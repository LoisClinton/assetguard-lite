module.exports = {
  projects: [
    {
      displayName: "native",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["**/__tests__/**/*.native.test.ts"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testPathIgnorePatterns: ["/node_modules/"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: {
              jsx: "react-jsx",
              esModuleInterop: true,
            },
          },
        ],
      },
      transformIgnorePatterns: ["node_modules/(?!(expo-sqlite)/)"],
      moduleNameMapper: {
        "^.*/db/sqlite\\.native$": "<rootDir>/__mocks__/db/sqlite.native.js",
        "^expo-sqlite$": "<rootDir>/__mocks__/expo-sqlite.js",
        "^@/(.*)$": "<rootDir>/$1",
      },
    },
    {
      displayName: "web",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["**/__tests__/**/*.web.test.ts"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testPathIgnorePatterns: ["/node_modules/"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
  ],
};
