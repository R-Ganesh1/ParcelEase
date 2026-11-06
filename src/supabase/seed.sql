-- ==============================================================================
-- ParcelEase Seed Data: Greenwood Heights RWA, Bengaluru
-- Realistic Indian Apartment Community Test Dataset
-- ==============================================================================

-- 1. Insert Society
INSERT INTO societies (
  id, name, code, address, city, state, pincode, total_apartments, active,
  operating_hours_start, operating_hours_end, slot_duration_minutes, slot_capacity, doorstep_delivery_enabled, retention_days
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Greenwood Heights RWA',
  'GWH-BLR',
  'Survey 42/1, Sarjapur Main Road, Bellandur',
  'Bengaluru',
  'Karnataka',
  '560102',
  180,
  true,
  '08:00:00',
  '21:30:00',
  30,
  4,
  true,
  7
) ON CONFLICT (code) DO NOTHING;

-- 2. Insert Profiles
-- Resident: Ananya Rao (Apartment A-204)
INSERT INTO profiles (id, email, full_name, phone, role, society_id) VALUES
('22222222-2222-2222-2222-222222222222', 'resident@parcelease.in', 'Ananya Rao', '+91 98860 12345', 'RESIDENT', '11111111-1111-1111-1111-111111111111'),
-- Staff Guard: Ramesh Kumar
('33333333-3333-3333-3333-333333333333', 'staff@parcelease.in', 'Ramesh Kumar', '+91 98450 67890', 'STAFF', '11111111-1111-1111-1111-111111111111'),
-- Society Admin: Dr. Arvind Sharma (RWA President)
('44444444-4444-4444-4444-444444444444', 'admin@parcelease.in', 'Dr. Arvind Sharma', '+91 98110 54321', 'SOCIETY_ADMIN', '11111111-1111-1111-1111-111111111111'),
-- Platform Super Admin: Vikram Malhotra
('55555555-5555-5555-5555-555555555555', 'platform@parcelease.in', 'Vikram Malhotra', '+91 99000 88888', 'PLATFORM_ADMIN', NULL)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Apartments
INSERT INTO apartments (id, society_id, block, apartment_number, floor, contact_number) VALUES
('a0000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', 'A', 'A-101', 1, '+91 98000 11101'),
('a0000000-0000-0000-0000-000000000102', '11111111-1111-1111-1111-111111111111', 'A', 'A-102', 1, '+91 98000 11102'),
('a0000000-0000-0000-0000-000000000203', '11111111-1111-1111-1111-111111111111', 'A', 'A-203', 2, '+91 98000 11203'),
('a0000000-0000-0000-0000-000000000204', '11111111-1111-1111-1111-111111111111', 'A', 'A-204', 2, '+91 98860 12345'),
('a0000000-0000-0000-0000-000000000301', '11111111-1111-1111-1111-111111111111', 'A', 'A-301', 3, '+91 98000 11301'),
('b0000000-0000-0000-0000-000000000101', '11111111-1111-1111-1111-111111111111', 'B', 'B-101', 1, '+91 98000 22101'),
('b0000000-0000-0000-0000-000000000202', '11111111-1111-1111-1111-111111111111', 'B', 'B-202', 2, '+91 98000 22202')
ON CONFLICT (society_id, apartment_number) DO NOTHING;

-- 4. Society Memberships
INSERT INTO society_memberships (society_id, apartment_id, resident_id, is_primary_resident, status) VALUES
('11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000204', '22222222-2222-2222-2222-222222222222', true, 'ACTIVE')
ON CONFLICT (society_id, apartment_id, resident_id) DO NOTHING;

-- 5. Society Staff
INSERT INTO society_staff (society_id, user_id, shift_timing, is_active) VALUES
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Day Shift (08:00 - 20:00)', true)
ON CONFLICT (society_id, user_id) DO NOTHING;

-- 6. Subscription Plans
INSERT INTO subscription_plans (name, code, price_per_month_inr, max_apartments, doorstep_delivery_included, features) VALUES
('Starter Society', 'STARTER', 2999, 100, false, '["Parcel intake barcode tracking", "Resident in-app alerts", "Self-collection OTP verification", "Basic reporting"]'::jsonb),
('Premium Community', 'GROWTH', 5999, 300, true, '["Everything in Starter", "Scheduled Doorstep Delivery routing", "SMS & WhatsApp alerts", "Custom retention policies", "Peak hours analytics"]'::jsonb),
('Enterprise Townships', 'ENTERPRISE', 11999, 1000, true, '["Everything in Growth", "Smart Parcel Locker API integration", "Multi-gate guard sync", "Dedicated account manager", "Custom SLA"]'::jsonb)
ON CONFLICT (code) DO NOTHING;
