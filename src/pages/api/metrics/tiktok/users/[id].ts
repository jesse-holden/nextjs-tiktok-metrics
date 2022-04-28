// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

import { getTikTokUserMetrics } from '@/lib/tiktok-api';

export default async function tiktokMetricsIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = String(req.query.id);

  if (!id || id === 'undefiend') {
    res.status(400).json({
      error: 'id is required',
    });
    return;
  }

  const data = await getTikTokUserMetrics(id);

  // wait 1500ms
  // await new Promise((resolve) => setTimeout(resolve, 1500));

  // Test user not found case
  if (id === 'fail' || !data) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Account does not exist',
      statusCode: 404,
    });
  }

  res.status(200).setHeader('Cache-Control', 's-maxage=30').json(data);
}
