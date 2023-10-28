import { DrizzleD1Database } from "drizzle-orm/d1";

export type WithDb<T> = T & { db: DrizzleD1Database };
