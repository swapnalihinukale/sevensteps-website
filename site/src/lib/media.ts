/** Only derivative metadata belongs in page props or browser bundles. */
export interface ImageVariant {
  src: string;
  width: number;
  height: number;
  bytes: number;
}

export interface Photograph {
  id: string;
  alt: string;
  caption?: string;
  credit?: string;
  width: number;
  height: number;
  focalPoint: { x: number; y: number };
  sources: { avif: ImageVariant[]; webp: ImageVariant[]; jpeg: ImageVariant[] };
  full: ImageVariant;
}

export function imageSrcset(variants: readonly ImageVariant[]): string {
  return variants.map(image => `${image.src} ${image.width}w`).join(', ');
}

/** Match the available derivative at or below the preferred fallback size. */
export function fallbackImage(photo: Photograph): ImageVariant {
  return photo.sources.jpeg.find(image => image.width >= 960) ?? photo.sources.jpeg.at(-1)!;
}
