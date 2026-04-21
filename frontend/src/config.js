// API configuration
export const API_BASE_URL = "http://localhost:8000";

// Build full photo URL from relative path
export function getPhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  
  // If it's already a full URL, return as is
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }
  
  // Otherwise, prepend the API base URL and static path
  return `${API_BASE_URL}/static${photoUrl}`;
}
