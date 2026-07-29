const SIGNATURES: Array<{ bytes: number[]; offset: number }> = [
  { bytes: [0xff, 0xd8, 0xff], offset: 0 }, // JPEG
  { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 }, // PNG
  { bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 }, // GIF
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF (WEBP container)
];

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46]; // %PDF

const matchesSignature = (
  buffer: Buffer,
  signature: { bytes: number[]; offset: number }
): boolean =>
  signature.bytes.every(
    (byte, index) => buffer[signature.offset + index] === byte
  );

export const isValidImageBuffer = (buffer: Buffer): boolean =>
  SIGNATURES.some((signature) => matchesSignature(buffer, signature));

export const isValidPdfBuffer = (buffer: Buffer): boolean =>
  matchesSignature(buffer, { bytes: PDF_SIGNATURE, offset: 0 });