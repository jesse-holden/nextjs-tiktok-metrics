import { NextApiRequest, NextApiResponse } from 'next';

import cacheStore from '@/lib/stores';

export default async function clearTikTokCache(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  await cacheStore.clear();
  return res.status(200).json({
    message: 'Cache cleared',
  });
}
