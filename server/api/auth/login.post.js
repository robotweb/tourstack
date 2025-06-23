import authStack from '~/server/service/authStack';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const response = await authStack.post('/auth/password/sign-in', body);
    // Optionally log for debugging:
    // console.log('AuthStack sign-in response:', response);
    return response;
  } catch (error) {
    // Optionally log for debugging:
    // console.log('SignIn Error:', error);
    setResponseStatus(event, error.statusCode || 500);
    return {
      error: error.responseBody || { message: error.message },
      statusText: error.statusText,
      statusCode: error.statusCode
    };
  }
}); 