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
