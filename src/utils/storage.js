/**
 * LocalStorage Abstraction Utility
 * 
 * Safely wraps browser localStorage with JSON serialization,
 * error boundaries, and defensive checks.
 */

const STORAGE_KEYS = {
  ATTEMPTS: 'lld_practice_attempts_v1',
  SETTINGS: 'lld_practice_settings_v1'
};

const memoryStore = new Map();

function isLocalStorageUsable() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__lld_storage_check__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    }
  } catch {
    // LocalStorage restricted or throws (e.g. Node 22 experimental flag, Safari private mode)
  }
  return false;
}

export const Storage = {
  get(key, defaultValue = null) {
    try {
      if (isLocalStorageUsable()) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return memoryStore.has(key) ? JSON.parse(memoryStore.get(key)) : defaultValue;
    } catch (error) {
      console.error(`Error reading from storage key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (isLocalStorageUsable()) {
        window.localStorage.setItem(key, serialized);
        return true;
      }
      memoryStore.set(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing to storage key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      if (isLocalStorageUsable()) {
        window.localStorage.removeItem(key);
      }
      memoryStore.delete(key);
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
    }
  },

  clear() {
    try {
      if (isLocalStorageUsable()) {
        window.localStorage.clear();
      }
      memoryStore.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  KEYS: STORAGE_KEYS
};

