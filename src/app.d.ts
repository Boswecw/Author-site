// src/app.d.ts

/// <reference types="@sveltejs/kit" />
/// <reference types="vite/client" />
/// <reference types="node" />

import type { User } from 'firebase/auth';
import type { MongoClient } from 'mongodb';

declare global {
  namespace App {
    // interface Error {}
    /** Data available per request (set in hooks). */
    interface Locals {
      user?: User | null;
    }
    /** Data made available to pages/layouts. */
    interface PageData {
      user?: User | null;
    }
    // interface PageState {}
    // interface Platform {}
  }

  /** Reuse a single Mongo client across dev HMR reloads. */
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

export {};
