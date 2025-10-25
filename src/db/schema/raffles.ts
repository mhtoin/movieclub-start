import { foreignKey, index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { user } from "./users";

export const raffle = pgTable("raffle", {
    id: text().primaryKey().notNull(),
    winningMovieID: text().notNull(),
    date: text().notNull(),
});

export const raffleToUser = pgTable("_raffle_to_user", {
    a: text("A").notNull(),
    b: text("B").notNull(),
}, (table) => [
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.a],
            foreignColumns: [raffle.id],
            name: "_RaffleToUser_A_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
            columns: [table.b],
            foreignColumns: [user.id],
            name: "_RaffleToUser_B_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
    primaryKey({ columns: [table.a, table.b], name: "_RaffleToUser_AB_pkey"}),
]);