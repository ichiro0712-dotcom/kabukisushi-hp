export interface Analytics {
  totalVisits: number;
  todayVisits: number;
  popularMenuItems: Array<{
    id: string;
    name: string;
    views: number;
  }>;
  recentUpdates: Array<{
    type: 'menu' | 'gallery' | 'settings';
    description: string;
    timestamp: string;
  }>;
}
