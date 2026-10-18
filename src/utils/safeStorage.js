/**
 * Safe Storage Wrapper with Quota Protection & Auto Fallback
 * - Catches JSON parse errors to prevent White Screen of Death
 * - Handles QuotaExceededError gracefully with automatic pruning
 * - In-memory fallback if LocalStorage is disabled or exhausted
 */

// In-memory fallback cache
const memoryStore = new Map();

/**
 * Safely load and parse an item from LocalStorage
 * @param {string} key - Storage key
 * @param {any} fallback - Default fallback value if missing or corrupted
 * @returns {any}
 */
export function safeGetItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return memoryStore.has(key) ? memoryStore.get(key) : fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[safeStorage] Corrupted cache for key "${key}", falling back safely:`, err);
    return fallback;
  }
}

/**
 * Safely save an item to LocalStorage with QuotaExceededError handling
 * @param {string} key - Storage key
 * @param {any} value - Value to serialize
 * @param {object} options - { pruneKeys: Array<string> }
 * @returns {boolean} Success status
 */
export function safeSetItem(key, value, { pruneKeys = [] } = {}) {
  // Always update memory fallback
  memoryStore.set(key, value);

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    const isQuotaError = 
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014;

    if (isQuotaError) {
      console.warn(`[safeStorage] LocalStorage quota exceeded while writing "${key}". Initiating auto-pruning...`);
      
      try {
        // Auto-prune activity logs and transactions to 20 items to free up space
        const pruneTargets = pruneKeys.length > 0 
          ? pruneKeys 
          : ['ecoschola_clean_activities_v1', 'ecoschola_clean_transactions_v1'];

        pruneTargets.forEach(targetKey => {
          try {
            const raw = localStorage.getItem(targetKey);
            if (raw) {
              const items = JSON.parse(raw);
              if (Array.isArray(items) && items.length > 20) {
                localStorage.setItem(targetKey, JSON.stringify(items.slice(0, 20)));
              }
            }
          } catch (e) {}
        });

        // Retry writing the original value
        localStorage.setItem(key, JSON.stringify(value));
        console.info(`[safeStorage] Successfully saved "${key}" after auto-pruning old logs.`);
        return true;
      } catch (retryErr) {
        console.error(`[safeStorage] Storage still exhausted after pruning. Kept in session memory for key "${key}".`, retryErr);
        return false;
      }
    }

    console.error(`[safeStorage] Error saving "${key}" to LocalStorage:`, err);
    return false;
  }
}

/**
 * Safely remove an item
 * @param {string} key - Storage key
 */
export function safeRemoveItem(key) {
  memoryStore.delete(key);
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

/**
 * Enforce maximum items in an array for FIFO caching (default: 50)
 * @param {Array} list - Array of data items
 * @param {number} maxItems - Maximum allowable items (default: 50)
 * @returns {Array} Pruned array
 */
export function pruneFifo(list, maxItems = 50) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, maxItems);
}
