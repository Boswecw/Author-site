import { getDb } from './db';
import { ObjectId } from 'mongodb';

export interface Newsletter {
  _id?: ObjectId;
  subject: string;
  content: { html: string; text: string; };
  status: 'draft' | 'ready' | 'sent';
  createdAt: Date;
}

export async function getAllNewsletters() {
  const db = await getDb();
  return await db.collection('newsletters').find({}).toArray();
}
