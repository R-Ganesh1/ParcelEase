import { NextResponse } from 'next/server';
import { MockDatabase } from '@/lib/db/mock-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.parcel_id || !body.otp) {
      return NextResponse.json(
        { success: false, error: 'Parcel ID and OTP pass required' },
        { status: 400 }
      );
    }

    const verification = await MockDatabase.verifyHandover({
      parcel_id: body.parcel_id,
      entered_otp: body.otp,
      staff_id: body.staff_id || 'user-staff-1',
      staff_name: body.staff_name || 'Ramesh Kumar (Gate 1)',
      recipient_name: body.recipient_name || 'Resident',
      notes: body.notes,
    });

    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: verification.message,
      data: verification.parcel,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
