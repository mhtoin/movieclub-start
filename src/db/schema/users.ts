import { boolean, foreignKey, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("User", {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    emailVerified: timestamp({ precision: 3, mode: 'string' }),
    password: text(),
    image: text().notNull(),
    name: text().notNull(),
    shortlistId: text(),
    tmdbAccountId: integer(),
    tmdbSessionId: text(),
    accountId: integer(),
    sessionId: text(),
    radarrApiKey: text(),
    radarrEnabled: boolean().default(false).notNull(),
    radarrMonitored: boolean().default(true).notNull(),
    radarrQualityProfileId: integer(),
    radarrRootFolder: text(),
    radarrUrl: text(),
}, (table) => [
    uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const account = pgTable("Account", {
    id: text().primaryKey().notNull(),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text("refresh_token"),
    scope: text(),
    tokenType: text("token_type"),
    type: text(),
    userId: text().notNull(),
}, (table) => [
    uniqueIndex("Account_providerAccountId_key").using("btree", table.providerAccountId.asc().nullsLast().op("text_ops")),
    uniqueIndex("Account_provider_providerAccountId_key").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerAccountId.asc().nullsLast().op("text_ops")),
    foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Account_userId_fkey"
        }).onUpdate("cascade").onDelete("cascade"),
]);

export type SelectUser = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;

export type SelectAccount = typeof account.$inferSelect;
export type InsertAccount = typeof account.$inferInsert;