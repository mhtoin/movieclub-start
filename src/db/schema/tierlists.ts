import { foreignKey, integer, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { movie } from "./movies";
import { user } from "./users";


export const tierlist = pgTable("tierlist", {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    title: text(),
    watchDate: jsonb(),
    genres: text().array(),
}, (table) => [
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Tierlist_userId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);

export const tier = pgTable("tier", {
    id: text().primaryKey().notNull(),
    label: text().notNull(),
    value: integer().notNull(),
    tierlistId: text().notNull(),
}, (table) => [
    foreignKey({
            columns: [table.tierlistId],
            foreignColumns: [tierlist.id],
            name: "Tier_tierlistId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);

export const moviesOnTiers = pgTable("movies_on_tiers", {
    id: text().primaryKey().notNull(),
    position: integer().notNull(),
    movieId: text().notNull(),
    tierId: text().notNull(),
}, (table) => [
    uniqueIndex("MoviesOnTiers_movieId_tierId_key").using("btree", table.movieId.asc().nullsLast().op("text_ops"), table.tierId.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.movieId],
            foreignColumns: [movie.id],
            name: "MoviesOnTiers_movieId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
            columns: [table.tierId],
            foreignColumns: [tier.id],
            name: "MoviesOnTiers_tierId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);