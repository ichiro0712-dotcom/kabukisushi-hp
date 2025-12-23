export interface GalleryImage {
  id: string;
  url: string; // Base64またはURL
  alt: string;
  order: number;
  uploadedAt: string;
}
