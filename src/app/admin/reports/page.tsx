'use client';

import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MockDatabase } from '@/lib/db/mock-db';

export default function AdminReportsPage() {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleExportCSV = (reportName: string) => {
    const parcels = MockDatabase.getParcels();
    const headers = [
      'Parcel Reference',
      'Apartment',
      'Courier',
      'Tracking Number',
      'Recipient',
      'Status',
      'Storage Bay',
      'Received At (ISO)',
      'Collected By',
      'Collected At (ISO)',
    ];

    const rows = parcels.map((p) => [
      p.reference_number,
      p.apartment_number,
      p.courier_company,
      p.tracking_number,
      `"${p.recipient_name}"`,
      p.status,
      `"${p.storage_location}"`,
      p.received_at,
      `"${p.collected_by_name || 'N/A'}"`,
      p.collected_at || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parcelease_${reportName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(reportName);
    setTimeout(() => setDownloaded(null), 3000);
  };

  const reports = [
    {
      title: 'Full Custody Ledger (All Parcels)',
      desc: 'Complete log of every parcel received, stored, and verified with staff notes and timestamps.',
      id: 'full_ledger',
    },
    {
      title: 'Overdue & Unclaimed Parcels Report',
      desc: 'List of shipments lying unclaimed for over 7 days for RWA escalation or courier returns.',
      id: 'overdue_parcels',
    },
    {
      title: 'Staff Verification Performance Log',
      desc: 'Intake and handover count by guard officer and gate shift.',
      id: 'staff_performance',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Operational Reports &amp; Data Export</h1>
        <p className="text-xs text-slate-500 mt-1">
          Export tamper-evident CSV records for RWA audits, annual general meetings, and accounting
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-950">{r.title}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{r.desc}</p>
                </div>
              </div>

              <Button
                onClick={() => handleExportCSV(r.id)}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs font-semibold text-slate-800 border-slate-300 hover:bg-slate-50"
              >
                {downloaded === r.id ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Downloaded
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-blue-600" /> Export CSV
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
