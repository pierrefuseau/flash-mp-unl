// The name of the cache where podcast audio files will be stored.
const CACHE_NAME = 'podcast-audio-cache-v1';

/**
 * Opens the application's dedicated cache.
 * @returns {Promise<Cache>} A promise that resolves to the Cache object.
 */
const openCache = async (): Promise<Cache> => {
  return await caches.open(CACHE_NAME);
};

/**
 * Retrieves an audio response from the cache.
 * This checks if a request has been previously fetched and stored.
 * @param {string} url The URL of the audio file to retrieve.
 * @returns {Promise<Response | undefined>} The cached Response object, or undefined if not found.
 */
export const getAudioFromCache = async (url: string): Promise<Response | undefined> => {
  // Check if the Cache API is available in the browser.
  if (!('caches' in window)) {
    return undefined;
  }
  try {
    const cache = await openCache();
    const cachedResponse = await cache.match(url);
    return cachedResponse;
  } catch (error) {
    console.error("Error getting from cache:", error);
    return undefined;
  }
};

/**
 * Stores an audio response in the cache for future use.
 * @param {string} url The URL (as a key) of the audio file to cache.
 * @param {Response} response The Response object to store. The response is cloned
 * because its body can only be read once.
 */
export const putAudioInCache = async (url: string, response: Response): Promise<void> => {
  // Check if the Cache API is available in the browser.
  if (!('caches' in window)) {
    return;
  }
  try {
    const cache = await openCache();
    // Use put() to store the response. The request URL is the key.
    await cache.put(url, response.clone());
  } catch (error) {
    console.error("Error putting in cache:", error);
  }
};
