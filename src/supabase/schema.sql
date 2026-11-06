-- ==============================================================================
-- ParcelEase Production Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS) & Multi-Tenant Isolation
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('RESIDENT', 'STAFF', 'SOCIETY_ADMIN', 'PLATFORM_ADMIN');

CREATE TYPE parcel_status AS ENUM (
  'RECEIVED',
  'STORED',
  'BOOKED',
  'READY_FOR_HANDOVER',
  'COLLECTED',
  'DELIVERY_SCHEDULED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DISPUTED',
  'RETURNED_TO_COURIER',
  'UNCLAIMED'
);

CREATE TYPE courier_company AS ENUM (
  'Amazon',
  'Flipkart',
  'Blue Dart',
  'Delhivery',
  'DTDC',
  'Shadowfax',
  'India Post',
  'Blinkit',
  'Zepto',
  'Swiggy Instamart',
  'Other'
);

CREATE TYPE booking_type AS ENUM ('COLLECTION', 'DOORSTEP_DELIVERY');
CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED');
CREATE TYPE notification_type AS ENUM (
  'PARCEL_RECEIVED',
  'BOOKING_CONFIRMED',
  'COLLECTION_REMINDER',
  'PARCEL_COLLECTED',
  'DOORSTEP_UPDATED',
  'PARCEL_OVERDUE',
  'SUPPORT_UPDATE'
);

-- 2. SOCIETIES TABLE
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'GWH-BLR'
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  total_apartments INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  operating_hours_start TIME NOT NULL DEFAULT '08:00:00',
  operating_hours_end TIME NOT NULL DEFAULT '21:30:00',
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  slot_capacity INT NOT NULL DEFAULT 4,
  doorstep_delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  retention_days INT NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- matches auth.users.id
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role user_role NOT NULL DEFAULT 'RESIDENT',
  society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. APARTMENTS TABLE
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  block VARCHAR(50) NOT NULL,
  apartment_number VARCHAR(50) NOT NULL, -- e.g., 'A-204'
  floor INT NOT NULL DEFAULT 1,
  contact_number VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_society_apartment UNIQUE (society_id, apartment_number)
);

-- 5. SOCIETY MEMBERSHIPS (Residents linked to apartments)
CREATE TABLE society_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_primary_resident BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PENDING, INACTIVE
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_membership UNIQUE (society_id, apartment_id, resident_id)
);

-- 6. SOCIETY STAFF TABLE
CREATE TABLE society_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shift_timing VARCHAR(100) DEFAULT 'Day Shift (08:00 - 20:00)',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_society_staff UNIQUE (society_id, user_id)
);

-- 7. PARCELS TABLE
CREATE TABLE parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE RESTRICT,
  reference_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'PE-2026-A204-8921'
  tracking_number VARCHAR(150) NOT NULL,
  courier_company courier_company NOT NULL DEFAULT 'Amazon',
  recipient_name VARCHAR(255) NOT NULL,
  parcel_count INT NOT NULL DEFAULT 1 CHECK (parcel_count > 0),
  photo_url TEXT,
  status parcel_status NOT NULL DEFAULT 'RECEIVED',
  storage_location VARCHAR(100) NOT NULL DEFAULT 'Parcel Bay 1',
  received_by_staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collected_by_name VARCHAR(255),
  collected_at TIMESTAMPTZ,
  handover_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  handover_notes TEXT,
  qr_code TEXT,
  is_overdue BOOLEAN NOT NULL DEFAULT false,
  is_disputed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PARCEL EVENTS (Immutable audit trail of status changes)
CREATE TABLE parcel_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  status parcel_status NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. COLLECTION SLOTS TABLE
CREATE TABLE collection_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 4 CHECK (capacity > 0),
  booked_count INT NOT NULL DEFAULT 0 CHECK (booked_count >= 0 AND booked_count <= capacity),
  is_available BOOLEAN GENERATED ALWAYS AS (booked_count < capacity) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_society_slot UNIQUE (society_id, slot_date, start_time, end_time)
);

-- 10. PARCEL BOOKINGS TABLE
CREATE TABLE parcel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE RESTRICT,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  slot_id UUID REFERENCES collection_slots(id) ON DELETE SET NULL,
  booking_type booking_type NOT NULL DEFAULT 'COLLECTION',
  booking_date DATE NOT NULL,
  time_window VARCHAR(100) NOT NULL, -- e.g., '18:00 - 18:30'
  status booking_status NOT NULL DEFAULT 'CONFIRMED',
  delivery_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. HANDOVER VERIFICATIONS (Single-use rate-limited cryptographic OTP)
CREATE TABLE handover_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcel_id UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  otp_hash VARCHAR(255) NOT NULL, -- SHA-256 hash
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  parcel_id UUID REFERENCES parcels(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SUPPORT TICKETS
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parcel_id UUID REFERENCES parcels(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'MISSING_PARCEL',
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SOCIETY SETTINGS
CREATE TABLE society_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID UNIQUE NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  auto_overdue_threshold_hours INT NOT NULL DEFAULT 168, -- 7 days
  sms_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  whatsapp_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  require_photo_on_intake BOOLEAN NOT NULL DEFAULT false,
  allow_contactless_pickup BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SUBSCRIPTION PLANS
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- STARTER, GROWTH, ENTERPRISE
  price_per_month_inr INT NOT NULL,
  max_apartments INT NOT NULL,
  doorstep_delivery_included BOOLEAN NOT NULL DEFAULT false,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. SOCIETY SUBSCRIPTIONS
CREATE TABLE society_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. AUDIT LOGS (Security & Compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-TRAFFIC QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_parcels_society_status ON parcels(society_id, status);
CREATE INDEX idx_parcels_apartment ON parcels(apartment_id);
CREATE INDEX idx_parcels_reference ON parcels(reference_number);
CREATE INDEX idx_parcels_tracking ON parcels(tracking_number);
CREATE INDEX idx_parcels_received_at ON parcels(received_at DESC);
CREATE INDEX idx_collection_slots_lookup ON collection_slots(society_id, slot_date, is_available);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_memberships_lookup ON society_memberships(society_id, resident_id);
CREATE INDEX idx_events_parcel ON parcel_events(parcel_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Resident profile policy
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Parcel policies
CREATE POLICY "Residents can view parcels for their apartment"
  ON parcels FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM society_memberships sm
      WHERE sm.resident_id = auth.uid()
      AND sm.apartment_id = parcels.apartment_id
    )
  );

CREATE POLICY "Staff can view and manage parcels in their society"
  ON parcels FOR ALL USING (
    EXISTS (
      SELECT 1 FROM society_staff ss
      WHERE ss.user_id = auth.uid()
      AND ss.society_id = parcels.society_id
      AND ss.is_active = true
    )
  );

CREATE POLICY "Society Admins have full access to society parcels"
  ON parcels FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.society_id = parcels.society_id
      AND p.role = 'SOCIETY_ADMIN'
    )
  );

-- Notification policy
CREATE POLICY "Users can only view their own notifications"
  ON notifications FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 18. RESIDENT COMPLAINT MANAGEMENT SYSTEM
-- ==============================================================================
CREATE TYPE complaint_status AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED'
);

CREATE TYPE complaint_category AS ENUM (
  'PARCEL_DAMAGED',
  'DELAYED_DELIVERY',
  'STAFF_BEHAVIOR',
  'LOST_PARCEL',
  'WRONG_HANDOVER',
  'GATE_ACCESS',
  'OPERATING_HOURS',
  'OTHER'
);

CREATE TYPE complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE complaints (
  id VARCHAR(50) PRIMARY KEY, -- e.g. CMP-2026-A204-1001
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
  apartment_number VARCHAR(50) NOT NULL,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resident_name VARCHAR(255) NOT NULL,
  resident_email VARCHAR(255) NOT NULL,
  resident_phone VARCHAR(20) NOT NULL,
  category complaint_category NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  status complaint_status NOT NULL DEFAULT 'SUBMITTED',
  priority complaint_priority NOT NULL DEFAULT 'MEDIUM',
  assigned_to_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to_staff_name VARCHAR(255),
  assigned_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by_name VARCHAR(255),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE complaint_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(50) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_role user_role NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE complaint_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(50) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  from_status complaint_status,
  to_status complaint_status NOT NULL,
  changed_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by_name VARCHAR(255) NOT NULL,
  changed_by_role user_role NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for frequent queries
CREATE INDEX idx_complaints_society ON complaints(society_id);
CREATE INDEX idx_complaints_resident ON complaints(resident_id);
CREATE INDEX idx_complaints_assigned_staff ON complaints(assigned_to_staff_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaint_comments_complaint ON complaint_comments(complaint_id);
CREATE INDEX idx_complaint_history_complaint ON complaint_status_history(complaint_id);

-- RLS Policies for Complaint Isolation
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_status_history ENABLE ROW LEVEL SECURITY;

-- Residents can view their own complaints
CREATE POLICY "Residents view own complaints"
  ON complaints FOR SELECT USING (resident_id = auth.uid());

-- Residents can insert new complaints for their apartment
CREATE POLICY "Residents insert own complaints"
  ON complaints FOR INSERT WITH CHECK (resident_id = auth.uid());

-- Security staff can only view and update complaints specifically assigned to them
CREATE POLICY "Staff view assigned complaints"
  ON complaints FOR SELECT USING (
    assigned_to_staff_id = auth.uid()
  );

CREATE POLICY "Staff update assigned complaints"
  ON complaints FOR UPDATE USING (
    assigned_to_staff_id = auth.uid()
  );

-- Society admins can view and manage all complaints within their society
CREATE POLICY "Admins manage society complaints"
  ON complaints FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.society_id = complaints.society_id
      AND p.role = 'SOCIETY_ADMIN'
    )
  );

