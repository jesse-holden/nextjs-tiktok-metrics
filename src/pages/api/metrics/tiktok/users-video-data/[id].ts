import { NextApiRequest, NextApiResponse } from 'next';

import {
  INTERNAL_ERROR_JSON,
  NOT_FOUND_JSON,
  VERIFICATION_ERROR_JSON,
} from '@/lib/errors';
import { getTikTokUserCompleteVideoMetrics } from '@/lib/tiktok-api';

export default async function tiktokMetricsIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = String(req.query.id);

  if (!id) {
    return res.status(404).json(NOT_FOUND_JSON);
  }

  try {
    const data = await getTikTokUserCompleteVideoMetrics(id);

    // User not found case
    if (!data) {
      return res.status(404).json(NOT_FOUND_JSON);
    }

    res.status(200).setHeader('Cache-Control', 's-maxage=30').json(data);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === 'Verification page detected. Please try again later.'
    ) {
      return res.status(404).json(VERIFICATION_ERROR_JSON);
    } else {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json(INTERNAL_ERROR_JSON);
    }
  }
}
