export default {
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'jest-environment-node' // Specifies the test environment to be Node.js. By default, Jest uses a browser-like jsdom environment.
};