import { ParcelStatus, CollectionSlot } from '@/types';

// Valid Lifecycle Transitions State Machine Map
export const VALID_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  RECEIVED: ['STORED', 'DISPUTED', 'RETURNED_TO_COURIER'],
  STORED: ['BOOKED', 'DELIVERY_SCHEDULED', 'READY_FOR_HANDOVER', 'UNCLAIMED', 'DISPUTED'],
  BOOKED: ['READY_FOR_HANDOVER', 'STORED', 'DISPUTED'], // can cancel back to STORED
  READY_FOR_HANDOVER: ['COLLECTED', 'STORED', 'DISPUTED'],
  DELIVERY_SCHEDULED: ['OUT_FOR_DELIVERY', 'STORED', 'DISPUTED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'STORED', 'DISPUTED'],
  COLLECTED: [], // Terminal
  DELIVERED: [], // Terminal
  DISPUTED: ['STORED', 'RETURNED_TO_COURIER', 'READY_FOR_HANDOVER'],
  RETURNED_TO_COURIER: [], // Terminal
  UNCLAIMED: ['RETURNED_TO_COURIER', 'DISPUTED', 'STORED'],
};

export function canTransitionParcel(from: ParcelStatus, to: ParcelStatus): boolean {
  if (from === to) return true;
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

// Generate time slots based on society operating hours and capacity
export function generateDaySlots(
  societyId: string,
  dateStr: string, // YYYY-MM-DD
  operatingStart: string = '08:00',
  operatingEnd: string = '21:30',
  durationMinutes: number = 30,
  capacity: number = 4,
  existingBookedCounts: Record<string, number> = {}
): CollectionSlot[] {
  const slots: CollectionSlot[] = [];

  const [startHour, startMin] = operatingStart.split(':').map(Number);
  const [endHour, endMin] = operatingEnd.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  let slotIndex = 1;
  while (currentMinutes + durationMinutes <= endMinutes) {
    const sH = Math.floor(currentMinutes / 60);
    const sM = currentMinutes % 60;
    const eMinutes = currentMinutes + durationMinutes;
    const eH = Math.floor(eMinutes / 60);
    const eM = eMinutes % 60;

    const startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
    const endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
    const slotKey = `${startTime}-${endTime}`;

    const booked = existingBookedCounts[slotKey] || 0;

    slots.push({
      id: `slot-${societyId}-${dateStr}-${slotIndex}`,
      society_id: societyId,
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      capacity,
      booked_count: booked,
      is_available: booked < capacity,
    });

    currentMinutes += durationMinutes;
    slotIndex++;
  }

  return slots;
}

// Indian Standard Time (IST) formatting helper
export function formatIST(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d) + ' IST';
}

export function formatISTTimeOnly(timeStr: string): string {
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h}:${m} ${ampm}`;
}
