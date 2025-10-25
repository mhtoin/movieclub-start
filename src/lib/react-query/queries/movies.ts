import { db } from "@/db/db";
import { movie, type MovieWithUser } from "@/db/schema/movies";
import { user } from "@/db/schema/users";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { desc, eq, isNotNull, like } from "drizzle-orm";
import { z } from "zod";

export const getLatestMovies = createServerFn({ method: "GET" }).handler(
  async (): Promise<MovieWithUser | null> => {
    try {
      const rows = await db
        .select()
        .from(movie)
        .innerJoin(user, eq(user.id, movie.userId))
        .where(isNotNull(movie.watchDate))
        .orderBy(desc(movie.watchDate))
        .limit(1);
      
      if (rows.length === 0) return null;

      const movieData = rows[0].movie;

      if (!movieData) return null;
      
      return {
        movie: movieData,
        user: rows[0].user,
      };
    } catch (error) {
      console.error("Error fetching latest movie:", error);
      return null;
    }
  }
);



const watchedByMonthSchema = z.object({
  search: z.string().optional(),
});

export const getWatchedMoviesByMonth = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof watchedByMonthSchema>) => data)
  .handler(async ({ data }) => {
    const { search } = data;

    if (search && search.trim() !== '') {
      // Fetch movies matching the search query
      const movies = await db.select()
        .from(movie)
        .innerJoin(user, eq(user.id, movie.userId))
        .where(
          isNotNull(movie.watchDate) &&
          like(movie.title, `%${search.trim()}%`)
        )
        .orderBy(desc(movie.watchDate));
        
      return Object.groupBy(movies, (item) => {
        const watchDate = item.movie.watchDate;
        if (!watchDate) return 'Unknown';
        const date = new Date(watchDate);
        return format(date, 'yyyy-MM');
      });
    }
    

    // Fetch movies for the current month
    const movies = await db.select()
      .from(movie)
      .innerJoin(user, eq(user.id, movie.userId))
      .where(isNotNull(movie.watchDate))
      .orderBy(desc(movie.watchDate));

    
    return Object.groupBy(movies, (item) => {
      const watchDate = item.movie.watchDate;
      if (!watchDate) return 'Unknown';
      const date = new Date(watchDate);
      return format(date, 'yyyy-MM');
    });
  });


    export const movieQueries = {
    all: () => ['movies'],
    latest: () => queryOptions({
        queryKey: [...movieQueries.all(), 'latest'],
        queryFn: getLatestMovies,
    }),
    watched: (search?: string) => queryOptions({
        queryKey: [...movieQueries.all(), 'watched', search],
        queryFn: async () => {
            const result = await getWatchedMoviesByMonth({ data: { search } });
            return result;
        },
    }),
    /* For now, we use simple query instead of infinite query
    watched: (search?: string) => infiniteQueryOptions({
        queryKey: [...movieQueries.all(), 'watched', search],
        queryFn: async ({ pageParam }) => {
            const result = await getWatchedMoviesByMonth({ data: { month: pageParam, search } });
            return result;
        },
        initialPageParam: new Date().toISOString().slice(0,7),
        getNextPageParam: (lastPage) => {
            return lastPage.nextMonth ?? undefined;
        },
    }),*/
}
