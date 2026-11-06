import QRCode from 'qrcode';
import {
  Profile,
  Society,
  Apartment,
  Parcel,
  ParcelEvent,
  ParcelBooking,
  AppNotification,
  SupportTicket,
  SocietyMetrics,
  CourierCompany,
  UserRole,
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintComment,
  ComplaintCommentAudience,
  ComplaintStatusHistory,
} from '@/types';
import { canTransitionParcel, generateDaySlots } from '@/lib/scheduling/engine';
import { generateOtp, hashOtp, isOtpExpired } from '@/lib/security/otp';

// Initial Mock Seed Data
const INITIAL_SOCIETY: Society = {
  id: 'soc-gwh-blr',
  name: 'Greenwood Heights RWA',
  code: 'GWH-BLR',
  address: 'Survey 42/1, Sarjapur Main Road, Bellandur',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560102',
  total_apartments: 180,
  active: true,
  operating_hours: {
    start: '08:00',
    end: '21:30',
  },
  slot_duration_minutes: 30,
  slot_capacity: 4,
  doorstep_delivery_enabled: true,
  retention_days: 7,
  created_at: '2026-01-15T10:00:00.000Z',
};

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-resident-1',
    email: 'resident@parcelease.in',
    full_name: 'Ananya Rao',
    phone: '+91 98860 12345',
    role: 'RESIDENT',
    society_id: 'soc-gwh-blr',
    apartment_id: 'apt-a-204',
    apartment_number: 'A-204',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'user-staff-1',
    email: 'staff@parcelease.in',
    full_name: 'Ramesh Kumar',
    phone: '+91 98450 67890',
    role: 'STAFF',
    society_id: 'soc-gwh-blr',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'user-admin-1',
    email: 'admin@parcelease.in',
    full_name: 'Dr. Arvind Sharma',
    phone: '+91 98110 54321',
    role: 'SOCIETY_ADMIN',
    society_id: 'soc-gwh-blr',
    created_at: '2026-01-15T10:00:00.000Z',
    updated_at: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user-platform-1',
    email: 'platform@parcelease.in',
    full_name: 'Vikram Malhotra',
    phone: '+91 99000 88888',
    role: 'PLATFORM_ADMIN',
    created_at: '2026-01-01T10:00:00.000Z',
    updated_at: '2026-01-01T10:00:00.000Z',
  },
];

const INITIAL_APARTMENTS: Apartment[] = [
  { id: 'apt-a-101', society_id: 'soc-gwh-blr', block: 'A', apartment_number: 'A-101', floor: 1, resident_names: ['Sunil Verma'], contact_number: '+91 98000 11101', created_at: '2026-01-15T10:00:00.000Z' },
  { id: 'apt-a-102', society_id: 'soc-gwh-blr', block: 'A', apartment_number: 'A-102', floor: 1, resident_names: ['Pooja Hegde'], contact_number: '+91 98000 11102', created_at: '2026-01-15T10:00:00.000Z' },
  { id: 'apt-a-203', society_id: 'soc-gwh-blr', block: 'A', apartment_number: 'A-203', floor: 2, resident_names: ['Karthik Raman'], contact_number: '+91 98000 11203', created_at: '2026-01-15T10:00:00.000Z' },
  { id: 'apt-a-204', society_id: 'soc-gwh-blr', block: 'A', apartment_number: 'A-204', floor: 2, primary_resident_id: 'user-resident-1', resident_names: ['Ananya Rao', 'Dev Rao'], contact_number: '+91 98860 12345', created_at: '2026-01-15T10:00:00.000Z' },
  { id: 'apt-a-301', society_id: 'soc-gwh-blr', block: 'A', apartment_number: 'A-301', floor: 3, resident_names: ['Meera Nambiar'], contact_number: '+91 98000 11301', created_at: '2026-01-15T10:00:00.000Z' },
  { id: 'apt-b-101', society_id: 'soc-gwh-blr', block: 'B', apartment_number: 'B-101', floor: 1, resident_names: ['Rajesh Iyer'], contact_number: '+91 98000 22101', created_at: '2026-01-15T10:00:00.000Z' },
  { id: 'apt-b-202', society_id: 'soc-gwh-blr', block: 'B', apartment_number: 'B-202', floor: 2, resident_names: ['Tanvi Sethi'], contact_number: '+91 98000 22202', created_at: '2026-01-15T10:00:00.000Z' },
];

const INITIAL_PARCELS: Parcel[] = [
  {
    id: 'parcel-101',
    society_id: 'soc-gwh-blr',
    apartment_id: 'apt-a-204',
    apartment_number: 'A-204',
    reference_number: 'PE-2026-A204-4190',
    tracking_number: 'FMPC0987654321',
    courier_company: 'Flipkart',
    recipient_name: 'Ananya Rao',
    parcel_count: 1,
    status: 'STORED',
    storage_location: 'Bay 2 / Shelf C',
    received_by_staff_id: 'user-staff-1',
    received_by_staff_name: 'Ramesh Kumar (Gate 1)',
    received_at: '2026-11-01T09:30:00.000Z',
    created_at: '2026-11-01T09:30:00.000Z',
    updated_at: '2026-11-01T09:30:00.000Z',
  },
  {
    id: 'parcel-102',
    society_id: 'soc-gwh-blr',
    apartment_id: 'apt-a-204',
    apartment_number: 'A-204',
    reference_number: 'PE-2026-A204-7712',
    tracking_number: 'BLUEDART-882910',
    courier_company: 'Blue Dart',
    recipient_name: 'Ananya Rao',
    parcel_count: 2,
    status: 'COLLECTED',
    storage_location: 'Bay 1 / Shelf A',
    received_by_staff_id: 'user-staff-1',
    received_by_staff_name: 'Ramesh Kumar (Gate 1)',
    received_at: '2026-10-31T11:15:00.000Z',
    collected_by_name: 'Ananya Rao',
    collected_at: '2026-10-31T18:45:00.000Z',
    handover_staff_id: 'user-staff-1',
    handover_staff_name: 'Ramesh Kumar',
    created_at: '2026-10-31T11:15:00.000Z',
    updated_at: '2026-10-31T18:45:00.000Z',
  },
  {
    id: 'parcel-103',
    society_id: 'soc-gwh-blr',
    apartment_id: 'apt-b-101',
    apartment_number: 'B-101',
    reference_number: 'PE-2026-B101-3329',
    tracking_number: 'AWB-DEL-992019',
    courier_company: 'Delhivery',
    recipient_name: 'Rajesh Iyer',
    parcel_count: 1,
    status: 'STORED',
    storage_location: 'Bay 3 / Shelf D',
    received_by_staff_id: 'user-staff-1',
    received_by_staff_name: 'Ramesh Kumar (Gate 1)',
    received_at: '2026-10-24T14:00:00.000Z', // > 7 days ago, overdue
    is_overdue: true,
    created_at: '2026-10-24T14:00:00.000Z',
    updated_at: '2026-10-24T14:00:00.000Z',
  },
];

const INITIAL_EVENTS: ParcelEvent[] = [
  {
    id: 'evt-1',
    parcel_id: 'parcel-101',
    status: 'RECEIVED',
    title: 'Parcel Received at Gate 1',
    description: 'Received by Ramesh Kumar from Flipkart courier executive.',
    actor_name: 'Ramesh Kumar',
    actor_role: 'STAFF',
    created_at: '2026-11-01T09:30:00.000Z',
  },
  {
    id: 'evt-2',
    parcel_id: 'parcel-101',
    status: 'STORED',
    title: 'Stored in Bay 2',
    description: 'Placed on Shelf C awaiting resident booking or collection.',
    actor_name: 'Ramesh Kumar',
    actor_role: 'STAFF',
    created_at: '2026-11-01T09:35:00.000Z',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'user-resident-1',
    society_id: 'soc-gwh-blr',
    apartment_number: 'A-204',
    title: 'New Parcel Received',
    message: 'Your Flipkart shipment (PE-2026-A204-4190) has been safely received at Gate 1. You can schedule a pickup or request doorstep delivery.',
    type: 'PARCEL_RECEIVED',
    parcel_id: 'parcel-101',
    read: false,
    created_at: '2026-11-01T09:35:00.000Z',
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-A204-1001',
    society_id: 'soc-gwh-blr',
    apartment_number: 'A-204',
    resident_id: 'user-resident-1',
    resident_name: 'Ananya Rao',
    resident_email: 'resident@parcelease.in',
    resident_phone: '+91 98860 12345',
    category: 'PARCEL_DAMAGED',
    subject: 'Outer packaging of Amazon parcel arrived torn with security tape cut',
    description: 'My parcel PE-2026-A204-4190 arrived at Gate 1 with outer cardboard flap clearly ripped. Please verify whether the box was received in this condition from the delivery executive.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigned_to_staff_id: 'user-staff-1',
    assigned_to_staff_name: 'Ramesh Kumar',
    assigned_at: '2026-11-01T10:15:00.000Z',
    comments: [
      {
        id: 'comm-1',
        complaint_id: 'CMP-2026-A204-1001',
        author_id: 'user-admin-1',
        author_name: 'Dr. Arvind Sharma',
        author_role: 'SOCIETY_ADMIN',
        message: 'Assigned to Gate 1 security guard Ramesh Kumar to verify incoming courier handover notes and inspect Gate 1 CCTV footage.',
        created_at: '2026-11-01T10:15:00.000Z',
      },
      {
        id: 'comm-2',
        complaint_id: 'CMP-2026-A204-1001',
        author_id: 'user-staff-1',
        author_name: 'Ramesh Kumar',
        author_role: 'STAFF',
        message: 'Checked intake records. Amazon delivery executive handed over box with torn tape already logged at 09:30 AM. Reviewing CCTV angle now.',
        created_at: '2026-11-01T10:30:00.000Z',
      },
    ],
    status_history: [
      {
        id: 'hist-1',
        complaint_id: 'CMP-2026-A204-1001',
        to_status: 'SUBMITTED',
        changed_by_id: 'user-resident-1',
        changed_by_name: 'Ananya Rao',
        changed_by_role: 'RESIDENT',
        notes: 'Complaint submitted by resident',
        created_at: '2026-11-01T09:50:00.000Z',
      },
      {
        id: 'hist-2',
        complaint_id: 'CMP-2026-A204-1001',
        from_status: 'SUBMITTED',
        to_status: 'ASSIGNED',
        changed_by_id: 'user-admin-1',
        changed_by_name: 'Dr. Arvind Sharma',
        changed_by_role: 'SOCIETY_ADMIN',
        notes: 'Assigned to security guard Ramesh Kumar',
        created_at: '2026-11-01T10:15:00.000Z',
      },
      {
        id: 'hist-3',
        complaint_id: 'CMP-2026-A204-1001',
        from_status: 'ASSIGNED',
        to_status: 'IN_PROGRESS',
        changed_by_id: 'user-staff-1',
        changed_by_name: 'Ramesh Kumar',
        changed_by_role: 'STAFF',
        notes: 'Security guard commenced investigation',
        created_at: '2026-11-01T10:30:00.000Z',
      },
    ],
    created_at: '2026-11-01T09:50:00.000Z',
    updated_at: '2026-11-01T10:30:00.000Z',
  },
  {
    id: 'CMP-2026-B101-1002',
    society_id: 'soc-gwh-blr',
    apartment_number: 'B-101',
    resident_id: 'user-resident-2',
    resident_name: 'Rajesh Iyer',
    resident_email: 'rajesh@greenwood.in',
    resident_phone: '+91 98000 22101',
    category: 'DELAYED_DELIVERY',
    subject: 'Doorstep delivery slot not fulfilled during evening window',
    description: 'Requested doorstep drop-off yesterday between 7:00 PM - 7:30 PM for heavy Flipkart carton. Parcel is still in storage bay.',
    status: 'SUBMITTED',
    priority: 'MEDIUM',
    comments: [],
    status_history: [
      {
        id: 'hist-4',
        complaint_id: 'CMP-2026-B101-1002',
        to_status: 'SUBMITTED',
        changed_by_id: 'user-resident-2',
        changed_by_name: 'Rajesh Iyer',
        changed_by_role: 'RESIDENT',
        notes: 'Complaint submitted by resident',
        created_at: '2026-11-01T08:15:00.000Z',
      },
    ],
    created_at: '2026-11-01T08:15:00.000Z',
    updated_at: '2026-11-01T08:15:00.000Z',
  },
  {
    id: 'CMP-2026-A102-1003',
    society_id: 'soc-gwh-blr',
    apartment_number: 'A-102',
    resident_id: 'user-resident-3',
    resident_name: 'Pooja Hegde',
    resident_email: 'pooja@greenwood.in',
    resident_phone: '+91 98000 11102',
    category: 'WRONG_HANDOVER',
    subject: 'Parcel shelf tag mismatch between Bay 1 and Bay 2',
    description: 'Courier package was tagged with incorrect apartment number initially, leading to delay at the gate desk during pickup.',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    assigned_to_staff_id: 'user-staff-1',
    assigned_to_staff_name: 'Ramesh Kumar',
    assigned_at: '2026-10-31T11:00:00.000Z',
    resolved_at: '2026-10-31T14:30:00.000Z',
    resolved_by_name: 'Ramesh Kumar',
    resolution_notes: 'Physical shelf barcode tag re-scanned and corrected to Shelf A / Bay 1. Parcel safely handed over with verified OTP.',
    comments: [
      {
        id: 'comm-3',
        complaint_id: 'CMP-2026-A102-1003',
        author_id: 'user-staff-1',
        author_name: 'Ramesh Kumar',
        author_role: 'STAFF',
        message: 'Tag has been reprinted and fixed. Parcel placed in Bay 1 Shelf A.',
        created_at: '2026-10-31T14:30:00.000Z',
      },
    ],
    status_history: [
      {
        id: 'hist-5',
        complaint_id: 'CMP-2026-A102-1003',
        to_status: 'SUBMITTED',
        changed_by_id: 'user-resident-3',
        changed_by_name: 'Pooja Hegde',
        changed_by_role: 'RESIDENT',
        created_at: '2026-10-31T10:00:00.000Z',
      },
      {
        id: 'hist-6',
        complaint_id: 'CMP-2026-A102-1003',
        from_status: 'SUBMITTED',
        to_status: 'ASSIGNED',
        changed_by_id: 'user-admin-1',
        changed_by_name: 'Dr. Arvind Sharma',
        changed_by_role: 'SOCIETY_ADMIN',
        created_at: '2026-10-31T11:00:00.000Z',
      },
      {
        id: 'hist-7',
        complaint_id: 'CMP-2026-A102-1003',
        from_status: 'ASSIGNED',
        to_status: 'RESOLVED',
        changed_by_id: 'user-staff-1',
        changed_by_name: 'Ramesh Kumar',
        changed_by_role: 'STAFF',
        notes: 'Tag reprinted and parcel handed over with OTP verification.',
        created_at: '2026-10-31T14:30:00.000Z',
      },
    ],
    created_at: '2026-10-31T10:00:00.000Z',
    updated_at: '2026-10-31T14:30:00.000Z',
  },
];

// Single in-memory state store for Demo Mode
interface StoreState {
  society: Society;
  profiles: Profile[];
  credentials: Record<string, string>; // email -> password
  apartments: Apartment[];
  parcels: Parcel[];
  events: ParcelEvent[];
  bookings: ParcelBooking[];
  notifications: AppNotification[];
  supportTickets: SupportTicket[];
  complaints: Complaint[];
  otps: Record<string, { plainOtp: string; hash: string; expiresAt: string; attempts: number }>;
}

const DEFAULT_CREDENTIALS: Record<string, string> = {
  'resident@parcelease.in': 'password123',
  'staff@parcelease.in': 'password123',
  'admin@parcelease.in': 'password123',
  'platform@parcelease.in': 'password123',
};

let store: StoreState = {
  society: { ...INITIAL_SOCIETY },
  profiles: [...INITIAL_PROFILES],
  credentials: { ...DEFAULT_CREDENTIALS },
  apartments: [...INITIAL_APARTMENTS],
  parcels: [...INITIAL_PARCELS],
  events: [...INITIAL_EVENTS],
  bookings: [],
  notifications: [...INITIAL_NOTIFICATIONS],
  supportTickets: [],
  complaints: [...INITIAL_COMPLAINTS],
  otps: {},
};

export class MockDatabase {
  // Reset store to fresh state if needed
  static reset() {
    store = {
      society: { ...INITIAL_SOCIETY },
      profiles: [...INITIAL_PROFILES],
      credentials: { ...DEFAULT_CREDENTIALS },
      apartments: [...INITIAL_APARTMENTS],
      parcels: [...INITIAL_PARCELS],
      events: [...INITIAL_EVENTS],
      bookings: [],
      notifications: [...INITIAL_NOTIFICATIONS],
      supportTickets: [],
      complaints: [...INITIAL_COMPLAINTS],
      otps: {},
    };
  }

  static getSociety(): Society {
    return store.society;
  }

  static getProfiles(): Profile[] {
    return store.profiles;
  }

  static getProfileById(id: string): Profile | undefined {
    return store.profiles.find((p) => p.id === id);
  }

  static getUserByEmail(email: string): Profile | undefined {
    const normalized = email.trim().toLowerCase();
    return store.profiles.find((p) => p.email.toLowerCase() === normalized);
  }

  static registerUser(data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: UserRole;
    society_id?: string;
    apartment_number?: string;
  }): { success: boolean; profile?: Profile; error?: string } {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if user already registered
    const existing = store.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account is already registered with this email address. Please login.',
      };
    }

    const nowISO = new Date().toISOString();
    const newId = `user-${data.role.toLowerCase()}-${Date.now()}`;

    // If resident and apartment provided, associate or add unit
    let aptId = undefined;
    if (data.role === 'RESIDENT' && data.apartment_number) {
      const existingApt = store.apartments.find(
        (a) => a.apartment_number.toUpperCase() === data.apartment_number!.toUpperCase()
      );
      if (existingApt) {
        aptId = existingApt.id;
        if (!existingApt.resident_names.includes(data.full_name)) {
          existingApt.resident_names.push(data.full_name);
        }
      } else {
        aptId = `apt-${data.apartment_number.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        store.apartments.push({
          id: aptId,
          society_id: store.society.id,
          block: data.apartment_number.charAt(0).toUpperCase() || 'A',
          apartment_number: data.apartment_number.toUpperCase(),
          floor: 1,
          resident_names: [data.full_name],
          contact_number: data.phone,
          created_at: nowISO,
        });
      }
    }

    const newProfile: Profile = {
      id: newId,
      email: normalizedEmail,
      full_name: data.full_name.trim(),
      phone: data.phone.trim(),
      role: data.role,
      society_id: data.society_id || store.society.id,
      apartment_id: aptId,
      apartment_number: data.apartment_number ? data.apartment_number.toUpperCase() : undefined,
      created_at: nowISO,
      updated_at: nowISO,
    };

    store.profiles.push(newProfile);
    store.credentials[normalizedEmail] = data.password;

    return {
      success: true,
      profile: newProfile,
    };
  }

  static loginUser(
    email: string,
    password: string,
    expectedRole?: UserRole
  ): {
    success: boolean;
    profile?: Profile;
    error?: 'USER_NOT_REGISTERED' | 'INVALID_PASSWORD' | 'ROLE_MISMATCH';
    message?: string;
  } {
    const normalizedEmail = email.trim().toLowerCase();
    const user = store.profiles.find((p) => p.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_REGISTERED',
        message: `No account found for "${email}". Would you like to create a new account?`,
      };
    }

    const storedPass = store.credentials[normalizedEmail] || 'password123';
    if (password !== storedPass) {
      return {
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Incorrect password entered. (Default demo password is password123)',
      };
    }

    if (expectedRole && user.role !== expectedRole) {
      return {
        success: false,
        error: 'ROLE_MISMATCH',
        message: `This account is registered as a ${user.role.replace('_', ' ')}, not as a ${expectedRole.replace('_', ' ')}.`,
      };
    }

    return {
      success: true,
      profile: user,
    };
  }

  static getApartments(): Apartment[] {
    return store.apartments;
  }

  static getParcels(filter?: {
    society_id?: string;
    apartment_id?: string;
    apartment_number?: string;
    status?: string;
  }): Parcel[] {
    let result = [...store.parcels];
    if (filter?.society_id) {
      result = result.filter((p) => p.society_id === filter.society_id);
    }
    if (filter?.apartment_id) {
      result = result.filter((p) => p.apartment_id === filter.apartment_id);
    }
    if (filter?.apartment_number) {
      result = result.filter((p) => p.apartment_number === filter.apartment_number);
    }
    if (filter?.status) {
      result = result.filter((p) => p.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getParcelById(id: string): Parcel | undefined {
    return store.parcels.find((p) => p.id === id);
  }

  static getParcelEvents(parcelId: string): ParcelEvent[] {
    return store.events
      .filter((e) => e.parcel_id === parcelId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async registerParcel(data: {
    apartment_number: string;
    recipient_name: string;
    courier_company: CourierCompany;
    tracking_number: string;
    parcel_count: number;
    storage_location?: string;
    photo_url?: string;
    staff_id: string;
    staff_name: string;
  }): Promise<Parcel> {
    const apt = store.apartments.find((a) => a.apartment_number === data.apartment_number);
    const aptId = apt ? apt.id : `apt-${data.apartment_number.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cleanApt = data.apartment_number.replace(/[^a-zA-Z0-9]/g, '');
    const referenceNumber = `PE-2026-${cleanApt}-${randomSuffix}`;
    const parcelId = `parcel-${Date.now()}`;
    const nowISO = new Date().toISOString();

    // Generate real QR code data URL
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(referenceNumber, { margin: 1, width: 250 });
    } catch {
      qrCodeUrl = '';
    }

    const newParcel: Parcel = {
      id: parcelId,
      society_id: store.society.id,
      apartment_id: aptId,
      apartment_number: data.apartment_number,
      reference_number: referenceNumber,
      tracking_number: data.tracking_number.trim(),
      courier_company: data.courier_company,
      recipient_name: data.recipient_name.trim(),
      parcel_count: data.parcel_count || 1,
      photo_url: data.photo_url,
      status: 'STORED',
      storage_location: data.storage_location || 'Bay 1 / Main Rack',
      received_by_staff_id: data.staff_id,
      received_by_staff_name: data.staff_name,
      received_at: nowISO,
      qr_code: qrCodeUrl,
      created_at: nowISO,
      updated_at: nowISO,
    };

    store.parcels.unshift(newParcel);

    // Add Parcel Events
    store.events.unshift({
      id: `evt-${Date.now()}-1`,
      parcel_id: parcelId,
      status: 'RECEIVED',
      title: 'Parcel Received at Guard Desk',
      description: `Handed over by ${data.courier_company} courier. Verified by staff ${data.staff_name}.`,
      actor_name: data.staff_name,
      actor_role: 'STAFF',
      created_at: nowISO,
    });

    store.events.unshift({
      id: `evt-${Date.now()}-2`,
      parcel_id: parcelId,
      status: 'STORED',
      title: 'Stored in Society Parcel Bay',
      description: `Logged in ${newParcel.storage_location}. Resident notified.`,
      actor_name: data.staff_name,
      actor_role: 'STAFF',
      created_at: nowISO,
    });

    // Notify Resident
    const resident = store.profiles.find((p) => p.apartment_number === data.apartment_number);
    const residentUserId = resident ? resident.id : 'user-resident-1';

    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: residentUserId,
      society_id: store.society.id,
      apartment_number: data.apartment_number,
      title: 'New Parcel Received',
      message: `Your ${data.courier_company} parcel (${referenceNumber}) has been received at the security desk. Please schedule a pickup time or request doorstep delivery.`,
      type: 'PARCEL_RECEIVED',
      parcel_id: parcelId,
      read: false,
      created_at: nowISO,
    });

    return newParcel;
  }

  static async bookCollection(params: {
    parcel_id: string;
    booking_type: 'COLLECTION' | 'DOORSTEP_DELIVERY';
    date: string; // YYYY-MM-DD
    time_window: string;
    resident_id: string;
    resident_name: string;
    notes?: string;
  }): Promise<{ parcel: Parcel; booking: ParcelBooking; plainOtp: string }> {
    const parcel = store.parcels.find((p) => p.id === params.parcel_id);
    if (!parcel) throw new Error('Parcel not found');

    if (!canTransitionParcel(parcel.status, 'BOOKED') && !canTransitionParcel(parcel.status, 'DELIVERY_SCHEDULED')) {
      throw new Error(`Cannot schedule parcel from status: ${parcel.status}`);
    }

    const nextStatus = params.booking_type === 'DOORSTEP_DELIVERY' ? 'DELIVERY_SCHEDULED' : 'BOOKED';
    const nowISO = new Date().toISOString();

    const booking: ParcelBooking = {
      id: `book-${Date.now()}`,
      parcel_id: parcel.id,
      society_id: parcel.society_id,
      apartment_id: parcel.apartment_id,
      resident_id: params.resident_id,
      booking_type: params.booking_type,
      date: params.date,
      time_window: params.time_window,
      status: 'CONFIRMED',
      delivery_notes: params.notes,
      created_at: nowISO,
      updated_at: nowISO,
    };

    parcel.status = nextStatus;
    parcel.booking = booking;
    parcel.updated_at = nowISO;

    store.bookings.push(booking);

    // Generate single-use OTP for this parcel
    const plainOtp = generateOtp();
    const hashed = await hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    store.otps[parcel.id] = {
      plainOtp,
      hash: hashed,
      expiresAt,
      attempts: 0,
    };

    // Log Event
    store.events.unshift({
      id: `evt-${Date.now()}`,
      parcel_id: parcel.id,
      status: nextStatus,
      title: params.booking_type === 'COLLECTION' ? 'Collection Window Booked' : 'Doorstep Delivery Requested',
      description: `Scheduled for ${params.date} (${params.time_window}). Secure collection pass generated.`,
      actor_name: params.resident_name,
      actor_role: 'RESIDENT',
      created_at: nowISO,
    });

    // Notify Resident with Booking Confirmation
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: params.resident_id,
      society_id: parcel.society_id,
      apartment_number: parcel.apartment_number,
      title: 'Booking Confirmed',
      message: `Your booking for ${parcel.reference_number} is confirmed for ${params.date} (${params.time_window}). Share your OTP at the desk during collection.`,
      type: 'BOOKING_CONFIRMED',
      parcel_id: parcel.id,
      read: false,
      created_at: nowISO,
    });

    return { parcel, booking, plainOtp };
  }

  static getActiveOtp(parcelId: string): string | null {
    const record = store.otps[parcelId];
    if (!record) return null;
    if (isOtpExpired(record.expiresAt)) return null;
    return record.plainOtp;
  }

  static async verifyHandover(params: {
    parcel_id: string;
    entered_otp: string;
    staff_id: string;
    staff_name: string;
    recipient_name: string;
    notes?: string;
  }): Promise<{ success: boolean; message: string; parcel?: Parcel }> {
    const parcel = store.parcels.find((p) => p.id === params.parcel_id);
    if (!parcel) return { success: false, message: 'Parcel record not found' };

    if (parcel.status === 'COLLECTED' || parcel.status === 'DELIVERED') {
      return { success: false, message: 'Parcel has already been handed over' };
    }

    const otpRecord = store.otps[params.parcel_id];
    if (!otpRecord) {
      return { success: false, message: 'No active OTP verification code found for this parcel. Resident must generate a pass.' };
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
      return { success: false, message: 'Verification OTP has expired. Please ask the resident to refresh their pass.' };
    }

    if (otpRecord.attempts >= 3) {
      return { success: false, message: 'Too many incorrect attempts. This OTP has been locked for security.' };
    }

    const hashedInput = await hashOtp(params.entered_otp);
    if (hashedInput !== otpRecord.hash && params.entered_otp !== otpRecord.plainOtp) {
      otpRecord.attempts += 1;
      const remaining = 3 - otpRecord.attempts;
      return {
        success: false,
        message: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lock.`,
      };
    }

    // OTP Verified! Complete Handover
    const nowISO = new Date().toISOString();
    parcel.status = 'COLLECTED';
    parcel.collected_by_name = params.recipient_name;
    parcel.collected_at = nowISO;
    parcel.handover_staff_id = params.staff_id;
    parcel.handover_staff_name = params.staff_name;
    parcel.handover_notes = params.notes;
    parcel.updated_at = nowISO;

    if (parcel.booking) {
      parcel.booking.status = 'COMPLETED';
      parcel.booking.updated_at = nowISO;
    }

    // Invalidate OTP immediately to prevent reuse
    delete store.otps[params.parcel_id];

    // Log Audit Event
    store.events.unshift({
      id: `evt-${Date.now()}`,
      parcel_id: parcel.id,
      status: 'COLLECTED',
      title: 'Handover Completed & Verified',
      description: `Collected by ${params.recipient_name}. Verified via single-use OTP by staff ${params.staff_name}.`,
      actor_name: params.staff_name,
      actor_role: 'STAFF',
      created_at: nowISO,
    });

    // Notify Resident of Successful Handover
    const resident = store.profiles.find((p) => p.apartment_number === parcel.apartment_number);
    if (resident) {
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: resident.id,
        society_id: parcel.society_id,
        apartment_number: parcel.apartment_number,
        title: 'Parcel Collected Successfully',
        message: `Your parcel (${parcel.reference_number}) was handed over to ${params.recipient_name} at ${nowISO}.`,
        type: 'PARCEL_COLLECTED',
        parcel_id: parcel.id,
        read: false,
        created_at: nowISO,
      });
    }

    return { success: true, message: 'Handover verified and recorded successfully!', parcel };
  }

  static getNotifications(userId?: string): AppNotification[] {
    if (!userId) return store.notifications;
    return store.notifications.filter((n) => n.user_id === userId);
  }

  static markNotificationRead(id: string) {
    const notif = store.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }

  static getSlots(dateStr: string): ReturnType<typeof generateDaySlots> {
    const bookedCounts: Record<string, number> = {};
    store.bookings
      .filter((b) => b.date === dateStr && b.status === 'CONFIRMED')
      .forEach((b) => {
        bookedCounts[b.time_window] = (bookedCounts[b.time_window] || 0) + 1;
      });

    return generateDaySlots(
      store.society.id,
      dateStr,
      store.society.operating_hours.start,
      store.society.operating_hours.end,
      store.society.slot_duration_minutes,
      store.society.slot_capacity,
      bookedCounts
    );
  }

  static getSocietyMetrics(): SocietyMetrics {
    const parcels = store.parcels;
    const totalParcelsReceived = parcels.length;
    const todayStr = new Date().toISOString().split('T')[0];

    const parcelsToday = parcels.filter((p) => p.received_at.startsWith(todayStr)).length;
    const parcelsInStorage = parcels.filter((p) => ['RECEIVED', 'STORED', 'BOOKED', 'READY_FOR_HANDOVER'].includes(p.status)).length;
    const parcelsCollectedToday = parcels.filter(
      (p) => p.status === 'COLLECTED' && p.collected_at && p.collected_at.startsWith(todayStr)
    ).length;
    const overdueParcels = parcels.filter((p) => p.is_overdue || p.status === 'UNCLAIMED').length;

    const collectedParcels = parcels.filter((p) => p.status === 'COLLECTED');
    const completionRate = totalParcelsReceived > 0 ? Math.round((collectedParcels.length / totalParcelsReceived) * 100) : 0;

    // Average storage duration
    let totalStorageHours = 0;
    collectedParcels.forEach((p) => {
      if (p.collected_at) {
        const diffMs = new Date(p.collected_at).getTime() - new Date(p.received_at).getTime();
        totalStorageHours += Math.max(0, diffMs / (1000 * 60 * 60));
      }
    });
    const avgStorageDurationHours = collectedParcels.length > 0 ? Math.round((totalStorageHours / collectedParcels.length) * 10) / 10 : 4.5;

    // Courier distribution
    const courierMap: Record<string, number> = {};
    parcels.forEach((p) => {
      courierMap[p.courier_company] = (courierMap[p.courier_company] || 0) + 1;
    });
    const volumeByCourier = Object.entries(courierMap).map(([courier, count]) => ({ courier, count }));

    // Peak Arrival Periods
    const peakArrivalPeriods = [
      { period: '10:00 - 12:00', count: parcels.filter((p) => p.received_at.includes('T10:') || p.received_at.includes('T11:')).length + 4 },
      { period: '12:00 - 14:00', count: parcels.filter((p) => p.received_at.includes('T12:') || p.received_at.includes('T13:')).length + 8 },
      { period: '14:00 - 16:00', count: parcels.filter((p) => p.received_at.includes('T14:') || p.received_at.includes('T15:')).length + 6 },
      { period: '16:00 - 18:00', count: parcels.filter((p) => p.received_at.includes('T16:') || p.received_at.includes('T17:')).length + 11 },
      { period: '18:00 - 20:00', count: parcels.filter((p) => p.received_at.includes('T18:') || p.received_at.includes('T19:')).length + 7 },
    ];

    // Daily Trend
    const dailyTrend = [
      { date: 'Oct 26', received: 14, collected: 12 },
      { date: 'Oct 27', received: 18, collected: 16 },
      { date: 'Oct 28', received: 22, collected: 19 },
      { date: 'Oct 29', received: 25, collected: 21 },
      { date: 'Oct 30', received: 19, collected: 20 },
      { date: 'Oct 31', received: 24, collected: 22 },
      { date: 'Nov 01 (Today)', received: parcelsToday + 12, collected: parcelsCollectedToday + 9 },
    ];

    return {
      totalParcelsReceived: totalParcelsReceived + 122,
      parcelsToday: parcelsToday + 14,
      parcelsInStorage: parcelsInStorage + 18,
      parcelsCollectedToday: parcelsCollectedToday + 12,
      overdueParcels,
      collectionCompletionRate: completionRate > 0 ? completionRate : 89,
      avgStorageDurationHours,
      peakHour: '16:00 - 18:00 IST',
      volumeByCourier: volumeByCourier.length > 0 ? volumeByCourier : [
        { courier: 'Amazon', count: 42 },
        { courier: 'Flipkart', count: 31 },
        { courier: 'Blue Dart', count: 18 },
        { courier: 'Delhivery', count: 14 },
        { courier: 'Blinkit', count: 11 },
        { courier: 'DTDC', count: 6 },
      ],
      dailyTrend,
      peakArrivalPeriods,
    };
  }

  // ==============================================================================
  // RESIDENT COMPLAINT MANAGEMENT SYSTEM METHODS
  // ==============================================================================

  static getComplaints(filter?: {
    society_id?: string;
    resident_id?: string;
    apartment_number?: string;
    assigned_staff_id?: string;
    status?: ComplaintStatus;
    category?: ComplaintCategory;
  }): Complaint[] {
    let list = [...store.complaints];

    if (filter?.society_id) {
      list = list.filter((c) => c.society_id === filter.society_id);
    }
    if (filter?.resident_id) {
      list = list.filter((c) => c.resident_id === filter.resident_id);
    }
    if (filter?.apartment_number) {
      const aptQuery = filter.apartment_number.toLowerCase().trim();
      list = list.filter((c) => c.apartment_number.toLowerCase().trim() === aptQuery);
    }
    if (filter?.assigned_staff_id) {
      list = list.filter((c) => c.assigned_to_staff_id === filter.assigned_staff_id);
    }
    if (filter?.status) {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter?.category) {
      list = list.filter((c) => c.category === filter.category);
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getComplaintById(id: string): Complaint | undefined {
    return store.complaints.find((c) => c.id === id);
  }

  static submitComplaint(params: {
    society_id: string;
    apartment_number: string;
    resident_id: string;
    resident_name: string;
    resident_email: string;
    resident_phone: string;
    category: ComplaintCategory;
    subject: string;
    description: string;
    attachment_url?: string;
    priority?: ComplaintPriority;
  }): Complaint {
    const aptClean = params.apartment_number.replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CMP-2026-${aptClean}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: complaintId,
      society_id: params.society_id,
      apartment_number: params.apartment_number,
      resident_id: params.resident_id,
      resident_name: params.resident_name,
      resident_email: params.resident_email,
      resident_phone: params.resident_phone,
      category: params.category,
      subject: params.subject,
      description: params.description,
      attachment_url: params.attachment_url,
      status: 'SUBMITTED',
      priority: params.priority || 'MEDIUM',
      comments: [],
      status_history: [
        {
          id: `hist-${Date.now()}-1`,
          complaint_id: complaintId,
          to_status: 'SUBMITTED',
          changed_by_id: params.resident_id,
          changed_by_name: params.resident_name,
          changed_by_role: 'RESIDENT',
          notes: 'Complaint submitted by resident',
          created_at: now,
        },
      ],
      created_at: now,
      updated_at: now,
    };

    store.complaints.unshift(newComplaint);

    // Notify Resident
    store.notifications.unshift({
      id: `notif-${Date.now()}-res`,
      user_id: params.resident_id,
      society_id: params.society_id,
      apartment_number: params.apartment_number,
      title: `Complaint Submitted (#${complaintId})`,
      message: `Your grievance regarding "${params.subject}" has been logged and escalated to society administration.`,
      type: 'COMPLAINT_SUBMITTED',
      complaint_id: complaintId,
      read: false,
      created_at: now,
    });

    // Notify Society Admin(s)
    const admin = store.profiles.find((p) => p.role === 'SOCIETY_ADMIN');
    if (admin) {
      store.notifications.unshift({
        id: `notif-${Date.now()}-adm`,
        user_id: admin.id,
        society_id: params.society_id,
        apartment_number: params.apartment_number,
        title: `New Resident Complaint (#${complaintId})`,
        message: `Unit ${params.apartment_number} submitted: "${params.subject}". Category: ${params.category.replace('_', ' ')}.`,
        type: 'COMPLAINT_SUBMITTED',
        complaint_id: complaintId,
        read: false,
        created_at: now,
      });
    }

    return newComplaint;
  }

  static assignComplaint(params: {
    complaintId: string;
    staffId: string;
    assignedByName: string;
    assignedById: string;
    notes?: string;
  }): { success: boolean; message: string; complaint?: Complaint } {
    const complaint = store.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found' };

    // Enforce single assignment rule: Once assigned to a staff member, cannot assign multiple times
    if (complaint.assigned_to_staff_id) {
      return {
        success: false,
        message: `Complaint #${complaint.id} has already been assigned to ${complaint.assigned_to_staff_name || 'a security officer'}. Multiple assignments are prohibited.`,
      };
    }

    const staff = store.profiles.find((p) => p.id === params.staffId);
    if (!staff) return { success: false, message: 'Staff member not found' };

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.assigned_to_staff_id = staff.id;
    complaint.assigned_to_staff_name = staff.full_name;
    complaint.assigned_at = now;
    complaint.status = 'ASSIGNED';
    complaint.updated_at = now;

    complaint.status_history.push({
      id: `hist-${Date.now()}`,
      complaint_id: complaint.id,
      from_status: oldStatus,
      to_status: 'ASSIGNED',
      changed_by_id: params.assignedById,
      changed_by_name: params.assignedByName,
      changed_by_role: 'SOCIETY_ADMIN',
      notes: params.notes || `Assigned to security officer ${staff.full_name}`,
      created_at: now,
    });

    if (params.notes) {
      complaint.comments.push({
        id: `comment-${Date.now()}`,
        complaint_id: complaint.id,
        author_id: params.assignedById,
        author_name: params.assignedByName,
        author_role: 'SOCIETY_ADMIN',
        message: `[Assignment Note]: ${params.notes}`,
        target_audience: 'STAFF',
        is_internal: true,
        created_at: now,
      });
    }

    // Notify assigned staff
    store.notifications.unshift({
      id: `notif-${Date.now()}-stf`,
      user_id: staff.id,
      society_id: complaint.society_id,
      title: `Task Assigned: #${complaint.id}`,
      message: `${params.assignedByName} assigned you resident complaint from Unit ${complaint.apartment_number}: "${complaint.subject}".`,
      type: 'COMPLAINT_ASSIGNED',
      complaint_id: complaint.id,
      read: false,
      created_at: now,
    });

    // Notify resident
    store.notifications.unshift({
      id: `notif-${Date.now()}-res-asgn`,
      user_id: complaint.resident_id,
      society_id: complaint.society_id,
      apartment_number: complaint.apartment_number,
      title: `Complaint Assigned to Staff (#${complaint.id})`,
      message: `Your complaint has been assigned to security staff officer ${staff.full_name} for investigation.`,
      type: 'COMPLAINT_ASSIGNED',
      complaint_id: complaint.id,
      read: false,
      created_at: now,
    });

    return { success: true, message: 'Complaint successfully assigned', complaint };
  }

  static updateComplaintStatus(params: {
    complaintId: string;
    newStatus: ComplaintStatus;
    changedByName: string;
    changedById: string;
    changedByRole: UserRole;
    notes?: string;
  }): { success: boolean; message: string; complaint?: Complaint } {
    const complaint = store.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found' };

    // Prevent duplicate status updates to the exact same status
    if (complaint.status === params.newStatus) {
      return {
        success: false,
        message: `Complaint #${complaint.id} is already in "${params.newStatus.replace('_', ' ')}" status. Select a different status to record an update.`,
      };
    }

    // Staff permission check: staff can only update complaints assigned to them
    if (params.changedByRole === 'STAFF') {
      if (complaint.assigned_to_staff_id !== params.changedById) {
        return { success: false, message: 'Unauthorized: Security staff can only update complaints assigned to them.' };
      }
      if (params.newStatus !== 'IN_PROGRESS' && params.newStatus !== 'RESOLVED') {
        return { success: false, message: 'Security staff can only update status to In Progress or Resolved.' };
      }
    }

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = params.newStatus;
    complaint.updated_at = now;

    if (params.newStatus === 'RESOLVED') {
      complaint.resolved_at = now;
      complaint.resolved_by_name = params.changedByName;
      complaint.resolution_notes = params.notes;
    } else if (params.newStatus === 'REJECTED') {
      complaint.rejection_reason = params.notes;
    }

    complaint.status_history.push({
      id: `hist-${Date.now()}`,
      complaint_id: complaint.id,
      from_status: oldStatus,
      to_status: params.newStatus,
      changed_by_id: params.changedById,
      changed_by_name: params.changedByName,
      changed_by_role: params.changedByRole,
      notes: params.notes || `Status changed from ${oldStatus} to ${params.newStatus}`,
      created_at: now,
    });

    if (params.notes) {
      complaint.comments.push({
        id: `comment-${Date.now()}`,
        complaint_id: complaint.id,
        author_id: params.changedById,
        author_name: params.changedByName,
        author_role: params.changedByRole,
        message: params.newStatus === 'RESOLVED' ? `[Resolution]: ${params.notes}` : `[Status Update - ${params.newStatus.replace('_', ' ')}]: ${params.notes}`,
        target_audience: 'ALL',
        created_at: now,
      });
    }

    // Notify Resident
    const isResolved = params.newStatus === 'RESOLVED';
    store.notifications.unshift({
      id: `notif-${Date.now()}-res-status`,
      user_id: complaint.resident_id,
      society_id: complaint.society_id,
      apartment_number: complaint.apartment_number,
      title: isResolved ? `Complaint Resolved (#${complaint.id})` : `Complaint Status: ${params.newStatus.replace('_', ' ')} (#${complaint.id})`,
      message: isResolved
        ? `Your complaint regarding "${complaint.subject}" has been marked as RESOLVED by ${params.changedByName}. Resolution notes: ${params.notes || 'Issue resolved'}.`
        : `Status for complaint #${complaint.id} was updated to ${params.newStatus.replace('_', ' ')} by ${params.changedByName}.`,
      type: isResolved ? 'COMPLAINT_RESOLVED' : 'COMPLAINT_UPDATED',
      complaint_id: complaint.id,
      read: false,
      created_at: now,
    });

    return { success: true, message: `Status updated to ${params.newStatus}`, complaint };
  }

  static addComplaintComment(params: {
    complaintId: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    message: string;
    targetAudience?: ComplaintCommentAudience;
    isInternal?: boolean;
  }): { success: boolean; message: string; comment?: ComplaintComment } {
    const complaint = store.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) return { success: false, message: 'Complaint not found' };

    // Staff permission check: staff can only comment on assigned complaints
    if (params.authorRole === 'STAFF' && complaint.assigned_to_staff_id !== params.authorId) {
      return { success: false, message: 'Unauthorized: Staff can only add comments to assigned complaints.' };
    }

    const targetAudience: ComplaintCommentAudience = params.targetAudience || 'ALL';
    const now = new Date().toISOString();
    const newComment: ComplaintComment = {
      id: `comment-${Date.now()}`,
      complaint_id: complaint.id,
      author_id: params.authorId,
      author_name: params.authorName,
      author_role: params.authorRole,
      message: params.message.trim(),
      target_audience: targetAudience,
      is_internal: targetAudience === 'STAFF' || targetAudience === 'SOCIETY_ADMIN' || Boolean(params.isInternal),
      created_at: now,
    };

    complaint.comments.push(newComment);
    complaint.updated_at = now;

    const previewText = params.message.slice(0, 80) + (params.message.length > 80 ? '...' : '');

    // 1. If target is RESIDENT: Notify resident only
    if (targetAudience === 'RESIDENT' && params.authorRole !== 'RESIDENT') {
      store.notifications.unshift({
        id: `notif-${Date.now()}-comment-res`,
        user_id: complaint.resident_id,
        society_id: complaint.society_id,
        apartment_number: complaint.apartment_number,
        title: `Personal Update on #${complaint.id}`,
        message: `${params.authorName} (${params.authorRole.replace('_', ' ')}): "${previewText}"`,
        type: 'COMPLAINT_UPDATED',
        complaint_id: complaint.id,
        read: false,
        created_at: now,
      });
    }
    // 2. If target is STAFF: Notify assigned staff officer only
    else if (targetAudience === 'STAFF' && params.authorRole !== 'STAFF') {
      if (complaint.assigned_to_staff_id) {
        store.notifications.unshift({
          id: `notif-${Date.now()}-comment-staff`,
          user_id: complaint.assigned_to_staff_id,
          society_id: complaint.society_id,
          title: `Direct Note on #${complaint.id}`,
          message: `${params.authorName} (${params.authorRole.replace('_', ' ')}): "${previewText}"`,
          type: 'COMPLAINT_UPDATED',
          complaint_id: complaint.id,
          read: false,
          created_at: now,
        });
      }
    }
    // 3. If target is SOCIETY_ADMIN: Notify admin
    else if (targetAudience === 'SOCIETY_ADMIN' && params.authorRole !== 'SOCIETY_ADMIN' && params.authorRole !== 'PLATFORM_ADMIN') {
      const adminProfile = store.profiles.find((p) => p.role === 'SOCIETY_ADMIN' && p.society_id === complaint.society_id);
      if (adminProfile) {
        store.notifications.unshift({
          id: `notif-${Date.now()}-comment-admin`,
          user_id: adminProfile.id,
          society_id: complaint.society_id,
          title: `Direct Message on Complaint #${complaint.id}`,
          message: `${params.authorName} (${params.authorRole.replace('_', ' ')}): "${previewText}"`,
          type: 'COMPLAINT_UPDATED',
          complaint_id: complaint.id,
          read: false,
          created_at: now,
        });
      }
    }
    // 4. If target is ALL: notify the other parties
    else if (targetAudience === 'ALL') {
      if (params.authorRole !== 'RESIDENT') {
        store.notifications.unshift({
          id: `notif-${Date.now()}-comment-res-all`,
          user_id: complaint.resident_id,
          society_id: complaint.society_id,
          apartment_number: complaint.apartment_number,
          title: `Update on Complaint #${complaint.id}`,
          message: `${params.authorName} (${params.authorRole.replace('_', ' ')}): "${previewText}"`,
          type: 'COMPLAINT_UPDATED',
          complaint_id: complaint.id,
          read: false,
          created_at: now,
        });
      }
      if (params.authorRole !== 'STAFF' && complaint.assigned_to_staff_id) {
        store.notifications.unshift({
          id: `notif-${Date.now()}-comment-staff-all`,
          user_id: complaint.assigned_to_staff_id,
          society_id: complaint.society_id,
          title: `Update on Complaint #${complaint.id}`,
          message: `${params.authorName} (${params.authorRole.replace('_', ' ')}): "${previewText}"`,
          type: 'COMPLAINT_UPDATED',
          complaint_id: complaint.id,
          read: false,
          created_at: now,
        });
      }
    }

    return { success: true, message: 'Comment added', comment: newComment };
  }
}
