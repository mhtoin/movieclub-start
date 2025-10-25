import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
    id: text().primaryKey().notNull(),
    watchProviders: jsonb(),
    watchWeekDay: text().notNull(),
});
