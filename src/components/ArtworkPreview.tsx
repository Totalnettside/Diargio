export function ArtworkPreview({ image, alt }: { image: string; alt: string; large?: boolean }) {
  return (
    <div className="group/preview relative w-full overflow-hidden">
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full transition-transform duration-500 ease-out group-hover/preview:scale-[1.06]"
      />
    </div>
  );
}
