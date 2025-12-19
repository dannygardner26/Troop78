'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip } from '@/data/mock-db';
import {
  PenTool,
  Download,
  RotateCcw,
  FileText,
  Shield,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface SignatureCanvasComponentProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (signatureData: string) => void;
}

export function SignatureCanvasComponent({ trip, isOpen, onClose, onComplete }: SignatureCanvasComponentProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'sign' | 'preview'>('info');

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setSignatureData('');
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const data = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      setSignatureData(data);
      setShowPreview(true);
      setCurrentStep('preview');
    }
  };

  const handleComplete = () => {
    onComplete(signatureData);
    onClose();
    setCurrentStep('info');
    setShowPreview(false);
    clearSignature();
  };

  const handleBack = () => {
    setShowPreview(false);
    setCurrentStep('sign');
    setSignatureData('');
  };

  const isSignatureEmpty = () => {
    return signatureRef.current ? signatureRef.current.isEmpty() : true;
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('info');
      setShowPreview(false);
      setSignatureData('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5 text-red-900" />
            <span>Digital Permission Slip</span>
            <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-900 text-xs font-medium rounded-full border border-red-200">
              BSA Official
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Complete and digitally sign the permission slip for {trip.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[
            { id: 'info', label: 'Trip Info', icon: FileText },
            { id: 'sign', label: 'Signature', icon: PenTool },
            { id: 'preview', label: 'Review', icon: CheckCircle }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === step.id
                    ? 'bg-red-900 text-white'
                    : index < ['info', 'sign', 'preview'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`text-sm hidden sm:inline ${currentStep === step.id ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                {step.label}
              </span>
              {index < 2 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            </div>
          ))}
        </div>

        {/* Trip Information Step */}
        {currentStep === 'info' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="troop-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900 text-lg">{trip.name}</CardTitle>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${trip.cost}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">{trip.description}</p>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                Important Information
              </h4>
              <div className="space-y-2 text-sm text-amber-700">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Medical Forms Required</p>
                    <p className="text-slate-500">Current medical forms (Parts A, B, C) must be on file before departure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-700">Digital Signature Legal Notice</p>
                    <p className="text-slate-500">
                      Your digital signature has the same legal validity as a handwritten signature per the E-SIGN Act.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('sign')} className="troop-button-primary">
                Continue to Signature
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Signature Step */}
        {currentStep === 'sign' && !showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="troop-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                  <PenTool className="h-5 w-5 text-red-900" />
                  Digital Signature Required
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Please sign in the box below using your mouse, trackpad, or touch screen
                </p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{
                      width: 500,
                      height: 150,
                      className: 'signature-canvas w-full rounded'
                    }}
                  />
                  <div className="border-t border-slate-200 mt-2 pt-2">
                    <p className="text-xs text-slate-400 text-center">Sign above the line</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500">
                    Your signature confirms you have read and agree to the trip terms.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={clearSignature}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep('info')} variant="outline">
                Back
              </Button>
              <Button
                onClick={saveSignature}
                disabled={isSignatureEmpty()}
                className="troop-button-primary"
              >
                Continue to Preview
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="troop-card overflow-hidden">
              <CardHeader className="pb-3 bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
                  <FileText className="h-5 w-5 text-red-900" />
                  Permission Slip Preview
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Review your signed permission slip before final submission
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {/* Document Preview */}
                <div className="bg-white p-6 space-y-4 text-sm">
                  {/* BSA Header */}
                  <div className="text-center border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold text-slate-900">Boy Scouts of America</h1>
                    <p className="text-slate-600">Activity Permission Slip</p>
                    <p className="text-xs text-slate-500">Willistown Troop 78 · Chester County Council</p>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p><span className="font-medium text-slate-700">Activity:</span> <span className="text-slate-600">{trip.name}</span></p>
                      <p><span className="font-medium text-slate-700">Location:</span> <span className="text-slate-600">{trip.destination}</span></p>
                      <p><span className="font-medium text-slate-700">Dates:</span> <span className="text-slate-600">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span></p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="font-medium text-slate-700">Cost:</span> <span className="text-slate-600">${trip.cost}</span></p>
                      <p><span className="font-medium text-slate-700">Troop:</span> <span className="text-slate-600">Willistown Troop 78</span></p>
                      <p><span className="font-medium text-slate-700">Date Signed:</span> <span className="text-slate-600">{new Date().toLocaleDateString()}</span></p>
                    </div>
                  </div>

                  {/* Permission Text */}
                  <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-lg">
                    <p>
                      I hereby give permission for my son/ward to participate in the above activity.
                      I understand that participation in this activity involves risk and I assume all such risks on behalf of my son/ward.
                    </p>
                    <p>
                      I certify that my son/ward is covered by insurance and that his medical form is current and on file with the troop.
                      In case of emergency, I authorize any adult leader to consent to any medical treatment deemed necessary.
                    </p>
                  </div>

                  {/* Signature Area */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2">Digital Signature:</p>
                        <div className="border border-slate-200 p-2 h-20 bg-slate-50 rounded">
                          {signatureData && (
                            <img src={signatureData} alt="Signature" className="w-full h-full object-contain" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Electronically signed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Legal Notice */}
                  <div className="text-xs text-slate-500 border-t border-slate-200 pt-3">
                    <p>
                      <span className="font-medium">Legal Notice:</span> This electronic signature has the same legal effect and enforceability as a manual signature.
                      By signing electronically, you acknowledge that you have read, understood, and agree to the terms above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={handleBack} variant="outline">
                Back to Signature
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleComplete} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={handleComplete} className="troop-button-primary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
