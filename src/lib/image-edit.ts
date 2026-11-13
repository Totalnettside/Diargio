export function rotationGeometry(width: number, height: number, turns: number) {
  const normalized = ((turns % 4) + 4) % 4;
  return { width: normalized % 2 ? height : width, height: normalized % 2 ? width : height, radians: normalized * Math.PI / 2 };
}

export async function rotateImage(image: string, turns: number): Promise<string> {
  if (turns % 4 === 0) return image;
  const source = new Image();
  source.src = image;
  await source.decode();
  const geometry = rotationGeometry(source.naturalWidth, source.naturalHeight, turns);
  const canvas = document.createElement('canvas');
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(geometry.radians);
  context.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2);
  return canvas.toDataURL('image/png');
}