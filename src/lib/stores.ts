import Keyv from '@keyvhq/core';

const keyvSQLite = new Keyv();

// Caching strategy for TikTok requests
const cacheStore = keyvSQLite;
export default cacheStore;
