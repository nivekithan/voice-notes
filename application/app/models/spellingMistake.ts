import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { WithDb } from "./utils";
import { eq } from "drizzle-orm";

export const SpellingMistake = sqliteTable("spelling_mistake", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique(),
  spellingMistake: text("spelling_mistake").notNull(),
});

export async function setSpellingMistake({
  db,
  spellingMistake,
  userId,
}: WithDb<{ userId: string; spellingMistake: string }>) {
  await db
    .insert(SpellingMistake)
    .values({ spellingMistake, userId })
    .onConflictDoUpdate({
      set: { spellingMistake },
      target: SpellingMistake.userId,
    });
}

export async function getSpellingMistake({
  db,
  userId,
}: WithDb<{ userId: string }>) {
  const spellingMistake = await db
    .select()
    .from(SpellingMistake)
    .where(eq(SpellingMistake.userId, userId));

  if (spellingMistake.length === 0) {
    return null;
  }

  return spellingMistake[0];
}
