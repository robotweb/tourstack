import authStack from '~/server/service/authStack';
import { knex } from '~/server/db/knex';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password, name, verification_callback_url } = body;

    // Get protocol (default to https in production, http in dev)
    const protocol = event.node.req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = event.node.req.headers.host;
    const defaultCallbackUrl = `${protocol}://${host}/handler/email-verification`;

    const authStackPayload = {
      email,
      password,
      verification_callback_url: verification_callback_url ?? defaultCallbackUrl,
    };
    console.log(authStackPayload)
    // Create the user in AuthStack
    const authStackUser = await authStack.post('/auth/password/sign-up', authStackPayload);
    // Store the new user's ID and name in the local 'user' table if user_id exists
    if (authStackUser && authStackUser.user_id) {
      const newUser = {
        authid: authStackUser.user_id,
        name: name
      };
      await knex('user').insert(newUser);
    }
    // Return the full response from AuthStack to the client
    return authStackUser;
  } catch (error) {
    setResponseStatus(event, error.statusCode || 500);
    return {
      error: error.responseBody || { message: error.message },
      statusText: error.statusText,
      statusCode: error.statusCode
    };
  }
}); 