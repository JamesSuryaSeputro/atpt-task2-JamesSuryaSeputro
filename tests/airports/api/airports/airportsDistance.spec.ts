import { test, expect } from '../../../../fixtures/api';

test.describe('POST Airport Distance', () => {

    // Positive cases
    // Get airport distance
    test('should successfully calculate distance between two valid airports', async ({ airportApiClient }) => {
        const fromIata = 'GKA';
        const toIata = 'MAG';

        const distanceResponse = await airportApiClient.getAirportDistance(fromIata, toIata);

        expect(distanceResponse).toHaveProperty('data');
        expect(distanceResponse.data).toHaveProperty('id');
        expect(distanceResponse.data).toHaveProperty('type', 'airport_distance');
        expect(distanceResponse.data.attributes).toHaveProperty('kilometers');
        expect(distanceResponse.data.attributes.kilometers).toBeGreaterThan(0);
        expect(distanceResponse.data.attributes).toHaveProperty('miles');
        expect(distanceResponse.data.attributes.miles).toBeGreaterThan(0);
    });

    // Negative cases
    // Get airport distance with invalid IATA codes
    test('should return an error for invalid IATA codes', async ({ airportApiClient }) => {
        const fromIata = 'INVALID';
        const toIata = 'JFK';

        await expect(async () => {
            await airportApiClient.getAirportDistance(fromIata, toIata);
        }).rejects.toThrow(/Failed to get distance.*422/);
    });

});
