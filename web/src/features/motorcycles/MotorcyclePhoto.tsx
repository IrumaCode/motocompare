import { MotoIllustration } from '../../components/MotoIllustration';

// Every photo is 960x600 (16:10). Declaring the size lets the browser reserve the space
// before the file arrives, so the layout does not jump.
const PHOTO_WIDTH = 960;
const PHOTO_HEIGHT = 600;

interface MotorcyclePhotoProps {
  image: { url: string } | null;
  /** Empty when a nearby heading already names the motorcycle */
  alt: string;
  /** Above-the-fold photo (detail page): load it first instead of lazily */
  priority?: boolean;
}

export function MotorcyclePhoto({ image, alt, priority = false }: MotorcyclePhotoProps) {
  if (!image) {
    // No freely licensed photo for this model: the brand silhouette fills the frame
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center bg-surface-2">
        <MotoIllustration variant="static" className="h-1/2 w-auto opacity-80" />
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={alt}
      width={PHOTO_WIDTH}
      height={PHOTO_HEIGHT}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className="aspect-[16/10] w-full bg-surface-2 object-cover"
    />
  );
}
