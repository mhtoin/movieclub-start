import { db } from "@/db/db";
import { movie } from "@/db/schema/movies";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, isNotNull } from "drizzle-orm";

type Movie = typeof movie.$inferSelect;

export const getLatestMovies = createServerFn({ method: "GET" }).handler(
  async (): Promise<Movie | null> => {
    try {
      const rows = await db.select().from(movie).where(isNotNull(movie.watchDate)).orderBy(desc(movie.watchDate)).limit(1);
      return rows[0] ?? null;
    } catch (error) {
      console.error("Error fetching latest movie:", error);
      return null;
    }
  }
);

export const movieQueries = {
    all: () => ['movies'],
    latest: () => queryOptions({
        queryKey: [...movieQueries.all(), 'latest'],
        queryFn: getLatestMovies,
    }),
}
