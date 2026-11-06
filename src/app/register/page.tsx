'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@/types';
import { useDemo } from '@/lib/context/demo-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Home,
  ShieldCheck,
  Building2,
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  User,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams?.get('role') as UserRole) || 'RESIDENT';
  const initialEmail = searchParams?.get('email') || '';

  const { register, society } = useDemo();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('+91 98');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role specific fields
  const [apartmentNumber, setApartmentNumber] = useState('A-302');
  const [societyName, setSocietyName] = useState(society.name);
  const [societyCity, setSocietyCity] = useState('Bengaluru, Karnataka');
  const [totalUnits, setTotalUnits] = useState(150);
  const [shiftTiming, setShiftTiming] = useState('Day Shift (08:00 - 20:00 IST)');
  const [adminDesignation, setAdminDesignation] = useState('RWA Secretary');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAccount, setSuccessAccount] = useState<{ name: string; role: UserRole; dashboardUrl: string } | null>(null);

  const getDashboardUrl = (role: UserRole) => {
    switch (role) {
      case 'RESIDENT': return '/resident';
      case 'STAFF': return '/staff';
      case 'SOCIETY_ADMIN': return '/admin';
      case 'PLATFORM_ADMIN': return '/platform-admin';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = register({
        email: email.trim(),
        password: password.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        role: selectedRole,
        apartment_number: selectedRole === 'RESIDENT' ? apartmentNumber.trim().toUpperCase() : undefined,
      });

      if (!result.success) {
        setErrorMsg(result.error || 'Registration failed');
        setIsSubmitting(false);
        return;
      }

      const targetUrl = getDashboardUrl(selectedRole);
      setSuccessAccount({
        name: fullName.trim(),
        role: selectedRole,
        dashboardUrl: targetUrl,
      });

      // Auto redirect after 1.5 seconds or let user click
      setTimeout(() => {
        router.push(targetUrl);
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Create Your Verified Society Account</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">Register for ParcelEase</h1>
          <p className="text-xs text-slate-500">
            Select your community role below to configure your tailored dashboard
          </p>
        </div>

        {/* Success Modal / Card Overlay */}
        {successAccount ? (
          <Card className="border-2 border-emerald-500/40 bg-emerald-50/30 p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy-950">Registration Complete!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Welcome, <strong>{successAccount.name}</strong>! Your account has been registered as{' '}
                <span className="font-semibold text-emerald-700">{successAccount.role.replace('_', ' ')}</span>.
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-600">
              Launching your dedicated {successAccount.role.replace('_', ' ')} Dashboard...
            </div>
            <Button
              onClick={() => router.push(successAccount.dashboardUrl)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-11 flex items-center justify-center gap-2"
            >
              Go to Dashboard Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        ) : (
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-navy-950">1. Select Your Role</CardTitle>
              <CardDescription className="text-xs">
                Each role grants specific operational permissions and a dedicated dashboard
              </CardDescription>

              {/* Role Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('RESIDENT')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'RESIDENT'
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className={`w-5 h-5 ${selectedRole === 'RESIDENT' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Resident</span>
                  <span className="text-[10px] text-slate-400">Apartment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('STAFF')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'STAFF'
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className={`w-5 h-5 ${selectedRole === 'STAFF' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Security Guard</span>
                  <span className="text-[10px] text-slate-400">Gate Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('SOCIETY_ADMIN')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'SOCIETY_ADMIN'
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${selectedRole === 'SOCIETY_ADMIN' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Society Admin</span>
                  <span className="text-[10px] text-slate-400">RWA / Estate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('PLATFORM_ADMIN')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === 'PLATFORM_ADMIN'
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe className={`w-5 h-5 ${selectedRole === 'PLATFORM_ADMIN' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Super Admin</span>
                  <span className="text-[10px] text-slate-400">Headquarters</span>
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                    2. Role &amp; Community Details
                  </span>

                  {/* Resident Specific Fields */}
                  {selectedRole === 'RESIDENT' && (
                    <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                            Apartment Society *
                          </label>
                          <select
                            value={societyName}
                            onChange={(e) => setSocietyName(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-navy-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Greenwood Heights RWA">{society.name} (Bengaluru)</option>
                            <option value="Prestige Lakeside Habitat">Prestige Lakeside Habitat</option>
                            <option value="DLF Cyber City Residency">DLF Cyber City Residency</option>
                          </select>
                        </div>

                        <Input
                          label="Apartment / Flat Number *"
                          placeholder="e.g. A-302, B-105"
                          value={apartmentNumber}
                          onChange={(e) => setApartmentNumber(e.target.value)}
                          helperText="Assigned unit for courier arrivals"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Staff Specific Fields */}
                  {selectedRole === 'STAFF' && (
                    <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                            Security Post / Gate *
                          </label>
                          <select className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-navy-950">
                            <option>Main Gate 1 Security Desk</option>
                            <option>North Gate 2 Desk</option>
                            <option>Tower Delivery Concierge</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                            Assigned Duty Shift *
                          </label>
                          <select
                            value={shiftTiming}
                            onChange={(e) => setShiftTiming(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-navy-950"
                          >
                            <option>Day Shift (08:00 - 20:00 IST)</option>
                            <option>Night Shift (20:00 - 08:00 IST)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Society Admin Specific Fields */}
                  {selectedRole === 'SOCIETY_ADMIN' && (
                    <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Society Name *"
                          value={societyName}
                          onChange={(e) => setSocietyName(e.target.value)}
                          placeholder="e.g. Palm Meadows RWA"
                          required
                        />
                        <Input
                          label="City & State *"
                          value={societyCity}
                          onChange={(e) => setSocietyCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Karnataka"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Estimated Total Units"
                          type="number"
                          value={totalUnits}
                          onChange={(e) => setTotalUnits(Number(e.target.value))}
                          required
                        />
                        <Input
                          label="RWA Designation"
                          value={adminDesignation}
                          onChange={(e) => setAdminDesignation(e.target.value)}
                          placeholder="e.g. President / Facility Manager"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Platform Admin */}
                  {selectedRole === 'PLATFORM_ADMIN' && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 mb-3">
                      <strong>Platform HQ Access:</strong> Creates a cross-society administrator account with supervision over all gated community tenants.
                    </div>
                  )}

                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3 mt-4">
                    3. Personal Credentials
                  </span>

                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Legal Name *"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />

                    <Input
                      label="Mobile Phone (for OTP & SMS) *"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email */}
                  <Input
                    label="Login Email Address *"
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  {/* Passwords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Password *"
                      type="password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <Input
                      label="Confirm Password *"
                      type="password"
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Error Notice */}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm h-11 shadow-md shadow-blue-500/20"
                  >
                    Complete Registration &amp; Open Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>

                {/* Link to login */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link
                      href={`/login?role=${selectedRole}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Sign In here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-16 text-xs text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          Loading Registration Portal...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
