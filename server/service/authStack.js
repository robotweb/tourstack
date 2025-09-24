import fetch from 'node-fetch';
class AuthStackService {
  getConfig() {
    return {
      STACK_API_URL: process.env.NEXT_PUBLIC_STACK_API_URL,
      STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
    };
  }

  async request(endpoint, method = 'GET', body = null, moreHeaders = null) {

    const {
      STACK_API_URL,
      STACK_PROJECT_ID,
      STACK_PUBLISHABLE_CLIENT_KEY,
      STACK_SECRET_SERVER_KEY
    } = this.getConfig();
    if (!STACK_API_URL || !STACK_PROJECT_ID || !STACK_PUBLISHABLE_CLIENT_KEY) {
      const missing = [
        !STACK_API_URL && 'STACK_API_URL',
        !STACK_PROJECT_ID && 'STACK_PROJECT_ID',
        !STACK_PUBLISHABLE_CLIENT_KEY && 'STACK_PUBLISHABLE_CLIENT_KEY'
      ].filter(Boolean).join(', ');
      const error = new Error(`AuthStack config missing: ${missing}`);
      error.statusCode = 500;
      throw error;
    }
    const url = `${STACK_API_URL}/api/v1${endpoint}`;
    // Optionally: console.log('AuthStack URL:', STACK_API_URL, 'Endpoint:', endpoint, 'Full URL:', url);

    console.log(url)
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'tourstack-server/1.0',
      'X-Stack-Access-Type': 'client',
      'X-Stack-Project-Id': STACK_PROJECT_ID,
      'X-Stack-Publishable-Client-Key': STACK_PUBLISHABLE_CLIENT_KEY,
      // Do NOT send secret by default for client requests. Allow override via moreHeaders when needed server-side.
      // 'X-Stack-Secret-Server-Key': STACK_SECRET_SERVER_KEY,
      ...moreHeaders
    };
    const options = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
      // Let fetch set Content-Length automatically
    }
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) {
        // Try to get response body for more details
        const errorText = await response.text();
        let errorDetails = {};
        try {
          if (errorText) {
            errorDetails = JSON.parse(errorText);
            if (errorDetails.error && typeof errorDetails.error === 'string') {
              errorDetails.error = errorDetails.error
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\\\/g, '\\');
            }
          }
        } catch (parseError) {
          errorDetails = { message: errorText };
        }
        const error = new Error(errorDetails.error || errorDetails.message || response.statusText);
        error.statusText = response.statusText;
        error.statusCode = response.status;
        error.responseBody = errorDetails;
        throw error;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // Optionally: console.log('Fetch Error:', error);
      console.log(error)
      throw error;
    }
  }

  async get(endpoint, headers = null) {
    return this.request(endpoint, 'GET', null, headers);
  }

  async post(endpoint, body, headers = null) {
    return this.request(endpoint, 'POST', body, headers);
  }

  async put(endpoint, body, headers = null) {
    return this.request(endpoint, 'PUT', body, headers);
  }

  async delete(endpoint, headers = null) {
    return this.request(endpoint, 'DELETE', null, headers);
  }
}

export default new AuthStackService(); 