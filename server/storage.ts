
import { db } from "./db";
import { phrases, type Phrase, type InsertPhrase } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getPhrases(): Promise<Phrase[]>;
  createPhrase(phrase: InsertPhrase): Promise<Phrase>;
  deletePhrase(id: number): Promise<void>;
  getRandomPhrase(): Promise<Phrase | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getPhrases(): Promise<Phrase[]> {
    return await db.select().from(phrases).orderBy(phrases.createdAt);
  }

  async createPhrase(phrase: InsertPhrase): Promise<Phrase> {
    const [newPhrase] = await db.insert(phrases).values(phrase).returning();
    return newPhrase;
  }

  async deletePhrase(id: number): Promise<void> {
    await db.delete(phrases).where(eq(phrases.id, id));
  }

  async getRandomPhrase(): Promise<Phrase | undefined> {
    // Efficiently get one random row
    const [phrase] = await db
      .select()
      .from(phrases)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return phrase;
  }
}

export const storage = new DatabaseStorage();
