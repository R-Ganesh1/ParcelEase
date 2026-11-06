'use client';

import React, { useState } from 'react';
import { Building, Plus, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function PlatformSocietiesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [apartments, setApartments] = useState(150);

  const [societiesList, setSocietiesList] = useState([
    { name: 'Greenwood Heights RWA', city: 'Bengaluru, KA', units: 180, status: 'ACTIVE' },
    { name: 'Prestige Lakeside Habitat', city: 'Bengaluru, KA', units: 1200, status: 'ACTIVE' },
    { name: 'DLF Cyber City Residency', city: 'Gurugram, HR', units: 450, status: 'ACTIVE' },
    { name: 'Hiranandani Gardens RWA', city: 'Mumbai, MH', units: 850, status: 'ACTIVE' },
  ]);

  const handleCreateSociety = (e: React.FormEvent) => {
    e.preventDefault();
    setSocietiesList([...societiesList, { name, city, units: Number(apartments), status: 'ACTIVE' }]);
    setModalOpen(false);
    setName('');
    setCity('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Societies &amp; RWAs Onboarding</h1>
          <p className="text-xs text-slate-500 mt-1">
            Approve new society registrations and manage tenant databases
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> Provision New Society
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Society Name</th>
                  <th className="py-3 px-4 font-semibold">City &amp; State</th>
                  <th className="py-3 px-4 font-semibold">Total Apartment Units</th>
                  <th className="py-3 px-4 font-semibold">Tenant Isolation</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societiesList.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-navy-950 text-sm">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.city}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{s.units} units</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                        <Shield className="w-3.5 h-3.5" /> Enforced RLS
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Provision New Apartment Society">
        <form onSubmit={handleCreateSociety} className="space-y-4 pt-2">
          <Input label="Society Name" placeholder="e.g. Palm Meadows RWA" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="City & State" placeholder="e.g. Whitefield, Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} required />
          <Input label="Estimated Apartment Units" type="number" value={apartments} onChange={(e) => setApartments(Number(e.target.value))} required />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10">
            Confirm &amp; Provision Tenant
          </Button>
        </form>
      </Modal>
    </div>
  );
}
