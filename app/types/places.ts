export type PlaceResult = {
    place_id: string;
    name: string;
    vicinity?: string;
    user_ratings_total?: number;
    geometry?: {
        location: {
            lat: number;
            lng: number;
        };
    };
};
