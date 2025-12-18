'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  X
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-troop-maroon">
            <FileText className="h-5 w-5" />
            <span>Digital Permission Slip</span>
            <Badge variant="outline" className="border-troop-maroon text-troop-maroon">
              BSA Official
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete and digitally sign the permission slip for {trip.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[
            { id: 'info', label: 'Trip Info', icon: FileText },
            { id: 'sign', label: 'Digital Signature', icon: PenTool },
            { id: 'preview', label: 'Review & Submit', icon: CheckCircle }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? 'bg-troop-maroon text-white'
                    : index < ['info', 'sign', 'preview'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`text-sm ${currentStep === step.id ? 'text-white' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {index < 2 && <div className="w-8 h-px bg-gray-600" />}
            </div>
          ))}
        </div>

        {/* Trip Information Step */}
        {currentStep === 'info' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-r from-troop-maroon/10 to-blue-600/10 border border-troop-maroon/30">
              <CardHeader>
                <CardTitle className="text-white">{trip.name}</CardTitle>
                <CardDescription className="flex items-center space-x-4 text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.location}</span>
                  </div>
                  {trip.cost && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${trip.cost}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{trip.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-900/20 border border-yellow-600/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Important Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Medical Forms Required</p>
                    <p className="text-gray-400">Current medical forms (Parts A, B, C) must be on file before departure.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Emergency Contact</p>
                    <p className="text-gray-400">24/7 emergency contact information will be provided before departure.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Digital Signature Legal Notice</p>
                    <p className="text-gray-400">
                      Your digital signature has the same legal validity as a handwritten signature per the Electronic Signatures in Global and National Commerce Act (E-SIGN Act).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('sign')} variant="maroon">
                Continue to Signature
              </Button>
            </div>
          </motion.div>
        )}

        {/* Signature Step */}
        {currentStep === 'sign' && !showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <PenTool className="h-5 w-5" />
                  <span>Digital Signature Required</span>
                </CardTitle>
                <CardDescription>
                  Please sign in the box below using your mouse, trackpad, or touch screen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{
                      width: 600,
                      height: 200,
                      className: 'signature-canvas w-full h-48'
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-400">
                    Sign above. Your signature confirms you have read and agree to the trip terms.
                  </p>
                  <div className="space-x-2">
                    <Button
                      onClick={clearSignature}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      onClick={saveSignature}
                      disabled={isSignatureEmpty()}
                      variant="maroon"
                    >
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5" />
                  <span>Permission Slip Preview</span>
                </CardTitle>
                <CardDescription>
                  Review your signed permission slip before final submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white text-black p-8 rounded-lg space-y-6 font-serif">
                  {/* BSA Header */}
                  <div className="text-center border-b border-gray-400 pb-4">
                    <h1 className="text-2xl font-bold">Boy Scouts of America</h1>
                    <p className="text-lg">Activity Permission Slip</p>
                    <p className="text-sm text-gray-600">Willistown Troop 78 • Chester County Council</p>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Activity:</strong> {trip.name}</p>
                      <p><strong>Location:</strong> {trip.location}</p>
                      <p><strong>Dates:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p><strong>Cost:</strong> ${trip.cost || 'N/A'}</p>
                      <p><strong>Troop:</strong> Willistown Troop 78</p>
                      <p><strong>Date Signed:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Permission Text */}
                  <div className="text-sm space-y-2">
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
                  <div className="border-t border-gray-400 pt-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Digital Signature:</strong></p>
                        <div className="border border-gray-400 p-2 w-64 h-20 bg-gray-50">
                          {signatureData && (
                            <img src={signatureData} alt="Signature" className="w-full h-full object-contain" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          Electronically signed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Parent/Guardian Signature</p>
                        <div className="mt-8 border-b border-gray-400 w-48"></div>
                        <p className="text-xs mt-1">Date</p>
                      </div>
                    </div>
                  </div>

                  {/* Legal Notice */}
                  <div className="text-xs text-gray-600 border-t border-gray-400 pt-2">
                    <p>
                      <strong>Legal Notice:</strong> This electronic signature has the same legal effect and enforceability as a manual signature.
                      By signing electronically, you acknowledge that you have read, understood, and agree to the terms above.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button onClick={handleBack} variant="outline">
                    Back to Signature
                  </Button>
                  <div className="space-x-2">
                    <Button onClick={handleComplete} variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={handleComplete} variant="maroon">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Permission Slip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}