import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma/migrations"),
    seed: path.join(__dirname, "prisma/seed.ts"),
  },
  datasource: {
    url: process.env.POSTGRES_URL!,
  },
});
