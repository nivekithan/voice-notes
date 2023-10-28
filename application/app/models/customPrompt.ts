import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const CustomPrompt = sqliteTable("custom_prompt", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$default(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  systemMessage: text("system_message").notNull(),
  updateSystemMessage: text("update_system_messsage").notNull(),
});
