import React from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400 text-xs border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">ParcelEase</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Apartment parcel-management and scheduled-delivery platform designed for Indian gated communities, RWAs, and residents.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Bank-grade single-use OTP verification</span>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Solutions</h4>
            <ul className="space-y-2">
              <li><Link href="/for-societies" className="hover:text-white transition-colors">For Gated Societies</Link></li>
              <li><Link href="/for-societies" className="hover:text-white transition-colors">Resident Welfare Associations</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Scheduled Collection Pass</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Doorstep Delivery Routing</Link></li>
            </ul>
          </div>

          {/* Key Indian Hubs */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Serving Metros</h4>
            <ul className="space-y-2">
              <li>Bengaluru (Bellandur, Whitefield, HSR)</li>
              <li>Mumbai & Navi Mumbai</li>
              <li>Delhi NCR (Gurugram, Noida)</li>
              <li>Hyderabad (Gachibowli, Hitec City)</li>
              <li>Pune & Chennai</li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3">Security & Compliance</h4>
            <p className="text-slate-400 mb-3 leading-relaxed">
              Multi-tenant isolated PostgreSQL database with cryptographic OTP protection and zero credential exposure.
            </p>
            <span className="text-[11px] text-slate-500">
              Made with <Heart className="w-3 h-3 inline text-red-500 mx-0.5" /> for modern Indian apartment living.
            </span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ParcelEase Technologies Private Limited. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-400">RWA Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
