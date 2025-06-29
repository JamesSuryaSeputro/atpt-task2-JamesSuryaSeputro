import { test as base } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { AirportApiClient } from '../src/api/clients/AirportApiClient';
import { IAirportApiClient } from '../src/api/interfaces/IAirportApiClient';

// Define shape of extended test fixture
type extendedFixtures = {
    // Override request to always have the auth token
    authenticatedRequest: APIRequestContext;
    airportApiClient: IAirportApiClient;
    tempAirportId: string;
};

export const test = base.extend<extendedFixtures>({
    // Provide APIRequestContext that is authenticated
    authenticatedRequest: async ({ playwright, baseURL }, use) => {
        const authToken = process.env.AUTH_TOKEN;
        if (!authToken) {
            throw new Error('AUTH_TOKEN is not set, ensure global setup is runs successfully');
        }

        // Create a new APIRequestContext instance with default configurations
        const authenticatedContext = await playwright.request.newContext({
            baseURL: baseURL,
            extraHTTPHeaders: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
        });

        // Provide authenticated context to tests
        await use(authenticatedContext);

        // After tests done use this fixture, dispose the context
        await authenticatedContext.dispose();
    },

    // Provide AirportApiClient instance
    airportApiClient: async ({ authenticatedRequest }, use) => {
        // Create an instance of AirportApiClient, injecting the authenticatedRequest
        const client = new AirportApiClient(authenticatedRequest);
        await use(client);
    },

    // Get id from airportApiClient
    tempAirportId: async ({ airportApiClient }, use) => {
    console.log('Fixture: tempAirportId - Getting an existing airport ID...');
    let airportIdToUse: string | undefined;

    try {
      const airports = await airportApiClient.getAirports();
      if (airports && airports.data && airports.data.length > 0) {
        airportIdToUse = airports.data[0].id;
        console.log(`Fixture: tempAirportId - Using existing airport ID: ${airportIdToUse}`);
      } else {
        throw new Error('No airports found in the /airports list to use for tempAirportId.');
      }
    } catch (error) {
      console.error('Fixture: tempAirportId - Error getting airport list:', error);
      throw error;
    }

    if (!airportIdToUse) {
        throw new Error('Failed to obtain a valid airport ID for tempAirportId fixture.');
    }

    await use(airportIdToUse);
  },
});

// Re-export expect from Playwright to be used alongside the extended test
export { expect } from '@playwright/test'