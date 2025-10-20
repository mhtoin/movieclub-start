import { boolean, doublePrecision, foreignKey, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, uniqueIndex } from "drizzle-orm/pg-core";
import { raffle } from "./raffles";
import { shortlist } from "./shortlists";
import { user } from "./users";

export const trailer = pgEnum("Trailer", ['name', 'id', 'key'])

export const movie = pgTable("Movie", {
    id: text().primaryKey().notNull(),
    adult: boolean().notNull(),
    tmdbId: integer().notNull(),
    imdbId: text(),
    originalLanguage: text("original_language").notNull(),
    originalTitle: text("original_title").notNull(),
    overview: text().notNull(),
    popularity: doublePrecision().notNull(),
    releaseDate: text("release_date").notNull(),
    title: text().notNull(),
    video: boolean().notNull(),
    voteAverage: doublePrecision("vote_average").notNull(),
    voteCount: integer("vote_count").notNull(),
    watchDate: text(),
    userId: text().references(() => user.id),
    runtime: integer(),
    genres: text().array(),
    tagline: text(),
    watchProviders: jsonb('watchProviders').$type<Record<string, any> | null>().default(null),
    images: jsonb('images').$type<Record<string, any> | null>().default(null),
    videos: jsonb('videos').$type<Record<string, any> | null>().default(null),
    cast: jsonb('cast').$type<any[] | null>().default(null),
    crew: jsonb('crew').$type<any[] | null>().default(null),
    tierIds: text().array(),
}, (table) => [
    uniqueIndex("Movie_tmdbId_key").using("btree", table.tmdbId.asc().nullsLast().op("int4_ops")),
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Movie_userId_fkey"
        }).onUpdate("cascade").onDelete("set null"),
]);

export const review = pgTable("Review", {
    id: text().primaryKey().notNull(),
    content: text().notNull(),
    userId: text().notNull(),
    movieId: text().notNull(),
    timestamp: text().notNull(),
    rating: doublePrecision().notNull(),
}, (table) => [
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Review_userId_fkey"
        }).onUpdate("cascade").onDelete("restrict"),
    foreignKey({
            columns: [table.movieId],
            foreignColumns: [movie.id],
            name: "Review_movieId_fkey"
        }).onUpdate("cascade").onDelete("restrict"),
]);

export const recommendedMovie = pgTable("RecommendedMovie", {
    id: text().primaryKey().notNull(),
    movieId: text().notNull(),
    userId: text().notNull(),
    sourceMovieId: text().notNull(),
}, (table) => [
    uniqueIndex("RecommendedMovie_movieId_userId_sourceMovieId_key").using("btree", table.movieId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops"), table.sourceMovieId.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.movieId],
            foreignColumns: [movie.id],
            name: "RecommendedMovie_movieId_fkey"
        }).onUpdate("cascade").onDelete("set default"),
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "RecommendedMovie_userId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
            columns: [table.sourceMovieId],
            foreignColumns: [movie.id],
            name: "RecommendedMovie_sourceMovieId_fkey"
        }).onUpdate("cascade").onDelete("restrict"),
]);

export const movieToShortlist = pgTable("_MovieToShortlist", {
    a: text("A").notNull(),
    b: text("B").notNull(),
}, (table) => [
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.a],
            foreignColumns: [movie.id],
            name: "_MovieToShortlist_A_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
            columns: [table.b],
            foreignColumns: [shortlist.id],
            name: "_MovieToShortlist_B_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    primaryKey({ columns: [table.a, table.b], name: "_MovieToShortlist_AB_pkey"}),
]);

export const movieToRaffle = pgTable("_MovieToRaffle", {
    a: text("A").notNull(),
    b: text("B").notNull(),
}, (table) => [
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.a],
            foreignColumns: [movie.id],
            name: "_MovieToRaffle_A_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
            columns: [table.b],
            foreignColumns: [raffle.id],
            name: "_MovieToRaffle_B_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    primaryKey({ columns: [table.a, table.b], name: "_MovieToRaffle_AB_pkey"}),
]);