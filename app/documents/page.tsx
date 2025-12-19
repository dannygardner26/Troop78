'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  mockMasterDocuments,
  mockUserSubmissions,
  mockUsers,
  MasterDocument,
  UserSubmission,
  getUserById,
  getTripById
} from '@/data/mock-db';
import { useAppStore, canApproveDocuments, getRoleLabel } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PermissionSlipTemplate } from '@/components/permission-slip-template';
import { SignatureCanvasComponent } from '@/components/signature-canvas';
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Folder,
  File,
  Search,
  Users,
  Shield,
  Heart,
  Calendar,
  PenTool,
  X,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

type ViewTab = 'master' | 'submissions';

export default function DocumentsPage() {
  const { currentRole, currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('master');
  const [searchQuery, setSearchQuery] = useState('');
  const [masterDocuments, setMasterDocuments] = useState<MasterDocument[]>(mockMasterDocuments);
  const [submissions, setSubmissions] = useState<UserSubmission[]>(mockUserSubmissions);
  const [selectedDocument, setSelectedDocument] = useState<MasterDocument | null>(null);
  const [selectedScoutId, setSelectedScoutId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isLeader = currentRole === 'scoutmaster' || currentRole === 'admin' || currentRole === 'spl';
  const isParent = currentRole === 'parent';

  // Get documents relevant to the current user
  const getRelevantDocuments = (): MasterDocument[] => {
    if (isParent && currentUser?.children) {
      // Parents see documents required for their children
      return masterDocuments.filter(doc => {
        if (doc.requiredFor === 'all_scouts') return true;
        if (doc.requiredFor === 'trip' && doc.associatedTrip) {
          // Check if any child is on this trip
          const trip = getTripById(doc.associatedTrip);
          return trip?.attendees.some(id => currentUser.children?.includes(id));
        }
        return false;
      });
    }
    return masterDocuments;
  };

  // Check if a document is signed for a specific scout
  const getSubmissionForScout = (docId: string, scoutId: string): UserSubmission | undefined => {
    return submissions.find(s => s.masterDocumentId === docId && s.submittedFor === scoutId);
  };

  // Get all scouts (for leader view)
  const allScouts = mockUsers.filter(u => u.role === 'scout' || u.role === 'patrol_leader' || u.role === 'spl' || u.role === 'aspl');

  // Get submission stats for a document
  const getSubmissionStats = (docId: string) => {
    const doc = masterDocuments.find(d => d.id === docId);
    if (!doc) return { signed: 0, total: 0 };

    let relevantScouts = allScouts;
    if (doc.requiredFor === 'trip' && doc.associatedTrip) {
      const trip = getTripById(doc.associatedTrip);
      relevantScouts = allScouts.filter(s => trip?.attendees.includes(s.id));
    }

    const signed = relevantScouts.filter(scout =>
      submissions.some(s => s.masterDocumentId === docId && s.submittedFor === scout.id)
    ).length;

    return { signed, total: relevantScouts.length };
  };

  // Handle signature completion
  const handleSignatureComplete = (signatureData: string) => {
    if (selectedDocument && selectedScoutId && currentUser) {
      const newSubmission: UserSubmission = {
        id: `sub-${Date.now()}`,
        masterDocumentId: selectedDocument.id,
        submittedBy: currentUser.id,
        submittedFor: selectedScoutId,
        signedDate: new Date().toISOString(),
        signatureData,
        status: 'submitted'
      };
      setSubmissions(prev => [...prev, newSubmission]);
      setSignatureModalOpen(false);
      setPreviewOpen(false);
    }
  };

  // Handle file operations
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleUpload = () => {
    // Simulate creating new master documents
    const newDocs: MasterDocument[] = uploadedFiles.map((file, index) => ({
      id: `md-new-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: 'permission' as const,
      description: 'Uploaded document',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser?.id || '1',
      requiredFor: 'optional' as const
    }));
    setMasterDocuments(prev => [...newDocs, ...prev]);
    setUploadedFiles([]);
    setUploadModalOpen(false);
  };

  // Get document icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'medical':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'permission':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'waiver':
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-slate-500" />;
    }
  };

  // Parent View - My Documents to Sign
  if (isParent) {
    const relevantDocs = getRelevantDocuments();
    const children = currentUser?.children?.map(id => getUserById(id)).filter(Boolean) || [];

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Folder className="h-6 w-6 text-red-900" />
                  Required Documents
                </h1>
                <p className="text-slate-500 mt-1">
                  Sign and submit required documents for your scouts
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">{children.length} Scout(s) Linked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {children.length === 0 ? (
            <Card className="troop-card">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Scouts Linked</h3>
                <p className="text-slate-500">
                  Contact your Scoutmaster to link your children to your account.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {children.map(child => {
                if (!child) return null;
                return (
                  <div key={child.id}>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-slate-500" />
                      </div>
                      {child.name}'s Documents
                    </h2>

                    <div className="space-y-3">
                      {relevantDocs.map(doc => {
                        const submission = getSubmissionForScout(doc.id, child.id);
                        const trip = doc.associatedTrip ? getTripById(doc.associatedTrip) : null;

                        return (
                          <motion.div
                            key={`${doc.id}-${child.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Card className="troop-card hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {getDocumentIcon(doc.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-900">{doc.name}</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">{doc.description}</p>
                                    {trip && (
                                      <p className="text-xs text-blue-600 mt-1">For: {trip.name}</p>
                                    )}
                                    {doc.dueDate && (
                                      <p className="text-xs text-amber-600 mt-1">
                                        Due: {new Date(doc.dueDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {submission ? (
                                      <>
                                        <span className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full ${
                                          submission.status === 'approved'
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                          {submission.status === 'approved' ? (
                                            <><CheckCircle className="h-4 w-4" /> Approved</>
                                          ) : (
                                            <><Clock className="h-4 w-4" /> Submitted</>
                                          )}
                                        </span>
                                        <Button variant="outline" size="sm">
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        onClick={() => {
                                          setSelectedDocument(doc);
                                          setSelectedScoutId(child.id);
                                          setPreviewOpen(true);
                                        }}
                                        className="troop-button-primary"
                                      >
                                        <PenTool className="h-4 w-4 mr-2" />
                                        Sign Document
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Preview & Sign Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedDocument && selectedScoutId && currentUser && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-slate-900">
                    {selectedDocument.name}
                  </DialogTitle>
                  <DialogDescription>
                    Review and sign for {getUserById(selectedScoutId)?.name}
                  </DialogDescription>
                </DialogHeader>

                <PermissionSlipTemplate
                  document={selectedDocument}
                  trip={selectedDocument.associatedTrip ? getTripById(selectedDocument.associatedTrip) : undefined}
                  scout={getUserById(selectedScoutId)!}
                  parent={currentUser}
                  onSign={() => setSignatureModalOpen(true)}
                />
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Signature Modal */}
        {selectedDocument && selectedScoutId && (
          <SignatureCanvasComponent
            trip={selectedDocument.associatedTrip ? getTripById(selectedDocument.associatedTrip)! : { id: '', name: selectedDocument.name } as any}
            isOpen={signatureModalOpen}
            onClose={() => setSignatureModalOpen(false)}
            onComplete={handleSignatureComplete}
          />
        )}
      </div>
    );
  }

  // Leader View - Master Documents & Submissions
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Folder className="h-6 w-6 text-red-900" />
                Document Management
              </h1>
              <p className="text-slate-500 mt-1">
                {masterDocuments.length} master documents · Track submissions
              </p>
            </div>

            {isLeader && (
              <Button onClick={() => setUploadModalOpen(true)} className="troop-button-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('master')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'master'
                  ? 'border-red-900 text-red-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Master Documents
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-red-900 text-red-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Submissions Tracker
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Master Documents Tab */}
        {activeTab === 'master' && (
          <div className="space-y-4">
            {masterDocuments.map((doc, index) => {
              const stats = getSubmissionStats(doc.id);
              const trip = doc.associatedTrip ? getTripById(doc.associatedTrip) : null;

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="troop-card hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getDocumentIcon(doc.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900">{doc.name}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">{doc.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                            </span>
                            {trip && (
                              <span className="text-blue-600">Trip: {trip.name}</span>
                            )}
                            {doc.dueDate && (
                              <span className="text-amber-600">Due: {new Date(doc.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Submission Progress */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${
                              stats.signed === stats.total ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              {stats.signed}/{stats.total}
                            </p>
                            <p className="text-xs text-slate-500">Submitted</p>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Submissions Tracker Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {masterDocuments.map(doc => {
              const stats = getSubmissionStats(doc.id);
              const trip = doc.associatedTrip ? getTripById(doc.associatedTrip) : null;

              let relevantScouts = allScouts;
              if (doc.requiredFor === 'trip' && doc.associatedTrip) {
                relevantScouts = allScouts.filter(s => trip?.attendees.includes(s.id));
              }

              return (
                <Card key={doc.id} className="troop-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <CardTitle className="text-lg">{doc.name}</CardTitle>
                          {trip && <p className="text-sm text-slate-500">{trip.name}</p>}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                        stats.signed === stats.total
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {stats.signed}/{stats.total} Complete
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {relevantScouts.map(scout => {
                        const submission = getSubmissionForScout(doc.id, scout.id);

                        return (
                          <div
                            key={scout.id}
                            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                              submission
                                ? submission.status === 'approved'
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-amber-50 border border-amber-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              submission
                                ? submission.status === 'approved'
                                  ? 'bg-green-500'
                                  : 'bg-amber-500'
                                : 'bg-red-500'
                            }`} />
                            <span className={`truncate ${
                              submission ? 'text-slate-700' : 'text-red-700'
                            }`}>
                              {scout.name}
                            </span>
                            {submission && submission.status !== 'approved' && canApproveDocuments(currentRole) && (
                              <button
                                onClick={() => {
                                  setSubmissions(prev => prev.map(s =>
                                    s.id === submission.id ? { ...s, status: 'approved' as const } : s
                                  ));
                                }}
                                className="ml-auto p-1 hover:bg-green-100 rounded"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-red-900" />
              Upload Master Document
            </DialogTitle>
            <DialogDescription>
              Upload a new document template that scouts/parents need to sign.
            </DialogDescription>
          </DialogHeader>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-red-900 bg-red-50' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />
            <Folder className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-red-900' : 'text-slate-400'}`} />
            <p className="text-slate-600 mb-2">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-red-900 font-medium hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-slate-400">Supports PDF, DOC, DOCX</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-700">Files to upload:</p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0}
              className="troop-button-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
