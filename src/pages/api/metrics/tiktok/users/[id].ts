// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

import { getTikTokUserMetrics } from '@/lib/tiktok-api';

const NOT_FOUND_JSON = {
  error: 'Not Found',
  message: 'Account does not exist',
  statusCode: 404,
};

const VERIFICATION_ERROR_JSON = {
  error: 'Verification Error',
  message: 'Verification page detected',
  statusCode: 500,
};

export default async function tiktokMetricsIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = String(req.query.id);

  if (!id || id === 'undefiend') {
    return res.status(400).json({
      error: 'id is required',
    });
  }

  if (id === 'fail') {
    return res.status(404).json(NOT_FOUND_JSON);
  }

  try {
    const data = await getTikTokUserMetrics(id);

    // Test user not found case
    if (!data) {
      return res.status(404).json(NOT_FOUND_JSON);
    }

    res.status(200).setHeader('Cache-Control', 's-maxage=30').json(data);
  } catch (err) {
    if (err instanceof Error && err.message === 'Verification page detected') {
      return res.status(404).json(VERIFICATION_ERROR_JSON);
    } else {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  }
}
