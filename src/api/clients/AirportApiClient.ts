import type { APIRequestContext } from '@playwright/test';
import { IAirportApiClient } from '../interfaces/IAirportApiClient';

export class AirportApiClient implements IAirportApiClient {
    private requestContext: APIRequestContext;

    constructor(requestContext: APIRequestContext) {
        this.requestContext = requestContext;
    }

    async getAirports(): Promise<any> {
        const response = await this.requestContext.get(`/api/airports`);
        if (response.status() !== 200) {
            const errorBody = await response.json();
            throw new Error(`Failed to get airport: ${response.status} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }


    async getAirportById(id: string): Promise<any> {
        const response = await this.requestContext.get(`/api/airports/${id}`);
        console.log(`Response status: ${response.status(), "Response body: ", response.body()}`);
        if (response.status() !== 200) {
            const errorBody = await response.json();
            throw new Error(`Failed to get airport ${id}: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }

    async getAirportDistance(fromIata: string, toIata: string): Promise<any> {
        const response = await this.requestContext.post(`/api/airports/distance`, {
            data: {
                from: fromIata,
                to: toIata,
            },
        });
        console.log(response.status(), response.body());
        if (response.status() !== 200) {
            const errorBody = await response.json();
            throw new Error(`Failed to get distance from ${fromIata} to ${toIata}: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }

    // --- Favorites Endpoints ---
    async getAllFavorites(): Promise<any> {
        const response = await this.requestContext.get(`/api/favorites`);
        if (response.status() !== 200) {
            const errorBody = await response.json();
            throw new Error(`Failed to get all favorites: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }

    async getFavoriteById(id: string): Promise<any> {
        const response = await this.requestContext.get(`/api/favorites/${id}`);
        if (response.status() !== 200) {
            const errorBody = await response.json();
            throw new Error(`Failed to get favorite ${id}: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }

    async addFavorite(airportId: string): Promise<any> {
        const response = await this.requestContext.post(`/api/favorites`, {
            data: {
                airport_id: airportId,
            },
        });
        if (response.status() !== 201) {
            const errorBody = await response.json();
            throw new Error(`Failed to add favorite for airport ID ${airportId}: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }

    async updateFavorite(id: string, newNote: string): Promise<any> {
        const response = await this.requestContext.patch(`/api/favorites/${id}`, {
            data: {
                note: newNote,
            },
        });
        if (response.status() !== 200) {
            const errorBody = await response.json();
            throw new Error(`Failed to update favorite ${id}: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
        return response.json();
    }

    async deleteFavorite(id: string): Promise<void> {
        const response = await this.requestContext.delete(`/api/favorites/${id}`);
        if (response.status() !== 204) {
            const errorBody = await response.json();
            throw new Error(`Failed to delete favorite ${id}: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
    }

    async clearAllFavorites(): Promise<void> {
        const response = await this.requestContext.delete(`/api/favorites/clear_all`);
        if (response.status() !== 204) {
            const errorBody = await response.json();
            throw new Error(`Failed to clear all favorites: ${response.status()} - ${JSON.stringify(errorBody)}`);
        }
    }
}
