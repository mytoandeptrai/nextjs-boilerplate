import { createApiErrorResponse, getApiErrorMessage, getApiErrorStatus } from '../api-error';

describe('api-error', () => {
  it('reads a valid HTTP status and falls back to 500', () => {
    expect(getApiErrorStatus({ status: 404 })).toBe(404);
    expect(getApiErrorStatus({ code: 422 })).toBe(422);
    expect(getApiErrorStatus({ status: 200 })).toBe(500);
    expect(getApiErrorStatus(null)).toBe(500);
  });

  it('reads the message with a fallback', () => {
    expect(getApiErrorMessage({ message: 'boom' })).toBe('boom');
    expect(getApiErrorMessage('plain')).toBe('plain');
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback');
  });

  it('builds the Route Handler error response', async () => {
    const response = createApiErrorResponse({ status: 401, message: 'nope' });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: 'nope' });
  });
});
