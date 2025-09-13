// src/lib/server/subscribers.ts - MongoDB subscriber management

import { getDb } from '$lib/server/db';
import type { ObjectId } from 'mongodb';

export interface Subscriber {
  _id?: ObjectId;
  email: string;
  name: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  source: string; // 'contact-modal', 'homepage', 'blog', etc.
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  
  // Google Apps Script sync tracking
  googleSheetsRowId?: number; // Row number in Google Sheets
  lastSyncedAt?: Date;
  
  // Additional metadata
  ipAddress?: string; // For analytics (if available)
  userAgent?: string; // For analytics (if available)
  tags?: string[]; // For segmentation
}

export interface SubscriberStats {
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
  newThisMonth: number;
  newThisWeek: number;
}

// Create or update subscriber in MongoDB
export async function upsertSubscriber(
  email: string,
  data: Partial<Subscriber>
): Promise<Subscriber> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  
  const now = new Date();
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if subscriber exists
  const existing = await collection.findOne({ email: normalizedEmail });
  
  if (existing) {
    // Update existing subscriber
    const updateData: Partial<Subscriber> = {
      ...data,
      updatedAt: now
    };
    
    // Don't overwrite confirmed status with pending
    if (existing.status === 'confirmed' && data.status === 'pending') {
      delete updateData.status;
    }
    
    const result = await collection.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Failed to update subscriber');
    }
    
    return result;  
  } else {
    // Create new subscriber
    const newSubscriber: Omit<Subscriber, '_id'> = {
      email: normalizedEmail,
      name: data.name || '',
      status: data.status || 'pending',
      source: data.source || 'unknown',
      createdAt: now,
      updatedAt: now,
      ...data
    };
    
    const result = await collection.insertOne(newSubscriber);
    return { ...newSubscriber, _id: result.insertedId };
  }
}

// Get subscriber by email
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  return await collection.findOne({ email: email.toLowerCase().trim() });
}

// Update subscriber status (for confirmations/unsubscribes)
export async function updateSubscriberStatus(
  email: string,
  status: Subscriber['status']
): Promise<void> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  
  const updateData: Partial<Subscriber> = {
    status,
    updatedAt: new Date()
  };
  
  if (status === 'confirmed') {
    updateData.confirmedAt = new Date();
  } else if (status === 'unsubscribed') {
    updateData.unsubscribedAt = new Date();
  }
  
  await collection.updateOne(
    { email: email.toLowerCase().trim() },
    { $set: updateData }
  );
}

// Get subscriber statistics
export async function getSubscriberStats(): Promise<SubscriberStats> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [
    total,
    confirmed,
    pending,
    unsubscribed,
    newThisWeek,
    newThisMonth
  ] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ status: 'confirmed' }),
    collection.countDocuments({ status: 'pending' }),
    collection.countDocuments({ status: 'unsubscribed' }),
    collection.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    collection.countDocuments({ createdAt: { $gte: oneMonthAgo } })
  ]);
  
  return {
    total,
    confirmed,
    pending,
    unsubscribed,
    newThisWeek,
    newThisMonth
  };
}

// Get recent subscribers (for admin dashboard)
export async function getRecentSubscribers(limit = 20): Promise<Subscriber[]> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  
  return await collection
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Get all confirmed subscribers (for sending newsletters)
export async function getConfirmedSubscribers(): Promise<Subscriber[]> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  
  return await collection
    .find({ status: 'confirmed' })
    .sort({ confirmedAt: -1 })
    .toArray();
}

// Search subscribers by email or name
export async function searchSubscribers(query: string, limit = 50): Promise<Subscriber[]> {
  const db = await getDb();
  const collection = db.collection<Subscriber>('subscribers');
  
  const searchRegex = new RegExp(query, 'i');
  
  return await collection
    .find({
      $or: [
        { email: { $regex: searchRegex } },
        { name: { $regex: searchRegex } }
      ]
    })
    .limit(limit)
    .toArray();
}