export function removeListingImage(images: string[], index: number) {
  if (images.length <= 1) throw new Error('last_image');
  if (!Number.isInteger(index) || index < 0 || index >= images.length) throw new Error('invalid_image');
  const next = images.filter((_, i) => i !== index);
  return { images: next, image: next[0] ?? '' };
}
export function selectMainImage(images: string[], index: number) {
  const image=images[index];
  if (!image) throw new Error('invalid_image');
  return { images:[image,...images.filter((_,i)=>i!==index)],image };
}