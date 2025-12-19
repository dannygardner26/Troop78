'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDocuments, Document, DOCUMENT_TYPES } from '@/data/mock-db';
import { useAppStore, canApproveDocuments, getRoleLabel } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  Filter,
  MoreVertical,
  Plus,
  Shield,
  Heart,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';

type DocumentCategory = 'all' | 'medical' | 'permission' | 'waiver' | 'policy';

export default function DocumentsPage() {
  const { currentRole } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const categories = [
    { id: 'all', label: 'All Documents', icon: Folder, count: documents.length },
    { id: 'medical', label: 'Medical Forms', icon: Heart, count: documents.filter(d => d.type === 'medical').length },
    { id: 'permission', label: 'Permission Slips', icon: FileText, count: documents.filter(d => d.type === 'permission').length },
    { id: 'waiver', label: 'Waivers', icon: Shield, count: documents.filter(d => d.type === 'waiver').length },
    { id: 'policy', label: 'Policies', icon: File, count: documents.filter(d => d.type === 'policy').length },
  ];

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.type === selectedCategory;
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
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
      case 'policy':
        return <File className="h-5 w-5 text-slate-500" />;
      default:
        return <File className="h-5 w-5 text-slate-500" />;
    }
  };

  // Handle file drop
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    // Simulate upload - in production this would upload to server
    const newDocs: Document[] = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: 'permission' as const,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: '1',
      status: 'pending' as const
    }));

    setDocuments(prev => [...newDocs, ...prev]);
    setUploadedFiles([]);
    setUploadModalOpen(false);
  };

  // Approve document (scoutmaster only)
  const approveDocument = (docId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, status: 'approved' as const } : doc
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Folder className="h-6 w-6 text-red-900" />
                Document Vault
              </h1>
              <p className="text-slate-500 mt-1">
                {documents.length} documents · {documents.filter(d => d.status === 'pending').length} pending review
              </p>
            </div>

            <Button
              onClick={() => setUploadModalOpen(true)}
              className="troop-button-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="troop-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {categories.map(category => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id as DocumentCategory)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-red-50 text-red-900 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-red-900' : 'text-slate-400'}`} />
                          {category.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-red-900 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Document List */}
            <Card className="troop-card">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {filteredDocuments.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getDocumentIcon(doc.type)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{doc.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                          {doc.expirationDate && (
                            <span className="text-amber-600">
                              Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0">
                        {getStatusBadge(doc.status)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>

                        {/* Approve button for scoutmasters */}
                        {canApproveDocuments(currentRole) && doc.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveDocument(doc.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Empty State */}
                  {filteredDocuments.length === 0 && (
                    <div className="p-12 text-center">
                      <Folder className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
                      <p className="text-slate-500 mb-4">
                        {searchQuery ? 'Try adjusting your search.' : 'Upload your first document to get started.'}
                      </p>
                      <Button onClick={() => setUploadModalOpen(true)} className="troop-button-primary">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-red-900" />
              Upload Document
            </DialogTitle>
            <DialogDescription>
              Upload medical forms, permission slips, and other scout documents.
            </DialogDescription>
          </DialogHeader>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-red-900 bg-red-50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
            <p className="text-xs text-slate-400">
              Supports PDF, DOC, DOCX, JPG, PNG (max 10MB)
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-700">Files to upload:</p>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                    <span className="text-xs text-slate-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
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
              Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
