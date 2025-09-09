// src/app.d.ts
import type { User } from 'firebase/auth';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  
  // Global type extensions
  var process: NodeJS.Process;
  
  // MongoDB connection globals
  var _mongoClientPromise: Promise<import('mongodb').MongoClient> | undefined;
  var _mongoClient: import('mongodb').MongoClient | undefined;
}

export {};