import { db } from "@/db/db";
import { movie, review, type MovieWithUserAndReviews, type Review } from "@/db/schema/movies";
import { user } from "@/db/schema/users";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, inArray, isNotNull } from "drizzle-orm";

export const getLatestMovies = createServerFn({ method: "GET" }).handler(
  async (): Promise<MovieWithUserAndReviews | null> => {
    try {
      const rows = await db
        .select()
        .from(movie)
        .leftJoin(user, eq(user.id, movie.userId))
        .where(isNotNull(movie.watchDate))
        .orderBy(desc(movie.watchDate))
        .limit(1);
      
      if (rows.length === 0) return null;
      
      const movieData = rows[0].Movie;
      
      // Fetch reviews for this movie
      const reviews = await db
        .select()
        .from(review)
        .where(eq(review.movieId, movieData.id));
      
      return {
        ...movieData,
        user: rows[0].User,
        reviews,
      };
    } catch (error) {
      console.error("Error fetching latest movie:", error);
      return null;
    }
  }
);

export const getWatchedMovies = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, MovieWithUserAndReviews[]>> => {
    try {
      const rows = await db
        .select()
        .from(movie)
        .leftJoin(user, eq(user.id, movie.userId))
        .where(isNotNull(movie.watchDate))
        .orderBy(desc(movie.watchDate));
      
      // Get all movie IDs
      const movieIds = rows.map(row => row.Movie.id);
      
      // Fetch all reviews for these movies
      const allReviews = movieIds.length > 0 
        ? await db
            .select()
            .from(review)
            .where(inArray(review.movieId, movieIds))
        : [];
      
      // Group reviews by movie ID
      const reviewsByMovieId = allReviews.reduce((acc, rev) => {
        if (!acc[rev.movieId]) {
          acc[rev.movieId] = [];
        }
        acc[rev.movieId].push(rev);
        return acc;
      }, {} as Record<string, Review[]>);
      
      // Transform to include user data and reviews
      const moviesWithUsers: MovieWithUserAndReviews[] = rows.map((row) => ({
        ...row.Movie,
        user: row.User,
        reviews: reviewsByMovieId[row.Movie.id] || [],
      }));
      
      // Group by year-month (YYYY-MM)
      const grouped = moviesWithUsers.reduce((acc, movie) => {
        if (movie.watchDate) {
          const date = new Date(movie.watchDate);
          const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!acc[yearMonth]) {
            acc[yearMonth] = [];
          }
          acc[yearMonth].push(movie);
        }
        return acc;
      }, {} as Record<string, MovieWithUserAndReviews[]>);
      
      return grouped;
    } catch (error) {
      console.error("Error fetching watched movies:", error);
      return {};
    }
  }
);



export const movieQueries = {
    all: () => ['movies'],
    latest: () => queryOptions({
        queryKey: [...movieQueries.all(), 'latest'],
        queryFn: getLatestMovies,
    }),
    watched: () => queryOptions({
        queryKey: [...movieQueries.all(), 'watched'],
        queryFn: getWatchedMovies,
    }),
}
