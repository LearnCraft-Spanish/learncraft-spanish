export default function verifyRequiredInputs(
  inputs: { value: string; label: string }[],
) {
  for (const input of inputs) {
    if (input.value === '') {
      return input.label;
    }
  }
  return false;
}

export function isValidUrl(url: string): boolean {
  if (url === '') {
    return true;
  }
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch {
    return false;
  }
}
