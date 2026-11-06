'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquareWarning,
  Eye,
  Send,
  User,
  Building,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';
import { Complaint, ComplaintCategory, ComplaintStatus, ComplaintCommentAudience } from '@/types';

export default function StaffComplaintsPage() {
  const { currentUser, society, refreshState } = useDemo();

  const staffId = currentUser?.id || 'user-staff-1';
  const staffName = currentUser?.full_name || 'Ramesh Kumar (Gate 1)';

  // Tab filter
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Status Update & Comment Form States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [staffComment, setStaffComment] = useState('');
  const [staffCommentAudience, setStaffCommentAudience] = useState<ComplaintCommentAudience>('RESIDENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Strict Security Isolation: ONLY fetch complaints assigned to this logged-in staff member
  const myAssignedComplaints = MockDatabase.getComplaints({
    society_id: society.id,
    assigned_staff_id: staffId,
  });

  const activeComplaints = myAssignedComplaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED');
  const resolvedComplaints = myAssignedComplaints.filter((c) => c.status === 'RESOLVED');

  const displayedComplaints = myAssignedComplaints.filter((c) => {
    if (activeTab === 'ACTIVE') return c.status !== 'RESOLVED' && c.status !== 'REJECTED';
    if (activeTab === 'RESOLVED') return c.status === 'RESOLVED';
    return true;
  });

  const handleOpenStatusModal = (complaint: Complaint, status: 'IN_PROGRESS' | 'RESOLVED') => {
    // Security check: Guard cannot open complaints assigned to other staff
    if (complaint.assigned_to_staff_id !== staffId) {
      alert('Access Denied: You are not authorized to modify complaints assigned to another staff member.');
      return;
    }
    setSelectedComplaint(complaint);
    setTargetStatus(status);
    setResolutionNotes(complaint.resolution_notes || '');
    setIsUpdateModalOpen(true);
    setSuccessToast('');
  };

  const handleCommitStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    // Security check
    if (selectedComplaint.assigned_to_staff_id !== staffId) {
      alert('Unauthorized operation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = MockDatabase.updateComplaintStatus({
        complaintId: selectedComplaint.id,
        newStatus: targetStatus,
        changedByName: staffName,
        changedById: staffId,
        changedByRole: 'STAFF',
        notes: resolutionNotes.trim(),
      });

      if (res.success && res.complaint) {
        refreshState();
        setSelectedComplaint(res.complaint);
        setIsUpdateModalOpen(false);
        setSuccessToast(`Complaint #${res.complaint.id} successfully updated to ${targetStatus.replace('_', ' ')}!`);
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostStaffComment = (complaintId: string) => {
    if (!staffComment.trim()) return;

    // Security check
    const c = MockDatabase.getComplaintById(complaintId);
    if (!c || c.assigned_to_staff_id !== staffId) {
      alert('Unauthorized: You can only post comments on complaints assigned to you.');
      return;
    }

    try {
      MockDatabase.addComplaintComment({
        complaintId,
        authorId: staffId,
        authorName: staffName,
        authorRole: 'STAFF',
        message: staffComment.trim(),
        targetAudience: staffCommentAudience,
      });

      refreshState();
      const updated = MockDatabase.getComplaintById(complaintId);
      if (updated && selectedComplaint?.id === complaintId) {
        setSelectedComplaint(updated);
      }
      setStaffComment('');
    } catch (err: any) {
      alert(`Error posting note: ${err.message}`);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-amber-50 text-amber-800 border-amber-200">Under Review</Badge>;
      case 'ASSIGNED':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Assigned to You</Badge>;
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
            <AlertCircle className="w-6 h-6 text-amber-600" />
            Assigned Complaints &amp; Inspections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in Officer: <strong className="text-navy-950 font-bold">{staffName}</strong> &bull;{' '}
            {society.name} Gate Terminal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/staff">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Guard Desk
            </Button>
          </Link>
          <Link href="/staff/audit">
            <Button variant="outline" size="sm" className="text-xs">
              Staff Activity Log
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* KPI Cards for Officer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Assigned to Me
              </p>
              <h3 className="text-2xl font-extrabold text-navy-950 mt-1">
                {myAssignedComplaints.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                Action Required / In Progress
              </p>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-1">
                {activeComplaints.length}
              </h3>
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
                Successfully Resolved
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
                {resolvedComplaints.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          Active Tasks ({activeComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'RESOLVED'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          Resolved Tasks ({resolvedComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          All Assigned ({myAssignedComplaints.length})
        </button>
      </div>

      {/* Complaints List */}
      {displayedComplaints.length === 0 ? (
        <Card className="border-slate-200 bg-white text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-navy-950 text-sm">All Clear! No Assigned Complaints</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'ACTIVE'
                ? `You have no pending complaints assigned to you right now. Any issues assigned by Society Admin Dr. Arvind Sharma will appear here.`
                : `No tasks found under ${activeTab.toLowerCase()} status.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedComplaints.map((item) => (
            <Card
              key={item.id}
              className="border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
            >
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-navy-950">{item.id}</span>
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.priority === 'HIGH' || item.priority === 'URGENT' ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Priority: {item.priority}
                      </span>
                    ) : null}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Filed: {formatIST(item.created_at)}
                  </span>
                </div>

                {/* Resident Details */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Resident
                    </span>
                    <strong className="text-navy-950">{item.resident_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Apartment
                    </span>
                    <strong className="text-blue-700 font-bold">Unit {item.apartment_number}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Phone Number
                    </span>
                    <span>{item.resident_phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Assigned To
                    </span>
                    <span className="text-emerald-700 font-bold">{item.assigned_to_staff_name}</span>
                  </div>
                </div>

                {/* Subject & Description */}
                <div>
                  <h3 className="font-bold text-navy-950 text-sm leading-snug">{item.subject}</h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {item.description}
                  </p>
                </div>

                {/* Photo Evidence Attached by Resident */}
                {item.attachment_url && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Resident Photo Evidence:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedImagePreview(item.attachment_url!)}
                      className="inline-flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 transition-all text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.attachment_url}
                        alt="Resident evidence"
                        className="w-12 h-12 object-cover rounded border border-slate-200"
                      />
                      <div className="pr-2">
                        <span className="text-xs font-bold text-blue-600 block">
                          Inspect Attached Photo
                        </span>
                        <span className="text-[10px] text-slate-400">Click to view full image</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Resolution Notes Display (If Resolved) */}
                {item.status === 'RESOLVED' && item.resolution_notes && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Resolution Completed</span>
                    </div>
                    <p className="text-emerald-900 text-xs pl-5">{item.resolution_notes}</p>
                    {item.resolved_by_name && (
                      <p className="text-[10px] text-emerald-700 pl-5">
                        Logged by {item.resolved_by_name} &bull; {item.resolved_at ? formatIST(item.resolved_at) : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Discussion Thread with Targeted Updates */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Investigation Notes &amp; Targeted Updates ({item.comments.length})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Personal resident &amp; admin updates enabled
                    </span>
                  </div>

                  {(() => {
                    // Filter out private communications between resident & society admin
                    const visibleComments = item.comments.filter((comm) => {
                      if (comm.target_audience === 'SOCIETY_ADMIN' && comm.author_role === 'RESIDENT') return false;
                      if (comm.target_audience === 'RESIDENT' && (comm.author_role === 'SOCIETY_ADMIN' || comm.author_role === 'PLATFORM_ADMIN')) return false;
                      return true;
                    });

                    if (visibleComments.length === 0) {
                      return <p className="text-xs text-slate-400 italic">No notes posted yet.</p>;
                    }

                    return (
                      <div className="space-y-2">
                        {visibleComments.map((comm) => {
                          const isStaff = comm.author_role === 'STAFF';
                          const isResident = comm.author_role === 'RESIDENT';
                          const isAdmin = comm.author_role === 'SOCIETY_ADMIN' || comm.author_role === 'PLATFORM_ADMIN';

                          return (
                            <div
                              key={comm.id}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                isStaff
                                  ? 'bg-blue-50/70 border-blue-200'
                                  : isResident
                                  ? 'bg-amber-50/60 border-amber-200'
                                  : 'bg-purple-50/60 border-purple-200'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                                <div className="flex items-center gap-1.5 font-bold text-navy-950">
                                  <span>
                                    {comm.author_name} ({comm.author_role.replace('_', ' ')})
                                  </span>
                                  {comm.target_audience === 'RESIDENT' && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[9px] px-1.5 py-0">
                                      👤 Personal to Resident
                                    </Badge>
                                  )}
                                  {comm.target_audience === 'SOCIETY_ADMIN' && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[9px] px-1.5 py-0">
                                      🔒 Internal to Admin
                                    </Badge>
                                  )}
                                  {comm.target_audience === 'STAFF' && isResident && (
                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] px-1.5 py-0">
                                      👮 Direct from Resident
                                    </Badge>
                                  )}
                                  {comm.target_audience === 'STAFF' && isAdmin && (
                                    <Badge className="bg-slate-100 text-slate-800 border-slate-300 text-[9px] px-1.5 py-0">
                                      🔒 Instruction from Admin
                                    </Badge>
                                  )}
                                  {(!comm.target_audience || comm.target_audience === 'ALL') && (
                                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] px-1.5 py-0">
                                      🌐 Public
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

                  {/* Staff Reply Box with Recipient Selector */}
                  {item.status !== 'RESOLVED' && (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[11px] font-semibold text-slate-600 shrink-0">Send Update To:</span>
                        <select
                          value={staffCommentAudience}
                          onChange={(e) => setStaffCommentAudience(e.target.value as ComplaintCommentAudience)}
                          className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="RESIDENT">👤 Personal Update to Resident (Unit {item.apartment_number})</option>
                          <option value="SOCIETY_ADMIN">🔒 Internal Note to Society Admin (Hidden from Resident)</option>
                          <option value="ALL">🌐 Public (All Parties)</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder={
                            staffCommentAudience === 'RESIDENT'
                              ? `Type personal update or ETA for resident in Unit ${item.apartment_number}...`
                              : staffCommentAudience === 'SOCIETY_ADMIN'
                              ? 'Type internal investigation report / escalation for society admin...'
                              : 'Add public field notes or CCTV observations...'
                          }
                          value={selectedComplaint?.id === item.id ? staffComment : ''}
                          onFocus={() => setSelectedComplaint(item)}
                          onChange={(e) => setStaffComment(e.target.value)}
                          className="h-9 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => handlePostStaffComment(item.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Post Note
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Staff Actions Bar */}
                {item.status !== 'RESOLVED' && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 justify-end">
                    {item.status === 'ASSIGNED' && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenStatusModal(item, 'IN_PROGRESS')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" /> Start Investigation (In Progress)
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={() => handleOpenStatusModal(item, 'RESOLVED')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complaint as Resolved
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {isUpdateModalOpen && selectedComplaint && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update Complaint #${selectedComplaint.id}`}
          description={`Update status to ${targetStatus.replace('_', ' ')} and notify Unit ${selectedComplaint.apartment_number}`}
        >
          <form onSubmit={handleCommitStatusUpdate} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Subject</span>
              <p className="font-bold text-navy-950">{selectedComplaint.subject}</p>
              <span className="text-[11px] text-slate-500 block">
                Resident: {selectedComplaint.resident_name} &bull; Unit {selectedComplaint.apartment_number}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Select Status *
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as 'IN_PROGRESS' | 'RESOLVED')}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="IN_PROGRESS">In Progress (Investigating / Reviewing CCTV)</option>
                <option value="RESOLVED">Resolved (Issue Addressed / Verified)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {targetStatus === 'RESOLVED'
                  ? 'Official Resolution Notes (Visible to Resident & Admin) *'
                  : 'Investigation Notes / Observations (Optional)'}
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder={
                  targetStatus === 'RESOLVED'
                    ? 'Explain how the issue was resolved (e.g. inspected parcel with courier executive, rectified shelf tag, verified CCTV)...'
                    : 'Notes regarding CCTV review, courier inquiry, or gate findings...'
                }
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required={targetStatus === 'RESOLVED'}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4"
              >
                Save &amp; Notify Resident
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Full Image Preview Modal */}
      {selectedImagePreview && (
        <Modal
          isOpen={Boolean(selectedImagePreview)}
          onClose={() => setSelectedImagePreview(null)}
          title="Resident Photograph Evidence"
        >
          <div className="space-y-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImagePreview}
              alt="Evidence preview"
              className="max-h-[70vh] max-w-full mx-auto rounded-lg border border-slate-200 shadow-md object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedImagePreview(null)}
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
