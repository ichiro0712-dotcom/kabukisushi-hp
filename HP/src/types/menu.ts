export type MenuCategory = 'course' | 'nigiri' | 'makimono' | 'ippin' | 'drink';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  subcategory?: string; // 例: 日本酒、ビール等
  description?: string;
  imageUrl?: string;
  soldOut: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuData {
  courses: MenuItem[];
  nigiri: MenuItem[];
  makimono: MenuItem[];
  ippin: MenuItem[];
  drinks: MenuItem[];
}
