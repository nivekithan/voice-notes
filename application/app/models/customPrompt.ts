import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { WithDb } from "./utils";
import { eq } from "drizzle-orm";

export const CustomPromptModel = sqliteTable("custom_prompt", {
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

export type CustomPrompt = typeof CustomPromptModel.$inferSelect;

export async function getAllCustomPrompts({
  db,
  userId,
}: WithDb<{ userId: string }>) {
  const allCustomPrompt = await db
    .select()
    .from(CustomPromptModel)
    .where(eq(CustomPromptModel.userId, userId));

  return allCustomPrompt;
}

export type CreateCustomPrompt = Omit<
  typeof CustomPromptModel.$inferInsert,
  "id"
>;

export async function createCustomPrompt({
  db,
  description,
  name,
  systemMessage,
  updateSystemMessage,
  userId,
}: WithDb<CreateCustomPrompt>) {
  const createdCustomPrompt = await db
    .insert(CustomPromptModel)
    .values({ description, name, systemMessage, updateSystemMessage, userId })
    .returning();

  if (createdCustomPrompt.length !== 1) {
    throw new Error(
      "Unexpected createCustomPrompt did not return the created the custom prompt",
    );
  }

  return createdCustomPrompt;
}
