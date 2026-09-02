import { readFileSync } from 'node:fs';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Reads width/height out of a PNG's IHDR chunk. Avoids an image dependency. */
export function pngSize(path) {
  const buf = readFileSync(path);
  if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error(`${path} is not a PNG`);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
