import { test, expect } from '../../fixtures/api';

test.describe('Airport & Favorite e2e', () => {

    test.beforeEach(async ({ airportApiClient }) => {
        console.log("Chained Workflow BeforeEach: Clearing favorites for a clean start.");
        try {
            await airportApiClient.clearAllFavorites();
            const remainingFavorites = await airportApiClient.getAllFavorites();
            expect(remainingFavorites.data).toEqual([]);
            console.log("Chained Workflow BeforeEach: Favorites successfully cleared.");
        } catch (error) {
            console.error("Chained Workflow BeforeEach: Error during favorite cleanup:", error);
            throw new Error(`Cleanup failed for chained workflow: ${error.message}`);
        }
    });

    test('should successfully get airport distance and manage a favorite', async ({ airportApiClient, tempAirportId }) => {

        // --- Step 1: Retrieve all airports and identify distance ---
        console.log('Workflow Step 1: Retrieving all airports...');
        const allAirportsResponse = await airportApiClient.getAirports();
        expect(allAirportsResponse).toHaveProperty('data');
        expect(Array.isArray(allAirportsResponse.data)).toBe(true);
        expect(allAirportsResponse.data.length).toBeGreaterThan(0);

        const fromAirport = allAirportsResponse.data.find((a: any) => a.attributes.iata === 'LAX') || allAirportsResponse.data[0];
        const toAirport = allAirportsResponse.data.find((a: any) => a.attributes.iata === 'JFK') || allAirportsResponse.data[1];

        expect(fromAirport).toBeDefined();
        expect(toAirport).toBeDefined();
        // Ensure we don't pick the same airport twice if the list has fewer than 2 airports or specific ones aren't found
        expect(fromAirport.attributes.iata).not.toEqual(toAirport.attributes.iata);

        console.log(`Workflow Step 1: Selected airports for distance: ${fromAirport.attributes.iata} and ${toAirport.attributes.iata}.`);

        // --- Step 2: Calculate the distance between the two selected airports ---
        console.log(`Workflow Step 2: Calculating distance between ${fromAirport.attributes.iata} and ${toAirport.attributes.iata}...`);
        const distanceResponse = await airportApiClient.getAirportDistance(fromAirport.attributes.iata, toAirport.attributes.iata);
        expect(distanceResponse).toHaveProperty('data');
        expect(distanceResponse.data.attributes).toHaveProperty('miles');
        expect(typeof distanceResponse.data.attributes.miles).toBe('number');
        expect(distanceResponse.data.attributes.miles).toBeGreaterThan(0);
        console.log(`Workflow Step 2: Distance calculated: ${distanceResponse.data.attributes.miles} miles.`);

        // --- Step 3: Add one of the airports to favorites ---
        console.log(`Workflow Step 3: Adding airport ${tempAirportId} to favorites...`);
        const addFavoriteResponse = await airportApiClient.addFavorite(tempAirportId);
        expect(addFavoriteResponse).toHaveProperty('data');
        expect(addFavoriteResponse.data).toHaveProperty('id');
        expect(addFavoriteResponse.data.attributes.airport.iata).toEqual(tempAirportId);
        const favoriteId = addFavoriteResponse.data.id; // Store the favoriteId for subsequent steps
        console.log(`Workflow Step 3: Airport ${tempAirportId} favorited. Favorite ID: ${favoriteId}.`);

        // --- Step 4: Retrieve the newly added favorite by its ID to verify ---
        console.log(`Workflow Step 4: Retrieving favorite with ID ${favoriteId} to verify...`);
        const retrievedFavorite = await airportApiClient.getFavoriteById(favoriteId);
        expect(retrievedFavorite).toHaveProperty('data');
        expect(retrievedFavorite.data).toHaveProperty('id', favoriteId);
        expect(retrievedFavorite.data.attributes.airport.iata).toEqual(tempAirportId);
        console.log(`Workflow Step 4: Favorite ID ${favoriteId} successfully retrieved.`);

        // --- Step 5: Delete the favorite for cleanup within the test ---
        console.log(`Workflow Step 5: Deleting favorite with ID ${favoriteId} for immediate cleanup...`);
        await airportApiClient.deleteFavorite(favoriteId);
        await expect(async () => {
            await airportApiClient.getFavoriteById(favoriteId);
        }).rejects.toThrow(/Failed to get favorite.*404/);
        console.log(`Workflow Step 5: Favorite ID ${favoriteId} successfully deleted.`);

        console.log('--- Chained Workflow Test Completed Successfully ---');
    })
});