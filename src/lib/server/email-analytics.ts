// src/lib/server/email-analytics.ts - Simple email analytics
import { getDb } from './db';
import type { ObjectId } from 'mongodb';

export interface EmailSendRecord {
  _id?: ObjectId;
  newsletterId: string;
  recipientEmail: string;
  recipientName?: string;
  sentAt: Date;
  status: 'sent' | 'failed' | 'bounced';
  error?: string;
  metadata?: {
    messageId?: string;
    response?: string;
  };
}

export interface EmailAnalytics {
  newsletterId: string;
  totalSent: number;
  totalFailed: number;
  successRate: number;
  sentAt: Date;
  errors: string[];
  topErrors: Array<{ error: string; count: number }>;
}

// Record email send attempt
export async function recordEmailSend(record: Omit<EmailSendRecord, '_id'>): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection<EmailSendRecord>('email_sends');
    
    await collection.insertOne({
      ...record,
      sentAt: record.sentAt || new Date()
    });

  } catch (error) {
    console.error('[email-analytics] Failed to record email send:', error);
    // Don't throw - analytics shouldn't break email sending
  }
}

// Get analytics for a specific newsletter
export async function getNewsletterAnalytics(newsletterId: string): Promise<EmailAnalytics | null> {
  try {
    const db = await getDb();
    const collection = db.collection<EmailSendRecord>('email_sends');
    
    const records = await collection
      .find({ newsletterId })
      .toArray();

    if (records.length === 0) {
      return null;
    }

    const totalSent = records.filter(r => r.status === 'sent').length;
    const totalFailed = records.filter(r => r.status === 'failed').length;
    const successRate = records.length > 0 ? (totalSent / records.length) * 100 : 0;

    // Get error summary
    const errors = records
      .filter(r => r.error)
      .map(r => r.error!)
      .filter(Boolean);

    // Count error types
    const errorCounts = errors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      newsletterId,
      totalSent,
      totalFailed,
      successRate,
      sentAt: records[0]?.sentAt || new Date(),
      errors,
      topErrors
    };

  } catch (error) {
    console.error('[email-analytics] Failed to get newsletter analytics:', error);
    return null;
  }
}

// Get overall email statistics
export async function getOverallEmailStats(): Promise<{
  totalEmails: number;
  successRate: number;
  last30Days: number;
  last7Days: number;
  topErrors: Array<{ error: string; count: number }>;
}> {
  try {
    const db = await getDb();
    const collection = db.collection<EmailSendRecord>('email_sends');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalEmails,
      successfulEmails,
      last30Days,
      last7Days,
      errorRecords
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: 'sent' }),
      collection.countDocuments({ sentAt: { $gte: thirtyDaysAgo } }),
      collection.countDocuments({ sentAt: { $gte: sevenDaysAgo } }),
      collection.find({ error: { $exists: true, $ne: null } }).toArray()
    ]);

    const successRate = totalEmails > 0 ? (successfulEmails / totalEmails) * 100 : 100;

    // Count error types
    const errorCounts = errorRecords.reduce((acc, record) => {
      if (record.error) {
        acc[record.error] = (acc[record.error] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEmails,
      successRate,
      last30Days,
      last7Days,
      topErrors
    };

  } catch (error) {
    console.error('[email-analytics] Failed to get overall stats:', error);
    return {
      totalEmails: 0,
      successRate: 100,
      last30Days: 0,
      last7Days: 0,
      topErrors: []
    };
  }
}

// Clean up old email records (keep last 90 days)
export async function cleanupOldEmailRecords(): Promise<number> {
  try {
    const db = await getDb();
    const collection = db.collection<EmailSendRecord>('email_sends');
    
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const result = await collection.deleteMany({
      sentAt: { $lt: ninetyDaysAgo }
    });

    console.log(`[email-analytics] Cleaned up ${result.deletedCount} old email records`);
    return result.deletedCount;

  } catch (error) {
    console.error('[email-analytics] Failed to cleanup old records:', error);
    return 0;
  }
}

// Get recent email activity
export async function getRecentEmailActivity(limit = 50): Promise<EmailSendRecord[]> {
  try {
    const db = await getDb();
    const collection = db.collection<EmailSendRecord>('email_sends');
    
    return await collection
      .find()
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray();

  } catch (error) {
    console.error('[email-analytics] Failed to get recent activity:', error);
    return [];
  }
}