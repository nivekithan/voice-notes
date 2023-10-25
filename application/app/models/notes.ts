import { desc, eq, sql } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export type NoteStatus = "CREATED" | "PROCESSING" | "DONE" | "ERROR";

export const Notes = sqliteTable("notes", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$default(() => crypto.randomUUID()),
  title: text("title"),
  content: text("content"),
  transcript: text("transcript"),
  status: text("status").$type<NoteStatus>().notNull().default("CREATED"),
  userId: text("userId").notNull(),
  createdAt: text("createdAt")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

type CreateNotes = typeof Notes.$inferInsert;
type WithDb<T> = T & { db: DrizzleD1Database };

export async function createNewNotes({
  db,
  id,
  content,
  status,
  title,
  transcript,
  userId,
}: WithDb<CreateNotes>) {
  const notes = await db
    .insert(Notes)
    .values({ id, content, status, title, transcript, userId })
    .returning();

  if (notes.length !== 1) {
    throw new Error("[unexpected] Expected notes to be an array with length 1");
  }

  return notes[0];
}

export async function getAllNotes({ userId, db }: WithDb<{ userId: string }>) {
  const notes = await db
    .select()
    .from(Notes)
    .where(eq(Notes.userId, userId))
    .orderBy(desc(Notes.createdAt));

  return notes;
}
