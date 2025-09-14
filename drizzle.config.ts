import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: "./lib/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        // biome-ignore lint/style/noNonNullAssertion: This is a env var, its fine
        url: process.env.DATABASE_URL!,
    },
});
