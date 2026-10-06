export function ArtworkPreview({ image, alt, large = false }: { image: string; alt: string; large?: boolean }) {
  return (
    <div className={`group/preview relative w-full overflow-hidden bg-muted ${large ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 size-full object-contain transition-transform duration-500 ease-out group-hover/preview:scale-[1.06]"
      />
    </div>
  );
}