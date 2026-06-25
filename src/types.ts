export interface User {
  id: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  handle: string;
  bio: string;
  avatar_url: string;
  location: string;
}

export interface Reel {
  id: string;
  creator_id: string;
  video_url: string;
  caption: string;
  tags?: string[];
  is_shoppable: boolean;
  linked_listing_id?: string;
  handle: string;
  avatar_url: string;
}

export interface Listing {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: 'digital' | 'service' | 'physical';
  price: number;
  media_urls?: string[];
  handle: string;
}

export interface AudioSpace {
  id: string;
  host_creator_id: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  handle: string;
}

export interface GeoPoint {
  id: string;
  creator_id: string;
  lat: number;
  lng: number;
  handle: string;
  avatar_url: string;
}

export interface Analytic {
  id: string;
  type: 'user' | 'content' | 'revenue' | 'operational';
  metric_name: string;
  metric_value: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'system' | 'activity' | 'membership' | 'staff';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Tier {
  id: string;
  name: string;
  price_id: string | null;
  features: string[];
  monthly_price: number;
}

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
}
