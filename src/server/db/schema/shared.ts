import { text, timestamp } from "drizzle-orm/pg-core";

export const primaryId = {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
};

export const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
