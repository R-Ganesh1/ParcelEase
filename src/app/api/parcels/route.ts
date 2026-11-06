import { NextResponse } from 'next/server';
import { MockDatabase } from '@/lib/db/mock-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apt = searchParams.get('apartment_number') || undefined;
  const status = searchParams.get('status') || undefined;

  const parcels = MockDatabase.getParcels({
    apartment_number: apt,
    status,
  });

  return NextResponse.json({ success: true, data: parcels });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.apartment_number || !body.recipient_name || !body.courier_company) {
      return NextResponse.json(
        { success: false, error: 'Missing required parcel fields' },
        { status: 400 }
      );
    }

    const parcel = await MockDatabase.registerParcel({
      apartment_number: body.apartment_number,
      recipient_name: body.recipient_name,
      courier_company: body.courier_company,
      tracking_number: body.tracking_number || `AWB-${Date.now()}`,
      parcel_count: body.parcel_count || 1,
      storage_location: body.storage_location || 'Bay 1 / Main Rack',
      photo_url: body.photo_url,
      staff_id: body.staff_id || 'user-staff-1',
      staff_name: body.staff_name || 'Ramesh Kumar (Gate 1)',
    });

    return NextResponse.json({ success: true, data: parcel }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register parcel' },
      { status: 500 }
    );
  }
}
