import { test, expect } from '../../../fixtures/api';

test.describe.serial('Favorites API Operations', () => {
    test.beforeEach(async ({ airportApiClient }) => {
        // Clear all favorites before each test
        try {
            await airportApiClient.clearAllFavorites();
            const remainingFavorites = await airportApiClient.getAllFavorites();
            expect(remainingFavorites.data).toEqual([]);
            console.log("BeforeEach: Favorites successfully cleared and verified.");
        } catch (error) {
            console.error("BeforeEach: CRITICAL ERROR - Failed to clear all favorites.", error);
            throw new Error(`Failed to clear favorites: ${error.message}`);
        }
    });

    // Positive cases
    // Add new favorite airport
    test('should add a new favorite airport', async ({ airportApiClient, tempAirportId }) => {
        const airportToAdd = tempAirportId;
        const addResponse = await airportApiClient.addFavorite(airportToAdd);

        console.log('airportToAdd:', addResponse.data);

        expect(addResponse).toHaveProperty('data');
        expect(addResponse.data).toHaveProperty('id');
        expect(addResponse.data).toHaveProperty('type', 'favorite');
        expect(addResponse.data.attributes.airport.iata).toEqual(tempAirportId);
        expect(addResponse.data.attributes).toHaveProperty('note', null);
    });

    // Retrieve all favorite airports
    test('should retrieve all favorite airports', async ({ airportApiClient, tempAirportId }) => {
        await airportApiClient.addFavorite(tempAirportId);

        const allFavorites = await airportApiClient.getAllFavorites();

        expect(allFavorites).toHaveProperty('data');
        expect(Array.isArray(allFavorites.data)).toBe(true);
        expect(allFavorites.data.length).toBeGreaterThanOrEqual(1); 

        const favorite = allFavorites.data.find(fav => fav.attributes.airport.iata === tempAirportId);
        expect(favorite).toBeDefined();
        expect(favorite).toHaveProperty('type', 'favorite');
    });

    // Retrieve favorite airports by ID
    test('should retrieve favorite airports by ID', async ({ airportApiClient, tempAirportId }) => {
        const addResponse = await airportApiClient.addFavorite(tempAirportId);
        const favoriteId = addResponse.data.id; 

        const retrievedFavorite = await airportApiClient.getFavoriteById(favoriteId);

        expect(retrievedFavorite).toHaveProperty('data');
        expect(retrievedFavorite.data).toHaveProperty('id', favoriteId);
        expect(retrievedFavorite.data).toHaveProperty('type', 'favorite');
        expect(retrievedFavorite.data.attributes.airport.iata).toEqual(tempAirportId);
    });


    // Update existing favorite airport
    test('should update an existing favorite airport with a note', async ({ airportApiClient, tempAirportId }) => {
        const addResponse = await airportApiClient.addFavorite(tempAirportId);
        const favoriteId = addResponse.data.id;
        const newNote = 'My favorite airport for sunny weather!';

        const updateResponse = await airportApiClient.updateFavorite(favoriteId, newNote);

        expect(updateResponse).toHaveProperty('data');
        expect(updateResponse.data).toHaveProperty('id', favoriteId);
        expect(updateResponse.data.attributes).toHaveProperty('note', newNote);
    });

    // Delete favorite airport
    test('should delete a favorite airport by ID', async ({ airportApiClient, tempAirportId }) => {
        const addResponse = await airportApiClient.addFavorite(tempAirportId);
        const favoriteId = addResponse.data.id;

        await airportApiClient.deleteFavorite(favoriteId);

        await expect(async () => {
            await airportApiClient.getFavoriteById(favoriteId);
        }).rejects.toThrow(/Failed to get favorite.*404/);
    });

    // Clear all favorite airports
    test('should clear all favorite airports', async ({ airportApiClient, tempAirportId }) => {
        await airportApiClient.addFavorite(tempAirportId);

        await airportApiClient.clearAllFavorites();

        const remainingFavorites = await airportApiClient.getAllFavorites();
        expect(remainingFavorites.data).toEqual([]);
    });

    // Negative cases
    // Get favorite by non-existent ID
    test('should return 404 when getting non-existent favorite ID', async ({ airportApiClient }) => {
        const nonExistentId = '002002002';
        await expect(async () => {
            await airportApiClient.getFavoriteById(nonExistentId);
        }).rejects.toThrow(/Failed to get favorite.*404/);
    });

    // Update favorite by non-existent ID
    test('should return 404 when updating non-existent favorite ID', async ({ airportApiClient }) => {
        const nonExistentId = '002002002';
        const newNote = 'Attempting to update non-existent';
        await expect(async () => {
            await airportApiClient.updateFavorite(nonExistentId, newNote);
        }).rejects.toThrow(/Failed to update favorite.*404/);
    });

    // Delete favorite by non-existent ID
    test('should return 404 when deleting non-existent favorite ID', async ({ airportApiClient }) => {
        const nonExistentId = '002002002';
        await expect(async () => {
            await airportApiClient.deleteFavorite(nonExistentId);
        }).rejects.toThrow(/Failed to delete favorite.*404/);
    });

        test.afterEach(async ({ airportApiClient }) => {
            await airportApiClient.clearAllFavorites();
    });
});