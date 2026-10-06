export function ArtworkPreview({ image, alt, large = false }: { image: string; alt: string; large?: boolean }) {
  return (
    <div className={`relative w-full overflow-hidden bg-muted ${large ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
      <img src={image} alt={alt} loading="lazy" className="absolute inset-0 size-full object-contain" />
    </div>
  );
}