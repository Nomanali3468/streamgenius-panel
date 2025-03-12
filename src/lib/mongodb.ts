
import { MongoClient, ServerApiVersion } from 'mongodb';

// Connection URI from environment variable
const uri = import.meta.env.VITE_MONGODB_URI || "";

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connection state
let clientPromise: Promise<MongoClient>;

// Reuse the connection when in production
if (process.env.NODE_ENV === 'production') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export { client, clientPromise };

// Database helper functions
export async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db('stream-genius');
}

// Convert MongoDB _id to id in returned objects
export function normalizeId<T extends { _id?: any }>(doc: T): Omit<T, '_id'> & { id: string } {
  // Create a new object without the _id field
  const { _id, ...rest } = doc;
  
  // Add id field with the string value of _id
  return {
    ...rest,
    id: _id.toString(),
  } as any;
}
