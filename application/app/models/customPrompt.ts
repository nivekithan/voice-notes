import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { WithDb } from "./utils";
import { and, desc, eq } from "drizzle-orm";

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
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type CustomPrompt = typeof CustomPromptModel.$inferSelect;

export async function getCustomPrompt({
  db,
  promptId,
  userId,
}: WithDb<{ userId: string; promptId: string }>) {
  const prompt = await db
    .select()
    .from(CustomPromptModel)
    .where(
      and(
        eq(CustomPromptModel.id, promptId),
        eq(CustomPromptModel.userId, userId),
      ),
    );

  if (prompt.length === 0) {
    return null;
  }

  return prompt[0];
}

export async function getAllCustomPrompts({
  db,
  userId,
}: WithDb<{ userId: string }>) {
  const allCustomPrompt = await db
    .select()
    .from(CustomPromptModel)
    .where(eq(CustomPromptModel.userId, userId))
    .orderBy(desc(CustomPromptModel.createdAt));

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

export async function updateCustomPrompt({
  db,
  description,
  name,
  promptId,
  systemMessage,
  updateSystemMessage,
  userId,
}: WithDb<{
  userId: string;
  name: string;
  description: string;
  systemMessage: string;
  updateSystemMessage: string;
  promptId: string;
}>) {
  await db
    .update(CustomPromptModel)
    .set({ description, name, systemMessage, updateSystemMessage })
    .where(
      and(
        eq(CustomPromptModel.id, promptId),
        eq(CustomPromptModel.userId, userId),
      ),
    );
}

export async function deleteCustomPrompt({
  db,
  promptId,
  userId,
}: WithDb<{
  userId: string;
  promptId: string;
}>) {
  await db
    .delete(CustomPromptModel)
    .where(
      and(
        eq(CustomPromptModel.userId, userId),
        eq(CustomPromptModel.id, promptId),
      ),
    );
}
