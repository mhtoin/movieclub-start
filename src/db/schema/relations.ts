import { relations } from "drizzle-orm/relations";
import { movie, movieToRaffle, movieToShortlist, recommendedMovie, review } from "./movies";
import { raffle, raffleToUser } from "./raffles";
import { session } from "./sessions";
import { shortlist } from "./shortlists";
import { moviesOnTiers, tier, tierlist } from "./tierlists";
import { account, user } from "./users";


export const movieRelations = relations(movie, ({one, many}) => ({
	user: one(user, {
		fields: [movie.userId],
		references: [user.id]
	}),
	moviesOnTiers: many(moviesOnTiers),
	reviews: many(review),
	recommendedMovies_movieId: many(recommendedMovie, {
		relationName: "recommendedMovie_movieId_movie_id"
	}),
	recommendedMovies_sourceMovieId: many(recommendedMovie, {
		relationName: "recommendedMovie_sourceMovieId_movie_id"
	}),
	movieToShortlists: many(movieToShortlist),
	movieToRaffles: many(movieToRaffle),
}));

export const userRelations = relations(user, ({many}) => ({
	movies: many(movie),
	accounts: many(account),
	shortlists: many(shortlist),
	reviews: many(review),
	sessions: many(session),
	recommendedMovies: many(recommendedMovie),
	tierlists: many(tierlist),
	raffleToUsers: many(raffleToUser),
}));

export const moviesOnTiersRelations = relations(moviesOnTiers, ({one}) => ({
	movie: one(movie, {
		fields: [moviesOnTiers.movieId],
		references: [movie.id]
	}),
	tier: one(tier, {
		fields: [moviesOnTiers.tierId],
		references: [tier.id]
	}),
}));

export const tierRelations = relations(tier, ({one, many}) => ({
	moviesOnTiers: many(moviesOnTiers),
	tierlist: one(tierlist, {
		fields: [tier.tierlistId],
		references: [tierlist.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const shortlistRelations = relations(shortlist, ({one, many}) => ({
	user: one(user, {
		fields: [shortlist.userId],
		references: [user.id]
	}),
	movieToShortlists: many(movieToShortlist),
}));

export const reviewRelations = relations(review, ({one}) => ({
	user: one(user, {
		fields: [review.userId],
		references: [user.id]
	}),
	movie: one(movie, {
		fields: [review.movieId],
		references: [movie.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const recommendedMovieRelations = relations(recommendedMovie, ({one}) => ({
	movie_movieId: one(movie, {
		fields: [recommendedMovie.movieId],
		references: [movie.id],
		relationName: "recommendedMovie_movieId_movie_id"
	}),
	user: one(user, {
		fields: [recommendedMovie.userId],
		references: [user.id]
	}),
	movie_sourceMovieId: one(movie, {
		fields: [recommendedMovie.sourceMovieId],
		references: [movie.id],
		relationName: "recommendedMovie_sourceMovieId_movie_id"
	}),
}));

export const tierlistRelations = relations(tierlist, ({one, many}) => ({
	user: one(user, {
		fields: [tierlist.userId],
		references: [user.id]
	}),
	tiers: many(tier),
}));

export const movieToShortlistRelations = relations(movieToShortlist, ({one}) => ({
	movie: one(movie, {
		fields: [movieToShortlist.a],
		references: [movie.id]
	}),
	shortlist: one(shortlist, {
		fields: [movieToShortlist.b],
		references: [shortlist.id]
	}),
}));

export const movieToRaffleRelations = relations(movieToRaffle, ({one}) => ({
	movie: one(movie, {
		fields: [movieToRaffle.a],
		references: [movie.id]
	}),
	raffle: one(raffle, {
		fields: [movieToRaffle.b],
		references: [raffle.id]
	}),
}));

export const raffleRelations = relations(raffle, ({many}) => ({
	movieToRaffles: many(movieToRaffle),
	raffleToUsers: many(raffleToUser),
}));

export const raffleToUserRelations = relations(raffleToUser, ({one}) => ({
	raffle: one(raffle, {
		fields: [raffleToUser.a],
		references: [raffle.id]
	}),
	user: one(user, {
		fields: [raffleToUser.b],
		references: [user.id]
	}),
}));