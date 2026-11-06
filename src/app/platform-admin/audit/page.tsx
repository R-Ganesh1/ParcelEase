'use client';

import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function PlatformAuditPage() {
  const auditLogs = [
    {
      id: 'aud-1',
      action: 'OTP_VERIFIED',
      resource: 'PARCEL',
      details: 'Handover verified via 6-digit cryptographic OTP at Gate 1',
      society: 'Greenwood Heights RWA',
      time: 'Just now',
    },
    {
      id: 'aud-2',
      action: 'SLOT_RESERVED',
      resource: 'COLLECTION_SLOT',
      details: 'Slot 18:00 - 18:30 IST booked by resident Ananya Rao (A-204)',
      society: 'Greenwood Heights RWA',
      time: '15 mins ago',
    },
    {
      id: 'aud-3',
      action: 'PARCEL_INTAKE',
      resource: 'PARCEL',
      details: 'Flipkart shipment received by staff Ramesh Kumar. QR generated.',
      society: 'Greenwood Heights RWA',
      time: '2 hours ago',
    },
    {
      id: 'aud-4',
      action: 'RLS_SECURITY_CHECK',
      resource: 'DATABASE_POLICY',
      details: 'Automated tenant isolation scan passed. Zero cross-society leaks detected.',
      society: 'System-wide',
      time: '6 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">System Security &amp; Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographic security events, RLS checks, and privileged admin actions
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold">Platform-Wide Audit Stream</CardTitle>
          <CardDescription className="text-xs">Immutable security events</CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-950 font-mono">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
                <div className="text-slate-600 mt-0.5">{log.details}</div>
                <div className="text-[11px] font-semibold text-blue-700 mt-1">Scope: {log.society}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
