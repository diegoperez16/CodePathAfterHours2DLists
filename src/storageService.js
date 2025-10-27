// Storage service using localStorage for persistence
// This stores student data in the browser's localStorage

const STORAGE_PREFIX = 'haunted_mansion_';

export const storageService = {
  // Get a value from storage
  get: async (key, isShared = false) => {
    try {
      const storageKey = STORAGE_PREFIX + key;
      const value = localStorage.getItem(storageKey);
      if (value) {
        return { value };
      }
      return null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  // Set a value in storage
  set: async (key, value, isShared = false) => {
    try {
      const storageKey = STORAGE_PREFIX + key;
      localStorage.setItem(storageKey, value);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  // List all keys matching a prefix
  list: async (prefix = '', isShared = false) => {
    try {
      const fullPrefix = STORAGE_PREFIX + prefix;
      const keys = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          // Remove the STORAGE_PREFIX to return the original key
          keys.push(key.substring(STORAGE_PREFIX.length));
        }
      }
      
      return { keys };
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [] };
    }
  },

  // Delete a key
  delete: async (key, isShared = false) => {
    try {
      const storageKey = STORAGE_PREFIX + key;
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Storage delete error:', error);
      return false;
    }
  }
};

// Make storage available globally
if (typeof window !== 'undefined') {
  window.storage = storageService;
}
