
/**
 * Utility functions for working with streams
 */

/**
 * Gets a formatted list of categories from streams
 * @param {Array} streams - The streams array
 * @returns {Array} - Array of category names
 */
export const getCategories = (streams) => {
  return [...new Set(streams.map(stream => stream.category))];
};

/**
 * Filters streams based on search query and category
 * @param {Array} streams - The streams array
 * @param {string} searchQuery - Search text 
 * @param {string|null} selectedCategory - Selected category or null for all
 * @returns {Array} - Filtered streams
 */
export const filterStreams = (streams, searchQuery, selectedCategory) => {
  return streams.filter(stream => {
    const matchesSearch = searchQuery
      ? stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.url.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory ? stream.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
};

/**
 * Determines if a stream is playable directly
 * @param {Object} stream - The stream object
 * @returns {boolean} - Whether the stream is playable
 */
export const isPlayable = (stream) => {
  return stream.isActive && (stream.useStreamlink || stream.url.startsWith('http'));
};
