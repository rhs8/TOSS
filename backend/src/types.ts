export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  email_domain: string;
  display_name: string | null;
  photo_url: string | null;
  commitment_ends_at: string | null;
  stripe_customer_id: string | null;
  card_on_file: boolean;
  suspended_until: string | null;
  banned: boolean;
  circulation_offence_count: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  owner_id: string;
  circle_id: string | null;
  category_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  neighbourhood: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  moderation_notes: string | null;
  seasonal_collection: string | null;
  created_at: string;
  updated_at: string;
}

export interface Circulation {
  id: string;
  item_id: string;
  from_user_id: string;
  to_user_id: string;
  requested_at: string;
  confirmed_at: string | null;
  exchanged_at: string | null;
  handoff_notes: string | null;
  requester_availability: string | null;
  meeting_spots: string | null;
}

export interface ItemHolder {
  id: string;
  item_id: string;
  user_id: string;
  circulation_id: string | null;
  received_at: string;
  passed_on_at: string | null;
}

export interface Counts {
  post_count: number;
  borrow_count: number;
}
