export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]; // Shallow copy to avoid mutating original array

  // Shuffle the array
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * (i + 1));
    // Swap elements
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  // Return the shuffled array
  return shuffled;
}
