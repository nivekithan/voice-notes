import { and, desc, eq, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { WithDb } from "./utils";

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
  promptId: text("promptId").notNull(),
  createdAt: text("createdAt")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

type CreateNotes = typeof Notes.$inferInsert;

export async function createNewNotes({
  db,
  id,
  content,
  status,
  title,
  transcript,
  userId,
  promptId,
}: WithDb<CreateNotes>) {
  const notes = await db
    .insert(Notes)
    .values({ id, content, status, title, transcript, userId, promptId })
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

export async function getNotes({
  db,
  noteId,
  userId,
}: WithDb<{ noteId: string; userId: string }>) {
  const notes = await db
    .select()
    .from(Notes)
    .where(and(eq(Notes.id, noteId), eq(Notes.userId, userId)));

  if (notes.length !== 1) {
    return null;
  }

  return notes[0];
}

export async function updateTitleAndContent({
  content,
  db,
  noteId,
  title,
  userId,
}: WithDb<{ userId: string; title: string; content: string; noteId: string }>) {
  await db
    .update(Notes)
    .set({ title, content })
    .where(and(eq(Notes.id, noteId), eq(Notes.userId, userId)));
}

export async function updateContent({
  content,
  db,
  noteId,
  userId,
}: WithDb<{
  userId: string;
  content: string;
  noteId: string;
}>) {
  await db
    .update(Notes)
    .set({ content })
    .where(and(eq(Notes.userId, userId), eq(Notes.id, noteId)));
}

export async function deleteNote({
  db,
  noteId,
  userId,
}: WithDb<{ userId: string; noteId: string }>) {
  await db
    .delete(Notes)
    .where(and(eq(Notes.userId, userId), eq(Notes.id, noteId)));
}
