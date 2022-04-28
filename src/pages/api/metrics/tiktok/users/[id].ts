// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

export default async function tiktokMetricsIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id;
  // wait 500ms
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Test user not found case
  if (id === 'fail') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Account does not exist',
      statusCode: 404,
    });
  }

  res.status(200).json({
    user: id,
    count: 5,
  });
}
