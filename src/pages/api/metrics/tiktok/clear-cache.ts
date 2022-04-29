import Keyv from '@keyvhq/core';
import KeyvSQLite from '@keyvhq/sqlite';
import { NextApiRequest, NextApiResponse } from 'next';

const keyvSQLite = new Keyv({
  store: new KeyvSQLite('./database.sqlite'),
});

export default async function clearTikTokCache(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  await keyvSQLite.clear();
  return res.status(200).json({
    message: 'Cache cleared',
  });
}
