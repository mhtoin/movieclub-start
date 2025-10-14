import { boolean, foreignKey, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./users";

export const shortlist = pgTable("Shortlist", {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    isReady: boolean().default(false).notNull(),
    requiresSelection: boolean().default(false),
    selectedIndex: integer(),
    participating: boolean().default(true).notNull(),
}, (table) => [
    uniqueIndex("Shortlist_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Shortlist_userId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);