import path from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

loadEnvFile(path.resolve(__dirname, "../../.env"));

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma/migrations"),
    seed: path.join(__dirname, "prisma/seed.ts"),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
