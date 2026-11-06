'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareWarning,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  User,
  Paperclip,
  Image as ImageIcon,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Filter,
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

export default function ResidentComplaintsPage() {
  const { currentUser, society, refreshState } = useDemo();

  const residentApartment = currentUser?.apartment_number || 'A-204';
  const residentName = currentUser?.full_name || 'Ananya Rao';
  const residentEmail = currentUser?.email || 'resident@parcelease.in';
  const residentPhone = currentUser?.phone || '+91 98860 12345';
  const residentId = currentUser?.id || 'user-resident-1';

  // State
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyAudienceMap, setReplyAudienceMap] = useState<Record<string, ComplaintCommentAudience>>({});

  // New Complaint Form State
  const [category, setCategory] = useState<ComplaintCategory>('PARCEL_DAMAGED');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentData, setAttachmentData] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<Complaint | null>(null);

  // Fetch complaints for current resident's apartment
  const complaints = MockDatabase.getComplaints({
    society_id: society.id,
    apartment_number: residentApartment,
  });

  const activeComplaints = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  );
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED');

  const filteredComplaints = complaints.filter((c) => {
    if (filterTab === 'ACTIVE') return c.status !== 'RESOLVED' && c.status !== 'REJECTED';
    if (filterTab === 'RESOLVED') return c.status === 'RESOLVED';
    return true;
  });

  // Handle File Upload & Convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAttachmentData(undefined);
    setAttachmentName('');
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const created = MockDatabase.submitComplaint({
        society_id: society.id,
        apartment_number: residentApartment,
        resident_id: residentId,
        resident_name: residentName,
        resident_email: residentEmail,
        resident_phone: residentPhone,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        attachment_url: attachmentData,
      });

      refreshState();
      setSubmitSuccess(created);
      setIsSubmitModalOpen(false);

      // Reset form
      setSubject('');
      setDescription('');
      setCategory('PARCEL_DAMAGED');
      setPriority('MEDIUM');
      setAttachmentData(undefined);
      setAttachmentName('');
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = (complaintId: string) => {
    const text = replyTextMap[complaintId]?.trim();
    if (!text) return;

    const audience = replyAudienceMap[complaintId] || 'ALL';

    MockDatabase.addComplaintComment({
      complaintId,
      authorId: residentId,
      authorName: residentName,
      authorRole: 'RESIDENT',
      message: text,
      targetAudience: audience,
    });

    refreshState();
    setReplyTextMap((prev) => ({ ...prev, [complaintId]: '' }));
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
        return 'Other General';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-blue-600" />
            Apartment Grievance &amp; Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official escalation portal for Apartment {residentApartment} &bull; {society.name}
          </p>
        </div>

        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-4 shadow-sm flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> File New Complaint
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Filed
              </p>
              <h3 className="text-2xl font-extrabold text-navy-950 mt-1">{complaints.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                Active / Under Review
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
                Resolved Grievances
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
          onClick={() => setFilterTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'ALL'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          All Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'ACTIVE'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          Active / In Progress ({activeComplaints.length})
        </button>
        <button
          onClick={() => setFilterTab('RESOLVED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'RESOLVED'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          Resolved ({resolvedComplaints.length})
        </button>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card className="border-slate-200 bg-white text-center py-12">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-navy-950 text-sm">No Complaints Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filterTab === 'ALL'
                ? 'Your apartment has no active or historical complaints logged. Click below to file a request.'
                : `No complaints currently in ${filterTab.toLowerCase()} status.`}
            </p>
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs mt-2"
            >
              + File a Complaint
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((item) => {
            const isExpanded = expandedComplaintId === item.id;

            return (
              <Card
                key={item.id}
                className="border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  {/* Top Bar: ID, Status, Category, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-navy-900">{item.id}</span>
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.priority === 'HIGH' || item.priority === 'URGENT' ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {item.priority}
                        </span>
                      ) : null}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatIST(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Subject & Description */}
                  <div>
                    <h3 className="font-bold text-navy-950 text-sm leading-snug">{item.subject}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>

                  {/* Image Attachment Preview Thumbnail */}
                  {item.attachment_url && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Attachment:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedImagePreview(item.attachment_url!)}
                        className="inline-flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-all group text-left"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.attachment_url}
                          alt="Attachment preview"
                          className="w-12 h-12 object-cover rounded border border-slate-200"
                        />
                        <div className="pr-2">
                          <span className="text-xs font-semibold text-blue-600 group-hover:underline block">
                            View Uploaded Photo
                          </span>
                          <span className="text-[10px] text-slate-400">Click to expand</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Staff Assignment & Resolution Banners */}
                  <div className="space-y-2 pt-1">
                    {item.assigned_to_staff_name && (
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            Assigned Security Officer:{' '}
                            <strong className="font-bold">{item.assigned_to_staff_name}</strong>
                          </span>
                        </div>
                        {item.assigned_at && (
                          <span className="text-[10px] text-blue-600">
                            Assigned {formatIST(item.assigned_at)}
                          </span>
                        )}
                      </div>
                    )}

                    {item.status === 'RESOLVED' && item.resolution_notes && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Official Resolution from Administration</span>
                        </div>
                        <p className="text-emerald-900 text-xs pl-5 leading-relaxed">
                          {item.resolution_notes}
                        </p>
                        {item.resolved_by_name && (
                          <p className="text-[10px] text-emerald-700 pl-5 pt-0.5">
                            Resolved by {item.resolved_by_name} &bull;{' '}
                            {item.resolved_at ? formatIST(item.resolved_at) : ''}
                          </p>
                        )}
                      </div>
                    )}

                    {item.status === 'REJECTED' && item.rejection_reason && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Rejection Notice</span>
                        </div>
                        <p className="text-rose-900 text-xs pl-5 leading-relaxed">
                          {item.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expand / Collapse Response Thread & Audit History */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedComplaintId(isExpanded ? null : item.id)
                      }
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                    >
                      <span>
                        {isExpanded
                          ? 'Hide Timeline & Responses'
                          : `View Responses & Timeline (${item.comments.length} updates)`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <span className="text-[10px] text-slate-400 font-medium">
                      Status: {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Expanded Section: Audit Log + Response Thread */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-4 animate-in fade-in">
                      {/* Chronological Status Audit Log */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Official Custody &amp; Status Timeline</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {item.status_history.map((h, idx) => (
                            <div key={h.id || idx} className="flex items-start gap-2 pl-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <span className="font-semibold text-navy-950">
                                  {h.to_status.replace('_', ' ')}
                                </span>{' '}
                                &bull;{' '}
                                <span className="text-slate-500">
                                  by {h.changed_by_name} ({h.changed_by_role})
                                </span>{' '}
                                {h.notes && (
                                  <span className="text-slate-600 italic block text-[11px]">
                                    &ldquo;{h.notes}&rdquo;
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {formatIST(h.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comments / Targeted Discussion Thread */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Discussion &amp; Targeted Updates ({item.comments.length})
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Ask staff or admin directly
                          </span>
                        </div>

                        {(() => {
                          // Hide internal staff-to-admin and admin-to-staff notes
                          const visibleComments = item.comments.filter((comm) => {
                            if (comm.target_audience === 'SOCIETY_ADMIN' && comm.author_role === 'STAFF') return false;
                            if (comm.target_audience === 'STAFF' && (comm.author_role === 'SOCIETY_ADMIN' || comm.author_role === 'PLATFORM_ADMIN')) return false;
                            if (comm.is_internal && comm.target_audience !== 'RESIDENT' && comm.author_role !== 'RESIDENT') return false;
                            return true;
                          });

                          if (visibleComments.length === 0) {
                            return (
                              <p className="text-xs text-slate-400 italic py-1">
                                No notes posted yet. Security desk supervisor and RWA committee have been notified.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-2">
                              {visibleComments.map((comm) => {
                                const isStaff = comm.author_role === 'STAFF';
                                const isAdmin = comm.author_role === 'SOCIETY_ADMIN' || comm.author_role === 'PLATFORM_ADMIN';
                                const isResident = comm.author_role === 'RESIDENT';

                                return (
                                  <div
                                    key={comm.id}
                                    className={`p-3 rounded-xl text-xs space-y-1 ${
                                      isStaff
                                        ? 'bg-blue-50/80 border border-blue-200 text-navy-950'
                                        : isAdmin
                                        ? 'bg-purple-50/80 border border-purple-200 text-navy-950'
                                        : 'bg-slate-100 border border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                                      <div className="flex items-center gap-1.5 font-bold">
                                        {isStaff ? (
                                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                                        ) : isAdmin ? (
                                          <User className="w-3.5 h-3.5 text-purple-600" />
                                        ) : null}
                                        <span>{comm.author_name}</span>
                                        <span className="text-[10px] font-normal text-slate-500">
                                          ({comm.author_role.replace('_', ' ')})
                                        </span>

                                        {comm.target_audience === 'RESIDENT' && isStaff && (
                                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[9px] px-1.5 py-0">
                                            👤 Personal from Staff
                                          </Badge>
                                        )}
                                        {comm.target_audience === 'RESIDENT' && isAdmin && (
                                          <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[9px] px-1.5 py-0">
                                            👤 Direct from Admin
                                          </Badge>
                                        )}
                                        {comm.target_audience === 'STAFF' && isResident && (
                                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[9px] px-1.5 py-0">
                                            👮 Question to Staff
                                          </Badge>
                                        )}
                                        {comm.target_audience === 'SOCIETY_ADMIN' && isResident && (
                                          <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-[9px] px-1.5 py-0">
                                            🏛️ Question to Admin
                                          </Badge>
                                        )}
                                        {(!comm.target_audience || comm.target_audience === 'ALL') && (
                                          <Badge className="bg-slate-200 text-slate-700 border-slate-300 text-[9px] px-1.5 py-0">
                                            🌐 Public
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {formatIST(comm.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed pl-0.5">
                                      {comm.message}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* Inline Resident Reply Box with Recipient Selector */}
                        {item.status !== 'RESOLVED' && item.status !== 'REJECTED' && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[11px] font-semibold text-slate-600 shrink-0">Ask / Message:</span>
                              <select
                                value={replyAudienceMap[item.id] || (item.assigned_to_staff_id ? 'STAFF' : 'SOCIETY_ADMIN')}
                                onChange={(e) =>
                                  setReplyAudienceMap((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value as ComplaintCommentAudience,
                                  }))
                                }
                                className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              >
                                {item.assigned_to_staff_id && (
                                  <option value="STAFF">
                                    👮 Ask Security Staff Directly ({item.assigned_to_staff_name})
                                  </option>
                                )}
                                <option value="SOCIETY_ADMIN">🏛️ Ask Society Admin Directly</option>
                                <option value="ALL">🌐 Public (Everyone)</option>
                              </select>
                            </div>

                            <div className="flex gap-2">
                              <Input
                                placeholder={
                                  (replyAudienceMap[item.id] || (item.assigned_to_staff_id ? 'STAFF' : 'SOCIETY_ADMIN')) === 'STAFF'
                                    ? `Ask ${item.assigned_to_staff_name || 'security staff'} a question...`
                                    : (replyAudienceMap[item.id] || (item.assigned_to_staff_id ? 'STAFF' : 'SOCIETY_ADMIN')) === 'SOCIETY_ADMIN'
                                    ? 'Ask society administration a question...'
                                    : 'Write a response visible to all parties...'
                                }
                                value={replyTextMap[item.id] || ''}
                                onChange={(e) =>
                                  setReplyTextMap((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="h-9 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendReply(item.id);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => handleSendReply(item.id)}
                                size="sm"
                                className="bg-navy-900 hover:bg-navy-800 text-white text-xs px-3 shrink-0"
                              >
                                <Send className="w-3.5 h-3.5 mr-1" /> Send
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Resident Grievance / Complaint"
        description="Formal complaint lodged with Greenwood Heights RWA and security gate staff"
      >
        <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
          {/* Readonly Auto-populated Resident Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Apartment Unit
              </span>
              <strong className="text-navy-950 font-bold text-xs">{residentApartment}</strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Resident Name
              </span>
              <strong className="text-navy-950 font-bold text-xs">{residentName}</strong>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Contact Phone
              </span>
              <span className="text-xs">{residentPhone}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Society Name
              </span>
              <span className="text-xs truncate block">{society.name}</span>
            </div>
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Grievance Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="PARCEL_DAMAGED">Parcel Damaged / Broken Packaging</option>
                <option value="DELAYED_DELIVERY">Delayed Doorstep Delivery</option>
                <option value="STAFF_BEHAVIOR">Staff Conduct / Unprofessional Service</option>
                <option value="LOST_PARCEL">Missing / Lost Parcel (Courier Marked Delivered)</option>
                <option value="WRONG_HANDOVER">Wrong Apartment Handover</option>
                <option value="GATE_ACCESS">Security Gate Access / Long Queue</option>
                <option value="OPERATING_HOURS">Operating Hours / Slot Availability</option>
                <option value="OTHER">Other Resident Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Urgency Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="LOW">Low - General Inconvenience</option>
                <option value="MEDIUM">Medium - Normal Attention</option>
                <option value="HIGH">High - Immediate Action Needed</option>
                <option value="URGENT">Urgent - Missing High-Value Package</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <Input
            label="Complaint Subject *"
            placeholder="e.g. Flipkart box delivered with outer security seal broken at Gate 1"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          {/* Detailed Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide courier name, tracking number, approximate delivery time, staff officer on duty, or details of the issue..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Optional Image Attachment */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Attach Photograph / Evidence (Optional)
            </label>

            {!attachmentData ? (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 bg-slate-50/50 cursor-pointer transition-all group">
                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1 transition-colors" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                  Upload parcel photograph or damage proof
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, or WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachmentData}
                    alt="Uploaded preview"
                    className="w-10 h-10 object-cover rounded border border-blue-200 shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-navy-950 truncate block">
                      {attachmentName || 'Photo Attached'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Ready for submission
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
              className="text-xs text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 shadow-sm"
            >
              Submit Grievance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      {selectedImagePreview && (
        <Modal
          isOpen={Boolean(selectedImagePreview)}
          onClose={() => setSelectedImagePreview(null)}
          title="Attached Photograph Evidence"
        >
          <div className="space-y-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImagePreview}
              alt="Full preview"
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

      {/* Submission Success Confirmation Modal */}
      {submitSuccess && (
        <Modal
          isOpen={Boolean(submitSuccess)}
          onClose={() => setSubmitSuccess(null)}
          title="Grievance Registered Successfully!"
          description="In-app notification has been dispatched to RWA committee & Gate 1 desk"
        >
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Complaint Reference:</span>
                <strong className="font-mono text-navy-950 font-bold">{submitSuccess.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Number:</span>
                <strong className="text-navy-950 font-bold">{submitSuccess.apartment_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-blue-700">SUBMITTED (Awaiting Review)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Filed On:</span>
                <span className="text-slate-700">{formatIST(submitSuccess.created_at)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your grievance has been assigned reference <strong>{submitSuccess.id}</strong>. The society administrator and security supervisor will review intake logs and update you shortly.
            </p>

            <Button
              onClick={() => setSubmitSuccess(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5"
            >
              View in Complaints List
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
