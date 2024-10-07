export function fisherYatesShuffle(array) {
  const shuffled = [...array] // Shallow copy to avoid mutating original array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]] // Swap elements
  }
  return shuffled
}
