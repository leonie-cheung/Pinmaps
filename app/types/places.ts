export type PlaceResult = {
    place_id: string;
    name: string;
    vicinity?: string;
    rating?: number;
    user_ratings_total?: number;
    geometry?: {
        location: { lat: number; lng: number };
    };
};
