export type UserRole = 'RESIDENT' | 'STAFF' | 'SOCIETY_ADMIN' | 'PLATFORM_ADMIN';

export type ParcelStatus =
  | 'RECEIVED'
  | 'STORED'
  | 'BOOKED'
  | 'READY_FOR_HANDOVER'
  | 'COLLECTED'
  | 'DELIVERY_SCHEDULED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'RETURNED_TO_COURIER'
  | 'UNCLAIMED';

export type CourierCompany =
  | 'Amazon'
  | 'Flipkart'
  | 'Blue Dart'
  | 'Delhivery'
  | 'DTDC'
  | 'Shadowfax'
  | 'India Post'
  | 'Blinkit'
  | 'Zepto'
  | 'Swiggy Instamart'
  | 'Other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  society_id?: string;
  apartment_id?: string;
  apartment_number?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Society {
  id: string;
  name: string;
  code: string; // e.g. "GWH-BLR"
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_apartments: number;
  active: boolean;
  operating_hours: {
    start: string; // "08:00"
    end: string;   // "21:30"
  };
  slot_duration_minutes: number; // e.g. 30
  slot_capacity: number; // e.g. 4
  doorstep_delivery_enabled: boolean;
  retention_days: number; // e.g. 7
  created_at: string;
}

export interface Apartment {
  id: string;
  society_id: string;
  block: string;
  apartment_number: string; // e.g. "A-204"
  floor: number;
  primary_resident_id?: string;
  resident_names: string[];
  contact_number: string;
  created_at: string;
}

export interface Parcel {
  id: string;
  society_id: string;
  apartment_id: string;
  apartment_number: string;
  reference_number: string; // e.g. "PE-2026-A204-8921"
  tracking_number: string;
  courier_company: CourierCompany;
  recipient_name: string;
  parcel_count: number;
  photo_url?: string;
  status: ParcelStatus;
  storage_location: string; // e.g. "Bay 3 / Shelf B"
  received_by_staff_id: string;
  received_by_staff_name: string;
  received_at: string;
  collected_by_name?: string;
  collected_at?: string;
  handover_staff_id?: string;
  handover_staff_name?: string;
  handover_notes?: string;
  qr_code?: string;
  is_overdue?: boolean;
  is_disputed?: boolean;
  booking?: ParcelBooking;
  created_at: string;
  updated_at: string;
}

export interface ParcelEvent {
  id: string;
  parcel_id: string;
  status: ParcelStatus;
  title: string;
  description: string;
  actor_name: string;
  actor_role: UserRole;
  created_at: string;
}

export interface CollectionSlot {
  id: string;
  society_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "09:00"
  end_time: string; // "09:30"
  capacity: number;
  booked_count: number;
  is_available: boolean;
}

export interface ParcelBooking {
  id: string;
  parcel_id: string;
  society_id: string;
  apartment_id: string;
  resident_id: string;
  booking_type: 'COLLECTION' | 'DOORSTEP_DELIVERY';
  date: string;
  time_window: string; // e.g. "18:00 - 18:30"
  status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HandoverVerification {
  id: string;
  parcel_id: string;
  otp_hash: string;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  society_id: string;
  apartment_number?: string;
  title: string;
  message: string;
  type:
    | 'PARCEL_RECEIVED'
    | 'BOOKING_CONFIRMED'
    | 'COLLECTION_REMINDER'
    | 'PARCEL_COLLECTED'
    | 'DOORSTEP_UPDATED'
    | 'PARCEL_OVERDUE'
    | 'SUPPORT_UPDATE'
    | 'COMPLAINT_SUBMITTED'
    | 'COMPLAINT_ASSIGNED'
    | 'COMPLAINT_UPDATED'
    | 'COMPLAINT_RESOLVED';
  parcel_id?: string;
  complaint_id?: string;
  read: boolean;
  created_at: string;
}

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type ComplaintCategory =
  | 'PARCEL_DAMAGED'
  | 'DELAYED_DELIVERY'
  | 'STAFF_BEHAVIOR'
  | 'LOST_PARCEL'
  | 'WRONG_HANDOVER'
  | 'GATE_ACCESS'
  | 'OPERATING_HOURS'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ComplaintCommentAudience = 'ALL' | 'RESIDENT' | 'STAFF' | 'SOCIETY_ADMIN';

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  message: string;
  is_internal?: boolean;
  target_audience?: ComplaintCommentAudience;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  from_status?: ComplaintStatus;
  to_status: ComplaintStatus;
  changed_by_id: string;
  changed_by_name: string;
  changed_by_role: UserRole;
  notes?: string;
  created_at: string;
}

export interface Complaint {
  id: string; // e.g. "CMP-2026-A204-8921"
  society_id: string;
  apartment_id?: string;
  apartment_number: string;
  resident_id: string;
  resident_name: string;
  resident_email: string;
  resident_phone: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  attachment_url?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assigned_to_staff_id?: string;
  assigned_to_staff_name?: string;
  assigned_at?: string;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by_name?: string;
  rejection_reason?: string;
  comments: ComplaintComment[];
  status_history: ComplaintStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  society_id: string;
  resident_id: string;
  resident_name: string;
  apartment_number: string;
  parcel_id?: string;
  title: string;
  description: string;
  category: 'MISSING_PARCEL' | 'DAMAGED_PARCEL' | 'DELAYED_DELIVERY' | 'GENERAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export interface SocietyMetrics {
  totalParcelsReceived: number;
  parcelsToday: number;
  parcelsInStorage: number;
  parcelsCollectedToday: number;
  overdueParcels: number;
  collectionCompletionRate: number; // percentage
  avgStorageDurationHours: number;
  peakHour: string;
  volumeByCourier: { courier: string; count: number }[];
  dailyTrend: { date: string; received: number; collected: number }[];
  peakArrivalPeriods: { period: string; count: number }[];
}
