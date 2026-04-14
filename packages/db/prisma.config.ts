import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrate: {
    adapter: () =>
      new PrismaPg({ connectionString: process.env.POSTGRES_URL! }),
  },
});
