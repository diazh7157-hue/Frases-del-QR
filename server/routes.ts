
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  
  app.get(api.phrases.list.path, isAuthenticated, async (req, res) => {
    const phrases = await storage.getPhrases();
    res.json(phrases);
  });

  app.post(api.phrases.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.phrases.create.input.parse(req.body);
      const phrase = await storage.createPhrase(input);
      res.status(201).json(phrase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.phrases.delete.path, isAuthenticated, async (req, res) => {
    await storage.deletePhrase(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.phrases.random.path, async (req, res) => {
    const phrase = await storage.getRandomPhrase();
    if (!phrase) {
      return res.status(404).json({ message: "No phrases found" });
    }
    res.json(phrase);
  });

  // Seed data if empty
  const existing = await storage.getPhrases();
  if (existing.length === 0) {
    await storage.createPhrase({ text: "El único modo de hacer un gran trabajo es amar lo que haces." });
    await storage.createPhrase({ text: "La tecnología es mejor cuando une a la gente." });
    await storage.createPhrase({ text: "El código es poesía." });
    console.log("Seeded default phrases");
  }

  return httpServer;
}
