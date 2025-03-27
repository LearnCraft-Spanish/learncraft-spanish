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
    if (newUrl) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
