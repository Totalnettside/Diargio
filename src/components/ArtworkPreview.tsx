import interior from "@/assets/artwork-interior.jpg";
import pedestal from "@/assets/sculpture-pedestal.jpg";

export function ArtworkPreview({ image, alt, large = false, sculpture = false }: { image: string; alt: string; large?: boolean; sculpture?: boolean }) {
  if (sculpture) {
    return (
      <div className={`artwork-preview artwork-preview-sculpture relative w-full overflow-hidden ${large ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
        <img src={pedestal} alt="" loading="lazy" width={1024} height={1280} className="absolute inset-0 size-full" />
        <div className="artwork-preview-sculpture-slot">
          <img src={image} alt={alt} loading="lazy" className="artwork-preview-sculpture-image" />
        </div>
      </div>
    );
  }
  return (
    <div className={`artwork-preview relative w-full overflow-hidden ${large ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
      <div className="artwork-preview-gallery absolute inset-0 flex items-center justify-center">
        <div className="artwork-preview-slot">
          <div className="artwork-preview-frame">
            <img src={image} alt={alt} loading="lazy" className="artwork-preview-image" />
          </div>
        </div>
      </div>
      <div className="artwork-preview-room absolute inset-0" aria-hidden="true">
        <img src={interior} alt="" loading="lazy" width={1024} height={1280} className="absolute inset-0 size-full object-cover" />
        <div className="artwork-preview-room-slot">
          <div className="artwork-preview-frame">
            <img src={image} alt="" loading="lazy" className="artwork-preview-image" />
          </div>
        </div>
      </div>
    </div>
  );
}