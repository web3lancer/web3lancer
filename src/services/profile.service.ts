// Add this function to the profileService class

// Get reviews for a specific project
async getProjectReviews(projectId: string): Promise<Review[]> {
  try {
    const reviews = await this.databases.listDocuments(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_JOBS_ID,
      env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_REVIEWS_ID,
      [
        Query.equal('projectId', projectId),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return reviews.documents as Review[];
  } catch (error) {
    console.error('Error fetching project reviews:', error);
    return [];
  }
}