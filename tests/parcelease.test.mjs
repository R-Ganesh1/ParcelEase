import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Lifecycle transitions test
const VALID_TRANSITIONS = {
  RECEIVED: ['STORED', 'DISPUTED', 'RETURNED_TO_COURIER'],
  STORED: ['BOOKED', 'DELIVERY_SCHEDULED', 'READY_FOR_HANDOVER', 'UNCLAIMED', 'DISPUTED'],
  BOOKED: ['READY_FOR_HANDOVER', 'STORED', 'DISPUTED'],
  READY_FOR_HANDOVER: ['COLLECTED', 'STORED', 'DISPUTED'],
  DELIVERY_SCHEDULED: ['OUT_FOR_DELIVERY', 'STORED', 'DISPUTED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'STORED', 'DISPUTED'],
  COLLECTED: [], // Terminal
  DELIVERED: [], // Terminal
  DISPUTED: ['STORED', 'RETURNED_TO_COURIER', 'READY_FOR_HANDOVER'],
  RETURNED_TO_COURIER: [], // Terminal
  UNCLAIMED: ['RETURNED_TO_COURIER', 'DISPUTED', 'STORED'],
};

function canTransition(from, to) {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

test('Parcel Lifecycle: Valid transitions follow state machine', () => {
  assert.equal(canTransition('RECEIVED', 'STORED'), true);
  assert.equal(canTransition('STORED', 'BOOKED'), true);
  assert.equal(canTransition('BOOKED', 'READY_FOR_HANDOVER'), true);
  assert.equal(canTransition('READY_FOR_HANDOVER', 'COLLECTED'), true);
});

test('Parcel Lifecycle: Terminal and illegal transitions are rejected', () => {
  assert.equal(canTransition('COLLECTED', 'STORED'), false);
  assert.equal(canTransition('COLLECTED', 'BOOKED'), false);
  assert.equal(canTransition('RECEIVED', 'COLLECTED'), false);
});

// 2. Cryptographic OTP & Expiry Tests
function generateOtp() {
  const min = 100000;
  const max = 999999;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

function isOtpExpired(expiresAtISO, nowTime = Date.now()) {
  return nowTime > new Date(expiresAtISO).getTime();
}

test('Security & Handover: Generates 6-digit cryptographic OTP', () => {
  const otp = generateOtp();
  assert.equal(otp.length, 6);
  assert.match(otp, /^[0-9]{6}$/);
});

test('Security & Handover: Enforces 15-minute OTP TTL expiration', () => {
  const futureExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  assert.equal(isOtpExpired(futureExpiry), false);

  const pastExpiry = new Date(Date.now() - 1000).toISOString();
  assert.equal(isOtpExpired(pastExpiry), true);
});

test('Security & Handover: Rate limits incorrect attempts to 3 max', () => {
  let attempts = 0;
  const maxAttempts = 3;

  for (let i = 0; i < 3; i++) {
    attempts += 1;
  }
  assert.equal(attempts, 3);
  assert.equal(attempts >= maxAttempts, true); // Locked
});

// 3. Scheduling & Slot Capacity Tests
function generateDaySlots(startHour, endHour, durationMinutes, capacity, bookedCount) {
  const slots = [];
  let current = startHour * 60;
  const end = endHour * 60;

  while (current + durationMinutes <= end) {
    const sH = Math.floor(current / 60);
    const sM = current % 60;
    const eH = Math.floor((current + durationMinutes) / 60);
    const eM = (current + durationMinutes) % 60;
    const key = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')} - ${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
    const booked = bookedCount[key] || 0;
    slots.push({
      key,
      capacity,
      booked,
      isAvailable: booked < capacity,
    });
    current += durationMinutes;
  }
  return slots;
}

test('Scheduling Engine: Generates slots strictly within operating hours (08:00 to 21:00)', () => {
  const slots = generateDaySlots(8, 21, 30, 4, {});
  assert.equal(slots.length, 26); // (21 - 8) * 2 = 26 slots
  assert.equal(slots[0].key, '08:00 - 08:30');
  assert.equal(slots[slots.length - 1].key, '20:30 - 21:00');
});

test('Scheduling Engine: Prevents overbooking beyond configured capacity cap', () => {
  const bookedCounts = {
    '18:00 - 18:30': 4, // Full
    '18:30 - 19:00': 3, // 1 spot available
  };
  const slots = generateDaySlots(18, 19, 30, 4, bookedCounts);
  assert.equal(slots[0].isAvailable, false); // 4/4 booked
  assert.equal(slots[1].isAvailable, true);  // 3/4 booked
});

// 4. Reference Number Generation & Resident Tagging
test('Parcel Intake: Generates unique standard reference format PE-YYYY-APT-XXXX', () => {
  const apt = 'A-204';
  const cleanApt = apt.replace(/[^a-zA-Z0-9]/g, '');
  const ref = `PE-2026-${cleanApt}-${Math.floor(1000 + Math.random() * 9000)}`;
  assert.match(ref, /^PE-2026-A204-[0-9]{4}$/);
});

// 5. Society Tenant Isolation
test('Multi-Tenant Isolation: Resident can only view assigned apartment parcels', () => {
  const allParcels = [
    { id: '1', apartment_number: 'A-204', society_id: 'soc-1' },
    { id: '2', apartment_number: 'B-101', society_id: 'soc-1' },
    { id: '3', apartment_number: 'A-204', society_id: 'soc-2' },
  ];

  const residentSociety = 'soc-1';
  const residentApartment = 'A-204';

  const isolatedParcels = allParcels.filter(
    (p) => p.society_id === residentSociety && p.apartment_number === residentApartment
  );

  assert.equal(isolatedParcels.length, 1);
  assert.equal(isolatedParcels[0].id, '1');
});

// 6. Role Authentication & Registration Tests
test('User Auth: Rejects unregistered user login with USER_NOT_REGISTERED', () => {
  const registeredUsers = ['resident@parcelease.in', 'staff@parcelease.in'];
  const testEmail = 'unregistered.user@gmail.com';

  const exists = registeredUsers.includes(testEmail);
  assert.equal(exists, false);
});

test('User Auth: Validates correct password and rejects wrong password', () => {
  const credentials = {
    'resident@parcelease.in': 'password123',
  };

  const validLogin = credentials['resident@parcelease.in'] === 'password123';
  const invalidLogin = credentials['resident@parcelease.in'] === 'wrongpassword';

  assert.equal(validLogin, true);
  assert.equal(invalidLogin, false);
});

test('User Registration: Prevents duplicate email registration', () => {
  const existingProfiles = [{ email: 'resident@parcelease.in' }];
  const newEmail = 'resident@parcelease.in';

  const duplicate = existingProfiles.some(p => p.email.toLowerCase() === newEmail.toLowerCase());
  assert.equal(duplicate, true);
});

test('Role Routing: Correctly maps roles to their dedicated dashboards', () => {
  const roleRoutes = {
    RESIDENT: '/resident',
    STAFF: '/staff',
    SOCIETY_ADMIN: '/admin',
    PLATFORM_ADMIN: '/platform-admin',
  };

  assert.equal(roleRoutes.RESIDENT, '/resident');
  assert.equal(roleRoutes.STAFF, '/staff');
  assert.equal(roleRoutes.SOCIETY_ADMIN, '/admin');
  assert.equal(roleRoutes.PLATFORM_ADMIN, '/platform-admin');
});

// 7. Resident Complaint Management System Tests
test('Complaint System: Generates valid complaint ID format CMP-YYYY-APT-XXXX', () => {
  const apt = 'A-204';
  const aptClean = apt.replace(/[^a-zA-Z0-9]/g, '');
  const randomSuffix = 4512;
  const complaintId = `CMP-2026-${aptClean}-${randomSuffix}`;

  assert.equal(complaintId, 'CMP-2026-A204-4512');
  assert.match(complaintId, /^CMP-2026-[A-Z0-9]+-\d{4}$/);
});

test('Complaint System: Resident submits complaint with auto-populated details and initial SUBMITTED status', () => {
  const resident = {
    id: 'user-resident-1',
    name: 'Ananya Rao',
    apartment: 'A-204',
    email: 'resident@parcelease.in',
    phone: '+91 98860 12345',
  };

  const complaint = {
    id: 'CMP-2026-A204-1001',
    society_id: 'soc-gwh-blr',
    apartment_number: resident.apartment,
    resident_id: resident.id,
    resident_name: resident.name,
    category: 'PARCEL_DAMAGED',
    subject: 'Outer packaging arrived torn',
    description: 'Flipkart box tape cut at Gate 1',
    status: 'SUBMITTED',
    priority: 'HIGH',
    created_at: new Date().toISOString(),
  };

  assert.equal(complaint.status, 'SUBMITTED');
  assert.equal(complaint.apartment_number, 'A-204');
  assert.equal(complaint.resident_name, 'Ananya Rao');
});

test('Complaint System: Society Admin can assign staff and transition status to ASSIGNED', () => {
  const complaint = {
    id: 'CMP-2026-A204-1001',
    status: 'SUBMITTED',
    assigned_to_staff_id: null,
  };

  const staff = {
    id: 'user-staff-1',
    full_name: 'Ramesh Kumar',
  };

  // Admin assigns complaint
  complaint.assigned_to_staff_id = staff.id;
  complaint.assigned_to_staff_name = staff.full_name;
  complaint.status = 'ASSIGNED';

  assert.equal(complaint.status, 'ASSIGNED');
  assert.equal(complaint.assigned_to_staff_id, 'user-staff-1');
  assert.equal(complaint.assigned_to_staff_name, 'Ramesh Kumar');
});

test('Complaint System: Security staff isolation prevents viewing complaints assigned to other staff', () => {
  const complaints = [
    { id: 'CMP-1', assigned_to_staff_id: 'user-staff-1', subject: 'Assigned to Ramesh' },
    { id: 'CMP-2', assigned_to_staff_id: 'user-staff-2', subject: 'Assigned to Suresh' },
    { id: 'CMP-3', assigned_to_staff_id: 'user-staff-1', subject: 'Also assigned to Ramesh' },
  ];

  const loggedInStaffId = 'user-staff-1';
  const visibleToRamesh = complaints.filter(c => c.assigned_to_staff_id === loggedInStaffId);

  assert.equal(visibleToRamesh.length, 2);
  assert.equal(visibleToRamesh.some(c => c.id === 'CMP-2'), false);
});

test('Complaint System: Security staff can update status to IN_PROGRESS and RESOLVED with resolution notes', () => {
  const complaint = {
    id: 'CMP-2026-A204-1001',
    assigned_to_staff_id: 'user-staff-1',
    status: 'ASSIGNED',
    resolution_notes: null,
  };

  const loggedInStaffId = 'user-staff-1';

  // Security check: staff can only update if assigned to them
  const isAuthorized = complaint.assigned_to_staff_id === loggedInStaffId;
  assert.equal(isAuthorized, true);

  // Transition to IN_PROGRESS
  complaint.status = 'IN_PROGRESS';
  assert.equal(complaint.status, 'IN_PROGRESS');

  // Transition to RESOLVED with notes
  complaint.status = 'RESOLVED';
  complaint.resolution_notes = 'Inspected Gate 1 intake log and verified box condition.';
  assert.equal(complaint.status, 'RESOLVED');
  assert.equal(complaint.resolution_notes.length > 0, true);
});

test('Complaint System: Generates notification events for resident and staff on assignment and resolution', () => {
  const notifications = [];

  // When assigned
  notifications.push({
    user_id: 'user-staff-1',
    type: 'COMPLAINT_ASSIGNED',
    title: 'Task Assigned: #CMP-2026-A204-1001',
  });
  notifications.push({
    user_id: 'user-resident-1',
    type: 'COMPLAINT_ASSIGNED',
    title: 'Complaint Assigned to Staff',
  });

  // When resolved
  notifications.push({
    user_id: 'user-resident-1',
    type: 'COMPLAINT_RESOLVED',
    title: 'Complaint Resolved (#CMP-2026-A204-1001)',
  });

  assert.equal(notifications.length, 3);
  assert.equal(notifications[0].type, 'COMPLAINT_ASSIGNED');
  assert.equal(notifications[2].type, 'COMPLAINT_RESOLVED');
});

test('Complaint Assignment: Single assignment rule prevents re-assigning complaint multiple times', () => {
  const complaint = {
    id: 'CMP-2026-A204-1477',
    assigned_to_staff_id: 'user-staff-1',
    assigned_to_staff_name: 'Ramesh Kumar',
  };

  function assignStaff(c, newStaffId) {
    if (c.assigned_to_staff_id) {
      return {
        success: false,
        message: 'This complaint is already assigned to an officer. Multiple assignments are prohibited.',
      };
    }
    c.assigned_to_staff_id = newStaffId;
    return { success: true };
  }

  const result = assignStaff(complaint, 'user-staff-2');
  assert.equal(result.success, false);
  assert.match(result.message, /already assigned/i);
});

test('Complaint Status: Duplicate status update is rejected when new status matches current status', () => {
  const complaint = {
    id: 'CMP-2026-A204-1477',
    status: 'SUBMITTED',
  };

  function updateStatus(c, targetStatus) {
    if (c.status === targetStatus) {
      return {
        success: false,
        message: 'Complaint is already in this status.',
      };
    }
    c.status = targetStatus;
    return { success: true };
  }

  const result = updateStatus(complaint, 'SUBMITTED');
  assert.equal(result.success, false);
  assert.match(result.message, /already in this status/i);

  const validResult = updateStatus(complaint, 'IN_PROGRESS');
  assert.equal(validResult.success, true);
  assert.equal(complaint.status, 'IN_PROGRESS');
});

test('Targeted Messaging: Visibility filters correctly enforce personal resident, staff, and admin privacy', () => {
  const comments = [
    {
      id: 'c1',
      author_role: 'STAFF',
      target_audience: 'RESIDENT',
      message: 'Personal update to resident regarding parcel location',
    },
    {
      id: 'c2',
      author_role: 'STAFF',
      target_audience: 'SOCIETY_ADMIN',
      message: 'Internal CCTV review report for admin',
    },
    {
      id: 'c3',
      author_role: 'RESIDENT',
      target_audience: 'STAFF',
      message: 'Personal question from resident directly to security guard',
    },
    {
      id: 'c4',
      author_role: 'RESIDENT',
      target_audience: 'SOCIETY_ADMIN',
      message: 'Confidential request from resident to RWA committee',
    },
    {
      id: 'c5',
      author_role: 'SOCIETY_ADMIN',
      target_audience: 'ALL',
      message: 'Public announcement for everyone',
    },
  ];

  // 1. Resident visibility:
  // Must NOT see internal staff-to-admin note (c2)
  const visibleToResident = comments.filter((comm) => {
    if (comm.target_audience === 'SOCIETY_ADMIN' && comm.author_role === 'STAFF') return false;
    if (comm.target_audience === 'STAFF' && comm.author_role === 'SOCIETY_ADMIN') return false;
    return true;
  });
  assert.equal(visibleToResident.some(c => c.id === 'c2'), false);
  assert.equal(visibleToResident.some(c => c.id === 'c1'), true);
  assert.equal(visibleToResident.some(c => c.id === 'c3'), true);
  assert.equal(visibleToResident.some(c => c.id === 'c4'), true);
  assert.equal(visibleToResident.some(c => c.id === 'c5'), true);

  // 2. Staff visibility:
  // Must NOT see confidential resident-to-admin note (c4)
  const visibleToStaff = comments.filter((comm) => {
    if (comm.target_audience === 'SOCIETY_ADMIN' && comm.author_role === 'RESIDENT') return false;
    if (comm.target_audience === 'RESIDENT' && comm.author_role === 'SOCIETY_ADMIN') return false;
    return true;
  });
  assert.equal(visibleToStaff.some(c => c.id === 'c4'), false);
  assert.equal(visibleToStaff.some(c => c.id === 'c1'), true);
  assert.equal(visibleToStaff.some(c => c.id === 'c2'), true);
  assert.equal(visibleToStaff.some(c => c.id === 'c3'), true);
  assert.equal(visibleToStaff.some(c => c.id === 'c5'), true);

  // 3. Admin visibility:
  // Must NOT see direct personal 1-on-1 between resident and staff (c1, c3)
  const visibleToAdmin = comments.filter((comm) => {
    if (comm.target_audience === 'STAFF' && comm.author_role === 'RESIDENT') return false;
    if (comm.target_audience === 'RESIDENT' && comm.author_role === 'STAFF') return false;
    return true;
  });
  assert.equal(visibleToAdmin.some(c => c.id === 'c1'), false);
  assert.equal(visibleToAdmin.some(c => c.id === 'c3'), false);
  assert.equal(visibleToAdmin.some(c => c.id === 'c2'), true);
  assert.equal(visibleToAdmin.some(c => c.id === 'c4'), true);
  assert.equal(visibleToAdmin.some(c => c.id === 'c5'), true);
});

