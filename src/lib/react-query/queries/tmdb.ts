import { getFilters } from "@/lib/tmdb-api";

export const tmdbQueries = {
    genres: () => ({
        queryKey: ['tmdb', 'genres'],
        queryFn: getFilters,
    }),
}