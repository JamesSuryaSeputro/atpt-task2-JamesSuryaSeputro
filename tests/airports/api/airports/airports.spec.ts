import { expect, test } from '../../../../fixtures/api';

test.describe('GET Aiports API', () => {

    // Positive cases
    // Get list of all airports
    test('should retrieve list of airports', async ({ airportApiClient }) => {

        const responseBody = await airportApiClient.getAirports();

        expect(responseBody).toHaveProperty('data');
        expect(responseBody.data).toBeInstanceOf(Array);
        expect(responseBody.data.length).toBeGreaterThan(0);
        expect(responseBody.data[0]).toHaveProperty('id');
        expect(responseBody.data[0]).toHaveProperty('type', 'airport');
        expect(responseBody.data[0].attributes).toHaveProperty('name');
    });

    // Get airport by ID
    test('should successfully retrieve an airport by a valid ID', async ({ airportApiClient, tempAirportId }) => {
        const airportId = tempAirportId;
        console.log(`Test: Get airport with ID: ${airportId}`);

        const responseBody = await airportApiClient.getAirportById(airportId);

        expect(responseBody).toHaveProperty('data');
        expect(responseBody.data).toHaveProperty('id', airportId);
        expect(responseBody.data.attributes).toHaveProperty('name');
    });

    // Negative cases
    // Get airport by non-existent ID
    test('should handle non-existent airport ID correctly', async ({ airportApiClient }) => {
        const nonExistentId = '001001001';

        await expect(async () => {
            await airportApiClient.getAirportById(nonExistentId);
        }).rejects.toThrow(/Failed to get airport.*404/);
    });

});


