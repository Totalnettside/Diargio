export function avatarLayout(width: number, height: number, zoom: number, x: number, y: number, size = 320) {
  const scale = Math.min(size / width, size / height) * zoom;
  return { width: width * scale, height: height * scale, x: (size - width * scale) / 2 + x, y: (size - height * scale) / 2 + y };
}