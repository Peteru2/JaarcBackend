export const Messages = {
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_FAILED: 'The submitted data is invalid.',
  ROUTE_NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'Authentication is required to access this resource.',
  INVALID_TOKEN: 'The provided authentication token is invalid or expired.',
  INVALID_CREDENTIALS: 'The email or password provided is incorrect.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const;