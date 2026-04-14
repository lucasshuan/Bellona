import "dotenv/config";
import { db } from "@/server/db/client";

async function main() {
  await db.userPermission.deleteMany();
  await db.permission.deleteMany();
  console.log("Truncated");
}
main()
  .catch(console.error)
  .then(() => process.exit(0));
