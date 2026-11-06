# ParcelEase — Apartment Parcel Management & Scheduled Delivery Platform

> **"Your parcels. Your time."**
> A production-minded web application engineered for Indian gated communities, Resident Welfare Associations (RWAs), apartment managers, residents, and security guard desks.

---

## 1. Problem & Solution Overview

### The Problem in Indian Gated Communities
In metros like Bengaluru, Mumbai, Gurugram, Hyderabad, and Pune, apartment societies receive between **200 and 800+ parcels daily** from platforms like Amazon, Flipkart, Blinkit, Zepto, Blue Dart, and Delhivery. Delivery executives arrive unpredictably while residents are commuting or in meetings, leading to:
- Repeated missed calls and delivery failures.
- Cluttered, disorganized tables at security gates with risk of parcel theft or misplacement.
- Chaos during evening peak hours (7 PM – 9 PM) as dozens of residents converge at guard desks simultaneously.
- Zero accountability or audit proof when packages go missing.

### The ParcelEase Solution
1. **Security Guard Intake (< 30 seconds):** Authorized guards log courier arrivals, tag the apartment unit (e.g. `A-204`), assign a designated storage bay (e.g. `Bay 2 / Shelf C`), and attach an optional package photograph.
2. **Instant In-App Alerts:** The resident receives an immediate notification with courier details, tracking numbers, and storage bay location.
3. **Capacity-Controlled Slot Scheduling:** Residents reserve a 30-minute self-collection window or request a scheduled doorstep delivery within society operating hours. Concurrency caps (e.g., max 4 pickups/slot) completely eliminate gate queues.
4. **Single-Use Cryptographic OTP Handover:** Handovers are validated using short-lived (15-min TTL) 6-digit OTP codes with 3-attempt brute-force protection.
5. **RWA Executive Analytics:** Association committees access real-time dashboards tracking peak arrival periods, courier distribution, average storage durations, and completion rates.

---

## 2. The 10-Step Golden Demonstration Journey

ParcelEase is pre-loaded with an interactive **10-Step Golden Journey Guide** and persona switchers:

1. **Security Staff Logs In:** Guard Ramesh Kumar accesses the Gate 1 Desk Terminal.
2. **Staff Registers Parcel for Apartment A-204:** Intakes a shipment with courier tag, recipient name (Ananya Rao), and assigns `Bay 2 / Shelf C`.
3. **Resident Receives In-App Alert:** Push/in-app alert dispatched instantaneously.
4. **Resident Logs In & Views Parcel:** Ananya Rao inspects shipment specs, photos, and desk QR code.
5. **Resident Books Collection Window:** Selects a 30-minute slot (e.g. 18:00 – 18:30 IST) to generate an active 6-digit collection pass.
6. **Staff Dashboard Reflects Booking:** Scheduled queue automatically updates in the guard terminal.
7. **Staff Verifies Recipient OTP:** Guard enters the 6-digit OTP into the Handover Terminal.
8. **Parcel Marked COLLECTED:** Custody is recorded with exact Indian Standard Time (IST) timestamp.
9. **Resident Receives Completed Handover Proof:** Immutable custody confirmation with staff officer badge.
10. **Administrator Inspects Operational Metrics:** Dr. Arvind Sharma (RWA President) views updated handover completion percentage, peak hours, and courier metrics.

---

## 3. Technology Stack

- **Frontend:** Next.js 14 (App Router) with TypeScript & React 18.
- **Styling & UI:** Tailwind CSS, shadcn/ui design patterns, Lucide React icons.
- **Database & Security:** Supabase PostgreSQL with Row Level Security (RLS) policies, UUID keys, foreign-key constraints, and multi-tenant isolation.
- **Form Validation:** Zod and React Hook Form.
- **Charts & Data Visualization:** Recharts (Area charts, Bar charts, Donut charts).
- **Timezone Management:** Full Indian Standard Time (`Asia/Kolkata` / IST) conversions.
- **Barcodes & Passes:** `qrcode` library generating client-side QR codes.
- **Demo Mode:** Reactive in-memory + local storage engine with pre-seeded Greenwood Heights RWA dataset.

---

## 4. Folder Structure

```
ParcelEase/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout with RoleSwitcher & 10-Step Guide
│   │   ├── page.tsx                       # Public SaaS Landing page
│   │   ├── features/page.tsx              # Deep-dive platform capabilities
│   │   ├── how-it-works/page.tsx          # 4-Step visual operational workflow
│   │   ├── for-societies/page.tsx         # RWA & Property Manager solutions
│   │   ├── pricing/page.tsx               # Transparent society subscription tiers (INR)
│   │   ├── contact/page.tsx               # RWA inquiry and pilot booking
│   │   ├── login/page.tsx                 # 1-Click Persona Login & credential form
│   │   │
│   │   ├── resident/                      # Resident Portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Resident Dashboard (active parcels, bookings)
│   │   │   ├── parcels/
│   │   │   │   ├── page.tsx               # Apartment parcels inventory
│   │   │   │   └── [id]/page.tsx          # Parcel details, QR code, 30-min slot picker
│   │   │   ├── bookings/page.tsx          # Scheduled pickup passes & active OTPs
│   │   │   ├── support/page.tsx           # Missing / damaged parcel ticketing
│   │   │   └── profile/page.tsx           # Unit contact details & alert channels
│   │   │
│   │   ├── staff/                         # Security Guard Gate Desk
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Guard Hub (received today, stored, overdue)
│   │   │   ├── register/page.tsx          # Parcel Intake Terminal (< 30s wizard)
│   │   │   ├── handover/page.tsx          # Live OTP Handover Verification Terminal
│   │   │   ├── parcels/page.tsx           # Active parcel ledger & status filters
│   │   │   ├── schedule/page.tsx          # Daily pickup passes & doorstep delivery queue
│   │   │   └── audit/page.tsx             # Staff custody timeline
│   │   │
│   │   ├── admin/                         # Society Management (RWA Committee)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Executive Analytics (Recharts volume & peak hours)
│   │   │   ├── apartments/page.tsx        # Apartment directory & resident memberships
│   │   │   ├── staff/page.tsx             # Security guards and gate posts roster
│   │   │   ├── schedules/page.tsx         # Operating hours & slot capacity configuration
│   │   │   ├── parcels/page.tsx           # Master society parcel ledger
│   │   │   ├── reports/page.tsx           # Operational reports & CSV data export
│   │   │   └── settings/page.tsx          # 7-day retention rules & escalation triggers
│   │   │
│   │   ├── platform-admin/                # Platform Headquarters (Super Admin)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Multi-tenant overview across Indian metros
│   │   │   ├── societies/page.tsx         # Society onboarding & tenant provisioning
│   │   │   └── audit/page.tsx             # Global security checks & system events
│   │   │
│   │   └── api/                           # Backend REST Endpoints
│   │       ├── parcels/route.ts
│   │       ├── bookings/route.ts
│   │       ├── handover/verify/route.ts
│   │       └── notifications/route.ts
│   │
│   ├── components/
│   │   ├── ui/                            # Button, Card, Badge, Input, Modal
│   │   └── layout/                        # Navbar, Sidebar, Footer, RoleSwitcherBanner, UserJourneyGuide
│   │
│   ├── lib/
│   │   ├── context/demo-context.tsx       # Live persona switching & reactive state
│   │   ├── db/mock-db.ts                  # In-memory relational database & state store
│   │   ├── scheduling/engine.ts           # Slot calculation, capacity caps, IST formatting
│   │   ├── security/otp.ts                # Cryptographic 6-digit OTP & SHA-256 verification
│   │   ├── notifications/service.ts       # In-app notification engine with external hooks
│   │   └── supabase/client.ts             # Supabase PostgreSQL client integration
│   │
│   ├── supabase/
│   │   ├── schema.sql                     # Full PostgreSQL schema with RLS & indexes
│   │   └── seed.sql                       # Greenwood Heights RWA test dataset
│   │
│   └── types/index.ts                     # TypeScript interfaces & domain models
│
├── tests/
│   └── parcelease.test.mjs                # Unit tests for scheduling, OTP, state machine, RLS
├── .env.example                           # Documented environment variables
├── package.json
└── README.md
```

---

## 5. Local Development Instructions

### Prerequisites
- Node.js v18.17+ or v20+
- npm or pnpm

### Installation
```bash
# 1. Clone repository & install dependencies
git clone https://github.com/your-org/parcelease.git
cd parcelease
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Test Suite
```bash
npm test
```
Executes tests covering:
- Parcel lifecycle state machine transitions (`RECEIVED` → `STORED` → `BOOKED` → `COLLECTED`).
- Illegal transition rejection.
- 6-digit cryptographic OTP generation.
- 15-minute OTP TTL expiration.
- 3-attempt brute-force lockout.
- Slot generation strictly within operating hours (08:00 – 21:00 IST).
- Slot capacity overbooking protection.
- Standard reference code formatting (`PE-YYYY-APT-XXXX`).
- Multi-tenant database isolation.

---

## 6. Supabase PostgreSQL Configuration

To connect ParcelEase to a live Supabase PostgreSQL instance:

1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Navigate to **SQL Editor** and execute:
   - `src/supabase/schema.sql` (Creates tables, constraints, indexes, RLS policies).
   - `src/supabase/seed.sql` (Seeds Greenwood Heights RWA demo community).
3. Copy your project URL and keys from **Project Settings > API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   NEXT_PUBLIC_DEMO_MODE=false
   ```
4. Save in `.env.local` and restart `npm run dev`.

---

## 7. Deployment Instructions (Vercel)

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and select `ParcelEase`.
3. Set the Framework Preset to **Next.js**.
4. Under **Environment Variables**, provide:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_DEMO_MODE=true` (or configure your Supabase variables)
5. Click **Deploy**. Vercel will build the optimized production output.

---

## 8. Implemented Features & Verification Matrix

| Feature | Status | Implementation Details |
|---|---|---|
| **Role-Based Access Control** | ✅ Complete | Resident, Staff Guard, Society Admin, Platform Admin |
| **Parcel Intake (< 30s)** | ✅ Complete | Autocomplete apartment lookup, bay assignment, QR generation |
| **Scheduling Engine** | ✅ Complete | 30-min slots, operating hours (08:00–21:30), capacity caps |
| **Single-Use Cryptographic OTP** | ✅ Complete | 6-digit OTP, SHA-256 hash, 15-min TTL, 3-attempt lockout |
| **Verified Handover Proof** | ✅ Complete | Actual IST timestamp, staff ID, recipient confirmation |
| **In-App Notification Center** | ✅ Complete | Real-time intake alerts, pass confirmations, unread counters |
| **Society Executive Analytics** | ✅ Complete | Recharts daily trend, courier share, peak arrival periods |
| **CSV Data Export** | ✅ Complete | Full custody audit log download for RWA accounting |
| **Tenant Isolation** | ✅ Complete | PostgreSQL Row Level Security (RLS) policies in schema |
| **Responsive Indian SaaS UI** | ✅ Complete | Tailwind CSS, navy & emerald accents, mobile friendly |

---

## 9. Future External Integrations (Requiring Third-Party Credentials)

For production deployment with external telecom/messaging gateways, the following optional environment variables can be provided:
- **SMS Gateway:** Twilio, Gupshup, or Kaleyra (`SMS_GATEWAY_API_KEY`).
- **WhatsApp Cloud API:** Meta Business API (`WHATSAPP_BUSINESS_API_KEY`).
- **Transactional Email:** Amazon SES or SendGrid (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`).
- **Payment Gateway:** Razorpay or Cashfree for society subscription billing.

*Note: In the absence of external gateway credentials, ParcelEase's built-in notification system and OTP handover verification operate with 100% full fidelity in-app.*
