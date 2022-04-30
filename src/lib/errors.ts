export type SafeErrorResponse = {
  error: string;
  message: string;
  statusCode: number;
};

export const NOT_FOUND_JSON: SafeErrorResponse = {
  error: 'Not Found',
  message: 'Account does not exist',
  statusCode: 404,
};

export const VERIFICATION_ERROR_JSON: SafeErrorResponse = {
  error: 'Verification Error',
  message: 'Verification page detected. Please try again later.',
  statusCode: 500,
};

export const INTERNAL_ERROR_JSON: SafeErrorResponse = {
  error: 'Internal Error',
  message: 'An internal error occurred',
  statusCode: 500,
};
