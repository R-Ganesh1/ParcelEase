import { NextResponse } from 'next/server';
import { MockDatabase } from '@/lib/db/mock-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.parcel_id || !body.time_window || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (parcel_id, time_window, date)' },
        { status: 400 }
      );
    }

    const result = await MockDatabase.bookCollection({
      parcel_id: body.parcel_id,
      booking_type: body.booking_type || 'COLLECTION',
      date: body.date,
      time_window: body.time_window,
      resident_id: body.resident_id || 'user-resident-1',
      resident_name: body.resident_name || 'Ananya Rao',
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: {
        parcel: result.parcel,
        booking: result.booking,
        plainOtp: result.plainOtp,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Booking slot failed' },
      { status: 400 }
    );
  }
}
