import { foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

export const sessionsTable = pgTable("Session", {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    secretHash: text().notNull(),
    expiresAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'date' }).notNull(),
}, (table) => [
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Session_userId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);