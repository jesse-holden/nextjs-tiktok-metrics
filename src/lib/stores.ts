import Keyv from '@keyvhq/core';
import KeyvSQLite from '@keyvhq/sqlite';

const keyvSQLite = new Keyv({
  store: new KeyvSQLite('./database.sqlite'),
});

// Caching strategy for TikTok requests
const cacheStore = keyvSQLite;
export default cacheStore;
