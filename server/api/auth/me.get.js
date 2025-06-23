import authStack from '~/server/service/authStack';

export default defineEventHandler(async (event) => {
  try {
    // Try to get the access token from headers
    const headers = getRequestHeaders(event);
    let accessToken = headers['x-stack-access-token'];
    // Also support Authorization: Bearer ...
    if (!accessToken && headers['authorization']) {
      const match = headers['authorization'].match(/^Bearer (.+)$/i);
      if (match) accessToken = match[1];
    }
    if (!accessToken) {
      setResponseStatus(event, 401);
      return { error: { message: 'Missing access token' }, statusText: 'Unauthorized', statusCode: 401 };
    }
    // Call AuthStack /users/me
    const response = await authStack.get('/users/me', {
      'X-Stack-Access-Token': accessToken
    });
    return response;
  } catch (error) {
    setResponseStatus(event, error.statusCode || 500);
    return {
      error: error.responseBody || { message: error.message },
      statusText: error.statusText,
      statusCode: error.statusCode
    };
  }
}); 