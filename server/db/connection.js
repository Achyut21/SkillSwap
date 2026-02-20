import { MongoClient } from 'mongodb';

let db;

async function connectDB() {
  if (db) return db;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db('skillswap');
  return db;
}

export { connectDB, db };
