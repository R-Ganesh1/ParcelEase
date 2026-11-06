'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareWarning,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  Send,
  Eye,
  UserCheck,
  Building,
  Calendar,
  Image as ImageIcon,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintCommentAudience,
} from '@/types';

export default function AdminComplaintsPage() {
  const { currentUser, society, refreshState } = useDemo();

  const adminName = currentUser?.full_name || 'Dr. Arvind Sharma';
  const adminId = currentUser?.id || 'user-admin-1';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'PRIORITY'>('NEWEST');

  // Selected complaint for modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Assignment & Status Form State inside Modal
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [adminCommentAudience, setAdminCommentAudience] = useState<ComplaintCommentAudience>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Fetch all society complaints
  const allComplaints = MockDatabase.getComplaints({
    society_id: society.id,
  });

  // Fetch available staff members in this society
  const staffMembers = MockDatabase.getProfiles().filter(
    (p) => p.role === 'STAFF' && p.society_id === society.id
  );

  // Compute KPI counts
  const totalCount = allComplaints.length;
  const unassignedCount = allComplaints.filter(
    (c) => !c.assigned_to_staff_id && c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  ).length;
  const inProgressCount = allComplaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'UNDER_REVIEW'
  ).length;
  const resolvedCount = allComplaints.filter((c) => c.status === 'RESOLVED').length;

  // Filter & Search logic
  const filteredComplaints = allComplaints
    .filter((c) => {
      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesResident = c.resident_name.toLowerCase().includes(q);
        const matchesApt = c.apartment_number.toLowerCase().includes(q);
        const matchesSubject = c.subject.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesId && !matchesResident && !matchesApt && !matchesSubject && !matchesDesc) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'NEWEST') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === 'OLDEST') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === 'PRIORITY') {
        const pMap: Record<ComplaintPriority, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      return 0;
    });

  // Open modal and sync state
  const handleOpenManageModal = (c: Complaint) => {
    // Refresh latest copy
    const latest = MockDatabase.getComplaintById(c.id) || c;
    setSelectedComplaint(latest);
    setSelectedStaffId(latest.assigned_to_staff_id || (staffMembers[0]?.id || ''));
    setNewStatus(latest.status);
    setAssignNotes('');
    setStatusNotes(latest.resolution_notes || '');
    setAdminComment('');
    setAdminCommentAudience('ALL');
    setActionSuccessMsg('');
  };

  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedStaffId) return;

    setIsProcessing(true);
    try {
      const res = MockDatabase.assignComplaint({
        complaintId: selectedComplaint.id,
        staffId: selectedStaffId,
        assignedByName: adminName,
        assignedById: adminId,
        notes: assignNotes.trim(),
      });

      if (res.success && res.complaint) {
        refreshState();
        setSelectedComplaint(res.complaint);
        setActionSuccessMsg(`Successfully assigned to ${res.complaint.assigned_to_staff_name}!`);
        setAssignNotes('');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsProcessing(true);
    try {
      const res = MockDatabase.updateComplaintStatus({
        complaintId: selectedComplaint.id,
        newStatus,
        changedByName: adminName,
        changedById: adminId,
        changedByRole: 'SOCIETY_ADMIN',
        notes: statusNotes.trim(),
      });

      if (res.success && res.complaint) {
        refreshState();
        setSelectedComplaint(res.complaint);
        setActionSuccessMsg(`Status updated to ${newStatus.replace('_', ' ')}! Resident notified.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePostAdminComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !adminComment.trim()) return;

    try {
      MockDatabase.addComplaintComment({
        complaintId: selectedComplaint.id,
        authorId: adminId,
        authorName: adminName,
        authorRole: 'SOCIETY_ADMIN',
        message: adminComment.trim(),
        targetAudience: adminCommentAudience,
      });

      refreshState();
      const updated = MockDatabase.getComplaintById(selectedComplaint.id);
      if (updated) setSelectedComplaint(updated);
      setAdminComment('');
    } catch (err: any) {
      alert(`Error posting comment: ${err.message}`);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-amber-50 text-amber-800 border-amber-200">Under Review</Badge>;
      case 'ASSIGNED':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Assigned</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-cyan-50 text-cyan-800 border-cyan-200">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200">Resolved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-50 text-rose-800 border-rose-200">Rejected</Badge>;
    }
  };

  const getCategoryLabel = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'PARCEL_DAMAGED':
        return 'Damaged Parcel';
      case 'DELAYED_DELIVERY':
        return 'Delayed Delivery';
      case 'STAFF_BEHAVIOR':
        return 'Staff Conduct';
      case 'LOST_PARCEL':
        return 'Lost Parcel';
      case 'WRONG_HANDOVER':
        return 'Wrong Handover';
      case 'GATE_ACCESS':
        return 'Gate Access';
      case 'OPERATING_HOURS':
        return 'Operating Hours';
      case 'OTHER':
        return 'Other';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-blue-600" />
            Resident Complaint &amp; Grievance Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise, assign security officers, and resolve resident grievances for {society.name}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Complaints
              </p>
              <h3 className="text-2xl font-extrabold text-navy-950 mt-1">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
                Pending Staff Assignment
              </p>
              <h3 className="text-2xl font-extrabold text-rose-700 mt-1">{unassignedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                In Progress / Review
              </p>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-1">{inProgressCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                Resolved Rate
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
                {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ID, Unit, Resident, Subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Statuses ({allComplaints.length})</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All Categories</option>
                <option value="PARCEL_DAMAGED">Damaged Parcel</option>
                <option value="DELAYED_DELIVERY">Delayed Delivery</option>
                <option value="STAFF_BEHAVIOR">Staff Conduct</option>
                <option value="LOST_PARCEL">Lost Parcel</option>
                <option value="WRONG_HANDOVER">Wrong Handover</option>
                <option value="GATE_ACCESS">Gate Access</option>
                <option value="OPERATING_HOURS">Operating Hours</option>
                <option value="OTHER">Other Issues</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="PRIORITY">Sort: Urgent &amp; High Priority</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Resident Complaints Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredComplaints.length} of {allComplaints.length} recorded complaints
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No resident complaints matching the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Resident &amp; Unit</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject &amp; Details</th>
                    <th className="py-3 px-4">Date Filed</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => handleOpenManageModal(item)}
                    >
                      {/* ID & Priority */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-navy-950 block">{item.id}</span>
                        {item.priority === 'HIGH' || item.priority === 'URGENT' ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                            {item.priority}
                          </span>
                        ) : null}
                      </td>

                      {/* Resident Name & Unit */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-navy-950 block">{item.resident_name}</span>
                        <span className="text-[11px] text-blue-600 font-bold block">
                          Unit {item.apartment_number}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{item.resident_phone}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {getCategoryLabel(item.category)}
                        </span>
                      </td>

                      {/* Subject & Description Snippet */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-navy-950 truncate">{item.subject}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.description}</div>
                        {item.attachment_url && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold mt-0.5">
                            <ImageIcon className="w-3 h-3" /> Photo Attached
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatIST(item.created_at)}
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-3 px-4">
                        {item.assigned_to_staff_name ? (
                          <div className="flex items-center gap-1.5 text-navy-950">
                            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold truncate">{item.assigned_to_staff_name}</span>
                          </div>
                        ) : (
                          <span className="text-rose-600 font-semibold text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenManageModal(item);
                          }}
                          className="text-xs h-8 text-blue-700 hover:text-white hover:bg-blue-600 group-hover:border-blue-300"
                        >
                          Manage &amp; Assign &rarr;
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* COMPLAINT MANAGEMENT MODAL */}
      {selectedComplaint && (
        <Modal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Details: ${selectedComplaint.id}`}
          description={`Filed by ${selectedComplaint.resident_name} for Unit ${selectedComplaint.apartment_number}`}
        >
          <div className="space-y-5 text-xs max-h-[80vh] overflow-y-auto pr-1">
            {/* Success Alert Banner */}
            {actionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{actionSuccessMsg}</span>
              </div>
            )}

            {/* Resident & Grievance Overview Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedComplaint.status)}
                  <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {getCategoryLabel(selectedComplaint.category)}
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Priority: {selectedComplaint.priority}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Filed: {formatIST(selectedComplaint.created_at)}
                </span>
              </div>

              <div>
                <span className="font-bold text-navy-950 text-sm block">
                  {selectedComplaint.subject}
                </span>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed whitespace-pre-line">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Photo Evidence Preview */}
              {selectedComplaint.attachment_url && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Resident Photo Attachment:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedImageModal(selectedComplaint.attachment_url!)}
                    className="inline-flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedComplaint.attachment_url}
                      alt="Damage preview"
                      className="w-14 h-14 object-cover rounded border border-slate-200"
                    />
                    <div className="pr-2">
                      <span className="text-xs font-bold text-blue-600 block">Click to enlarge image</span>
                      <span className="text-[10px] text-slate-400">High resolution preview</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Resident Contact Info */}
              <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400">Resident:</span>{' '}
                  <strong className="text-navy-950">{selectedComplaint.resident_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Unit:</span>{' '}
                  <strong className="text-blue-700">Apartment {selectedComplaint.apartment_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span>{selectedComplaint.resident_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>{' '}
                  <span className="truncate block">{selectedComplaint.resident_email}</span>
                </div>
              </div>
            </div>

            {/* ACTION 1: Assign to Staff Guard (One-time only) */}
            {selectedComplaint.assigned_to_staff_id ? (
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-navy-950 text-xs block">
                        Assigned Officer: {selectedComplaint.assigned_to_staff_name}
                      </span>
                      <span className="text-[10px] text-purple-700 font-medium">
                        Security Staff Custody &bull; Assignment Locked (Single Assignment Enforced)
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[10px] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Assigned Once
                  </Badge>
                </div>
                {selectedComplaint.assigned_at && (
                  <p className="text-[11px] text-slate-600 pl-10">
                    Delegated for physical verification on {formatIST(selectedComplaint.assigned_at)}. Additional re-assignments are disabled to preserve accountability.
                  </p>
                )}
              </div>
            ) : (
              <Card className="border-blue-200 bg-blue-50/40">
                <CardHeader className="p-3 border-b border-blue-100">
                  <CardTitle className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Assign Security Staff Officer
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Delegates physical inspection and CCTV verification to on-duty staff (Can be assigned once)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <form onSubmit={handleAssignStaff} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Select Staff Member *
                      </label>
                      <select
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        required
                      >
                        <option value="">-- Select Staff Officer --</option>
                        {staffMembers.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.full_name} ({staff.email}) &bull; {staff.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Assignment Instructions / Internal Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={assignNotes}
                        onChange={(e) => setAssignNotes(e.target.value)}
                        placeholder="e.g. Please verify delivery executive intake notes from Amazon at Gate 1"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isProcessing || !selectedStaffId}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9"
                    >
                      Assign Staff &amp; Dispatch Notifications
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ACTION 2: Update Complaint Status & Resolution Notes */}
            <Card className="border-slate-200">
              <CardHeader className="p-3 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Update Status &amp; Record Resolution Notes
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Current status: <strong className="text-navy-950">{selectedComplaint.status.replace('_', ' ')}</strong>. Updates resident dashboard and dispatches in-app status notification.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      New Complaint Status *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    {newStatus === selectedComplaint.status && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        Select a different status to submit an update.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {newStatus === 'RESOLVED'
                        ? 'Official Resolution Notes (Visible to Resident) *'
                        : newStatus === 'REJECTED'
                        ? 'Rejection Reason (Visible to Resident) *'
                        : 'Status Change Notes (Optional)'}
                    </label>
                    <textarea
                      rows={2}
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder={
                        newStatus === 'RESOLVED'
                          ? 'Explain how the issue was verified and resolved with courier/staff...'
                          : 'Provide explanation or context for resident...'
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required={newStatus === 'RESOLVED' || newStatus === 'REJECTED'}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || newStatus === selectedComplaint.status}
                    size="sm"
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs h-9 disabled:opacity-50"
                  >
                    Commit Status Update &amp; Notify Resident
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Audit History Timeline */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Official Custody &amp; Status Timeline
              </span>
              <div className="space-y-1.5 text-xs">
                {selectedComplaint.status_history.map((h, i) => (
                  <div key={h.id || i} className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1">
                    <div>
                      <strong className="text-navy-950 font-bold">{h.to_status.replace('_', ' ')}</strong>{' '}
                      &bull; <span className="text-slate-500">by {h.changed_by_name} ({h.changed_by_role})</span>
                      {h.notes && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">&ldquo;{h.notes}&rdquo;</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{formatIST(h.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Thread with Personal / Targeted Messaging */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Discussion &amp; Targeted Updates Thread
                </span>
                <span className="text-[10px] text-slate-400">
                  Targeted messaging enabled
                </span>
              </div>

              {(() => {
                // Filter comments: Hide personal direct chat between resident and staff
                const visibleComments = selectedComplaint.comments.filter((comm) => {
                  if (comm.target_audience === 'STAFF' && comm.author_role === 'RESIDENT') return false;
                  if (comm.target_audience === 'RESIDENT' && comm.author_role === 'STAFF') return false;
                  return true;
                });

                if (visibleComments.length === 0) {
                  return <p className="text-xs text-slate-400 italic">No updates posted yet.</p>;
                }

                return (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {visibleComments.map((comm) => {
                      const isTargetResident = comm.target_audience === 'RESIDENT';
                      const isTargetStaff = comm.target_audience === 'STAFF';
                      const isTargetAdmin = comm.target_audience === 'SOCIETY_ADMIN';

                      return (
                        <div
                          key={comm.id}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-navy-950">
                              <span>
                                {comm.author_name} ({comm.author_role.replace('_', ' ')})
                              </span>
                              {isTargetResident && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0">
                                  👤 Direct to Resident
                                </Badge>
                              )}
                              {isTargetStaff && (
                                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] px-1.5 py-0">
                                  🔒 Private Note to Staff
                                </Badge>
                              )}
                              {isTargetAdmin && (
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] px-1.5 py-0">
                                  🏛️ Direct to Admin
                                </Badge>
                              )}
                              {(!comm.target_audience || comm.target_audience === 'ALL') && (
                                <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] px-1.5 py-0">
                                  🌐 Public to All
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{formatIST(comm.created_at)}</span>
                          </div>
                          <p className="text-slate-700">{comm.message}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Admin Comment Input with Recipient Target Selector */}
              <form onSubmit={handlePostAdminComment} className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-600 shrink-0">Send To:</span>
                  <select
                    value={adminCommentAudience}
                    onChange={(e) => setAdminCommentAudience(e.target.value as ComplaintCommentAudience)}
                    className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">🌐 Public (Resident &amp; Staff)</option>
                    <option value="RESIDENT">👤 Direct to Resident (Unit {selectedComplaint.apartment_number})</option>
                    {selectedComplaint.assigned_to_staff_id && (
                      <option value="STAFF">🔒 Private Note to Staff ({selectedComplaint.assigned_to_staff_name})</option>
                    )}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder={
                      adminCommentAudience === 'RESIDENT'
                        ? 'Type personal update or clarification for resident...'
                        : adminCommentAudience === 'STAFF'
                        ? 'Type private investigation instruction for assigned guard...'
                        : 'Post an official update visible to all parties...'
                    }
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 shrink-0">
                    <Send className="w-3.5 h-3.5 mr-1" /> Post
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Full Image Preview Modal */}
      {selectedImageModal && (
        <Modal
          isOpen={Boolean(selectedImageModal)}
          onClose={() => setSelectedImageModal(null)}
          title="Attached Photograph"
        >
          <div className="space-y-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImageModal}
              alt="Damage preview"
              className="max-h-[70vh] max-w-full mx-auto rounded-lg border border-slate-200 shadow-md object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedImageModal(null)}
              className="text-xs"
            >
              Close Preview
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
