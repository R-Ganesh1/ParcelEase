'use client';

import React, { useState } from 'react';
import { Building, Plus, Search, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MockDatabase } from '@/lib/db/mock-db';

export default function AdminApartmentsPage() {
  const [query, setQuery] = useState('');
  const apartments = MockDatabase.getApartments();

  const filtered = apartments.filter(
    (a) =>
      a.apartment_number.toLowerCase().includes(query.toLowerCase()) ||
      a.resident_names.some((r) => r.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Apartment Units &amp; Residents Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage units, primary residents, and contact numbers for parcel delivery routing
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Apartment
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search unit (A-204) or resident..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Unit Number</th>
                  <th className="py-3 px-4 font-semibold">Tower Block</th>
                  <th className="py-3 px-4 font-semibold">Floor</th>
                  <th className="py-3 px-4 font-semibold">Authorized Residents</th>
                  <th className="py-3 px-4 font-semibold">Contact Phone</th>
                  <th className="py-3 px-4 font-semibold">Membership Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-navy-950 text-sm">
                      {apt.apartment_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      Block {apt.block}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Floor {apt.floor}</td>
                    <td className="py-3.5 px-4 font-medium text-navy-900">
                      {apt.resident_names.join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{apt.contact_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Resident
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
