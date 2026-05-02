// Jest setup for web tests
// jsdom already provides localStorage, but this ensures it's available
if (typeof localStorage === "undefined") {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}
