import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, "../../..");

dotenv.config({
  path: path.join(workspaceRoot, ".env.local"),
  override: false,
});
dotenv.config({ path: path.join(workspaceRoot, ".env"), override: false });

process.env.NEXTAUTH_URL ??= "http://localhost:3000";

await import("../node_modules/next/dist/bin/next");
