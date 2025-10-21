import { defineEventHandler, readBody, setCookie } from 'h3'
import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name, verification_callback_url } = body
  const config = useRuntimeConfig()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Get protocol (default to https in production, http in dev)
  const protocol = event.node.req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const host = event.node.req.headers.host;
  const defaultCallbackUrl = `${protocol}://${host}/handler/email-verification`;

  // Prepare StackAuth API request
  const apiUrl = config.public.stackApiUrl
  const payload = {
    email,
    password,
    verification_callback_url: verification_callback_url ?? defaultCallbackUrl,
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Stack-Access-Type': 'client',
    'X-Stack-Project-Id': config.public.stackProjectId,
    'X-Stack-Publishable-Client-Key': config.public.stackPublishableClientKey,
  }
  
  try {
    console.log('🔑 Server: Attempting StackAuth sign-up')
    console.log('🔑 Server: API URL:', apiUrl)
    console.log('🔑 Server: Project ID:', config.public.stackProjectId)
    console.log('🔑 Server: Payload:', payload)
    console.log('🔑 Server: Headers:', headers)
    
    const response = await $fetch<{ access_token: string; refresh_token: string; user_id: string }>(`${apiUrl}/api/v1/auth/password/sign-up`, {
      method: 'POST',
      body: payload,
      headers: headers,
    })

    console.log('✅ StackAuth sign-up response:', {
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      hasUserId: !!response.user_id,
      responseKeys: Object.keys(response),
      fullResponse: response
    })

    if (!response.access_token) {
      return { error: 'Authentication failed: No token returned' }
    }

    // set jwt and refresh token in cookies
    setCookie(event, 'access_token', response.access_token)
    setCookie(event, 'refresh_token', response.refresh_token)
    
    // Store the new user's ID and name in the local 'user' table if user_id exists
    if (response && response.user_id) {
      const newUser = {
        authid: response.user_id,
        email: email,
        firstname: name
      };
      const createdUser = await prisma.user.create({ data: newUser });
      
      // Create a new team for the user
      const newTeam = await prisma.team.create({
        data: {
          name: `${name || 'User'}'s Team`
        }
      });
      
      // Link the user to the new team
      await prisma.teamUser.create({
        data: {
          userId: createdUser.id,
          teamId: newTeam.id,
          role: 'owner'
        }
      });
      
      console.log('✅ Created team and linked user:', {
        userId: createdUser.id,
        teamId: newTeam.id,
        teamUid: newTeam.uid
      });
    }

    return { access_token: response.access_token, refresh_token: response.refresh_token, user_id: response.user_id }
  } catch (err: any) {
    console.error('❌ StackAuth sign-up failed:', {
      message: err instanceof Error ? err.message : String(err),
      status: err?.status,
      statusCode: err?.statusCode,
      statusText: err?.statusText,
      data: err?.data,
      response: err?.response,
      url: err?.url,
      stack: err?.stack
    })
    return { error: 'Invalid credentials' }
  }
}) 