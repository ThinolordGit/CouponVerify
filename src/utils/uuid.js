/**
 * src/utils/uuid.js - UUID generator and storage
 * Generates and manages unique user identifiers
 * IMPORTANT: Admin always has UUID = "**" for multi-device broadcast
 */

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if admin is logged in
 * Checks for auth_token which is only present for authenticated admin users
 */
function isAdminLoggedIn() {
  return !!localStorage.getItem('auth_token');
}

/**
 * Get or create user UUID
 * Returns "**" for admin, unique UUID for regular users
 */
export function getUserUUID() {
  // Admin always has "**" identifier for multi-device notifications
  if (isAdminLoggedIn()) {
    // console.log('[UUID] Admin identified - using special identifier: **');
    return '**';
  }

  const STORAGE_KEY = 'user_uuid';
  
  let uuid = localStorage.getItem(STORAGE_KEY);
  
  if (!uuid) {
    uuid = generateUUID();
    localStorage.setItem(STORAGE_KEY, uuid);
    // console.log('[UUID] Generated new user UUID:', uuid);
  }
  
  return uuid;
}

/**
 * Reset user UUID (used when requesting notification permission)
 */
export function resetUserUUID() {
  // Admin always uses "**" - never reset for admin
  if (isAdminLoggedIn()) {
    // console.log('[UUID] Admin - keeping special identifier: **');
    return '**';
  }

  const STORAGE_KEY = 'user_uuid';
  localStorage.removeItem(STORAGE_KEY);
  
  const newUUID = generateUUID();
  localStorage.setItem(STORAGE_KEY, newUUID);
  // console.log('[UUID] Reset user UUID:', newUUID);
  
  return newUUID;
}

/**
 * Clear user UUID
 */
export function clearUserUUID() {
  localStorage.removeItem('user_uuid');
}

/**
 * Check if current user is admin
 */
export function isAdmin() {
  return isAdminLoggedIn();
}
