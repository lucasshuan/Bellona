import { db } from "./index";

async function test() {
  try {
    console.log("Starting test...");
    const allUsers = await db.user.findMany();
    console.log("Success! Users found:", allUsers.length);
  } catch (error) {
    console.error("Test failed!");
    console.error(error);
  }
}

test();
