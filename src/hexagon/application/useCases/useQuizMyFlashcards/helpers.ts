// Helper function to handle the complex rounding logic
export function applyQuizLengthRoundingRules(
  userSelection: number,
  maximum: number,
  defaultLength: number,
): number {
  // Special case: Always allow exactly 5 cards
  if (userSelection === 5) {
    return 5;
  }

  // Round to nearest 10 for other values
  const roundedLength = Math.round(userSelection / 10) * 10;
  // Use rounded value if it's valid (non-zero and within maximum)
  // Otherwise fall back to default
  return roundedLength > 0 && roundedLength < maximum
    ? roundedLength
    : defaultLength;
}
