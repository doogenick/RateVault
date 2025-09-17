import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { suppliers, rates, tours, bookings, guides } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create drizzle instance
export const db = drizzle(client, {
  schema: { suppliers, rates, tours, bookings, guides },
});