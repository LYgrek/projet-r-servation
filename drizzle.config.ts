import { defineConfig } from "drizzle-kit";

/** Configuration de drizzle-kit (génération des migrations SQL à partir du schéma TypeScript). */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: process.env.DATABASE_URL ?? "file:data/parc.db" },
});
