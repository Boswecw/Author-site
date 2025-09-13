  if (existingPost) {
    const result = await collection.findOneAndUpdate(
      { _id: existingPost._id },
      { $set: postDoc },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Failed to update post');
    }
    
    return result;
  } else {
