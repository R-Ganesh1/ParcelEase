import { NextResponse } from 'next/server';
import { MockDatabase } from '@/lib/db/mock-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || undefined;

  const notifications = MockDatabase.getNotifications(userId);
  return NextResponse.json({ success: true, data: notifications });
}
