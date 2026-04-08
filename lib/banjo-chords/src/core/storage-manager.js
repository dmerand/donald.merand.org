/**
 * localStorage wrapper for persisting UI state
 */

class StorageManager {
  constructor(prefix) {
    this.prefix = prefix;
  }

  save(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) { /* quota exceeded or private mode */ }
  }

  load(key, defaultValue) {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
