const STORAGE_KEY = 'taskflow_app_data';

export const storageManager = {
  /**
   * Checks if localStorage is supported and available in the current browser environment
   * @returns {boolean}
   */
  isStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  },

  /**
   * Serializes and persists application state to localStorage
   * @param {Object} state - The state object containing projects and activeProjectId
   * @returns {boolean} True if successfully saved, false otherwise
   */
  saveState(state) {
    if (!this.isStorageAvailable()) return false;

    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serializedState);
      return true;
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
      return false;
    }
  },

  /**
   * Retrieves and parses stored application state from localStorage
   * @returns {Object|null} The parsed state object, or null if no valid data exists
   */
  loadState() {
    if (!this.isStorageAvailable()) return null;

    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        return null;
      }
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Failed to load or parse state from localStorage:', error);
      return null;
    }
  },

  /**
   * Clears saved application state from localStorage
   */
  clearStorage() {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};

