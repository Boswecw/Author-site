// src/routes/api/blog/[slug]/update/+server.ts
const { value: updated } = await collection.findOneAndUpdate(
  { _id: new ObjectId(payload.id) },
  { $set: updateData },
  { returnDocument: 'after' }
);

if (!updated) {
  return json({ success: false, error: 'Post not found or not updated' }, { status: 404 });
}

// use `updated` from here on
const baseUrl = process.env.PUBLIC_SITE_URL || 'https://author-site-w26m.onrender.com';
const postUrl = `${baseUrl}/blog/${updated.slug}`;

return json({
  success: true,
  id: updated._id.toString(),
  slug: updated.slug,
  url: postUrl,
  message: `Blog post "${updated.title}" updated successfully!`,
  status: updated.status,
  publishedAt: updated.publishedAt?.toString(),
  updatedAt: updated.updatedAt?.toString()
});
