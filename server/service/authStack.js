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
    const url = `${STACK_API_URL}/api/v1${endpoint}`;
    // Optionally: console.log('AuthStack URL:', STACK_API_URL, 'Endpoint:', endpoint, 'Full URL:', url);
    const headers = {
      'Content-Type': 'application/json',
      'X-Stack-Access-Type': 'client',
      'X-Stack-Project-Id': STACK_PROJECT_ID,
      'X-Stack-Publishable-Client-Key': STACK_PUBLISHABLE_CLIENT_KEY,
      'X-Stack-Secret-Server-Key': STACK_SECRET_SERVER_KEY,
      ...moreHeaders
    };
    const options = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
      headers['Content-Length'] = Buffer.byteLength(options.body).toString();
    }
    
    try {
      const response = await fetch(url, options);
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