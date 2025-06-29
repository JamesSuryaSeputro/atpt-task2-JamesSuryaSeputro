import { request, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Explicitly specify the path to your .env file relative to the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function globalSetup() {
    console.log('Running global setup: Obtaining token...');

    const reqcontext = await request.newContext({
        //Add base url in case globalSetup runs standalone
        baseURL: process.env.API_BASE_URL || 'https://airportgap.com',
    });
    
    const response = await reqcontext.post(`/api/tokens`, {
        data: {
            email: process.env.API_USER_EMAIL,
            password: process.env.API_USER_PASSWORD,
        },
    });

    // console.log(`Token request status: ${response.status()}`);
    // console.log(`Token request URL: ${response.url()}`);


    const responseBody = await response.json();
    console.log('Token response body:', responseBody);

    expect(response.status(), `Expected status 200 for token generation, got ${response.status()}`).toBe(200);
    expect(responseBody).toHaveProperty('token');

    process.env.AUTH_TOKEN = responseBody.token;
    console.log('Auth token set');

    await reqcontext.dispose();
}

export default globalSetup;