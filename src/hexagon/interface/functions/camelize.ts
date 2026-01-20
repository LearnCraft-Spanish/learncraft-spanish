export default function camelize(str: string): string {
  const strArr = str.replaceAll(/[^\w\s]/g, ' ');
  const strArr2 = strArr.split(' ');
  const camelArr = strArr2.map((word, index) =>
    index === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
  return camelArr.join('');
}
