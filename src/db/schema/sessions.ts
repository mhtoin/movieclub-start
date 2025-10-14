import { foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const session = pgTable("Session", {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    expiresAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Session_userId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);