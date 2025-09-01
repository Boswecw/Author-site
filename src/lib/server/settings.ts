// src/lib/server/settings.ts
import { getDb } from '$lib/server/db';

export type SiteSettingsDoc = {
  _id: 'main';
  featured_book_id?: string;   // e.g., "faith-firestorm-epub"
  featured_post_slug?: string; // e.g., "launch-faith-in-a-firestorm"
  // you can add more knobs later (e.g., homepageHeroTitle, bannerMessage, etc.)
};

const SETTINGS_ID: SiteSettingsDoc['_id'] = 'main';

export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  const db = await getDb();
  const doc =
    (await db.collection<SiteSettingsDoc>('site_settings').findOne({ _id: SETTINGS_ID })) ??
    { _id: SETTINGS_ID };
  return doc;
}

export async function getFeaturedBookIdFromSettings(): Promise<string | null> {
  const s = await getSiteSettings();
  return s.featured_book_id ?? null;
}

export async function getFeaturedPostSlugFromSettings(): Promise<string | null> {
  const s = await getSiteSettings();
  return s.featured_post_slug ?? null;
}

/**
 * Optional: update settings (use from an admin route only).
 * Pass only the fields you want to change.
 */
export async function updateSiteSettings(patch: Partial<Omit<SiteSettingsDoc, '_id'>>) {
  const db = await getDb();
  await db.collection<SiteSettingsDoc>('site_settings').updateOne(
    { _id: SETTINGS_ID },
    { $set: patch },
    { upsert: true }
  );
}
