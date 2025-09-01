import { MongoClient, ServerApiVersion } from "mongodb";
import { MONGODB_URI, MONGODB_DB } from "$env/static/private";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");
if (!MONGODB_DB) throw new Error("Missing MONGODB_DB");

if (!clientPromise) {
  client = new MongoClient(MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });
  clientPromise = client.connect();
}

export async function db() {
  const c = await clientPromise;
  return c.db(MONGODB_DB);
}
