import authStack from '~/server/service/authStack';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const response = await authStack.post('/auth/password/reset/check-code', body);
    // Optionally log for debugging:
    console.log('AuthStack send-reset-code response:', response);
    return response;
  } catch (error) {
    // Optionally log for debugging:
    console.log('SendResetCode Error:', error);
    setResponseStatus(event, error.statusCode || 500);
    return {
      error: error.responseBody || { message: error.message },
      statusText: error.statusText,
      statusCode: error.statusCode
    };
  }
}); 