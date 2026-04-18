/**
 * Shuffles an array using the Fisher-Yates (Knuth) algorithm.
 * This is an O(n) operation that ensures uniform distribution.
 * 
 * @param {Array} array - The array to shuffle.
 * @returns {Array} - A new shuffled array.
 */
export function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  
  // Clone to avoid mutation
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}
