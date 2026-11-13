export function rotationGeometry(width: number, height: number, degrees: number) {
  const radians = (degrees % 360) * Math.PI / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  return {
    width: Math.ceil(width * cosine + height * sine - 1e-9),
    height: Math.ceil(width * sine + height * cosine - 1e-9),
    radians,
  };
}

export async function rotateImage(image: string | HTMLImageElement, degrees: number): Promise<string> {
  if (degrees % 360 === 0) return typeof image === 'string' ? image : image.src;
  const source = typeof image === 'string' ? new Image() : image;
  if (typeof image === 'string') {
    source.src = image;
    await source.decode();
  }
  const geometry = rotationGeometry(source.naturalWidth, source.naturalHeight, degrees);
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