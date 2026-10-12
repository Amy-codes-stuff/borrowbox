const DATA_MODES = Object.freeze({
  MONGODB: 'mongodb',
  MOCK: 'mock',
});

let dataMode = DATA_MODES.MOCK;

const getDataMode = () => dataMode;
const isMockStoreMode = () => dataMode === DATA_MODES.MOCK;
const useMongoDB = () => dataMode === DATA_MODES.MONGODB;
const enableMockStore = () => {
  dataMode = DATA_MODES.MOCK;
};
const enableMongoDB = () => {
  dataMode = DATA_MODES.MONGODB;
};

module.exports = {
  DATA_MODES,
  getDataMode,
  isMockStoreMode,
  useMongoDB,
  enableMockStore,
  enableMongoDB,
};
