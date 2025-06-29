export interface IAirportApiClient {
    getAirports: () => Promise<any>;
    getAirportById: (id: string) => Promise<any>;
    getAirportDistance:(fromIata: string, toIata: string) => Promise<any>;
    getAllFavorites(): Promise<any>;
    getFavoriteById(id: string): Promise<any>;
    addFavorite(airportId: string): Promise<any>;
    updateFavorite(id: string, newNote: string): Promise<any>;
    deleteFavorite(id: string): Promise<void>;
    clearAllFavorites(): Promise<void>;
}