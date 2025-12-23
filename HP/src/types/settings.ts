export interface Settings {
  storeName: string;
  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    building: string;
  };
  phone: string;
  businessHours: {
    open: string;
    close: string;
  };
  closedDays: string[];
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
  };
  heroImage?: string;
  aboutImage?: string;
}
