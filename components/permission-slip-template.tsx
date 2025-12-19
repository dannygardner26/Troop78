'use client';

import { User, Trip, MasterDocument } from '@/data/mock-db';
import { Button } from '@/components/ui/button';
import { PenTool, Download, Printer } from 'lucide-react';

interface PermissionSlipTemplateProps {
  document: MasterDocument;
  trip?: Trip;
  scout: User;
  parent: User;
  onSign?: () => void;
  signature?: string;
  signedDate?: string;
}

export function PermissionSlipTemplate({
  document,
  trip,
  scout,
  parent,
  onSign,
  signature,
  signedDate
}: PermissionSlipTemplateProps) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white max-w-3xl mx-auto">
      {/* Document Container - Print Friendly */}
      <div className="border-2 border-slate-300 p-8 bg-white print:border-black">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-600">
              <span className="text-2xl font-bold text-amber-800">⚜️</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-wide">
            TROOP 78 — BOY SCOUTS OF AMERICA
          </h1>
          <p className="text-slate-600 text-sm mt-1">Chester County Council • Malvern, Pennsylvania</p>
          <h2 className="text-xl font-semibold text-red-900 mt-4 uppercase tracking-wider">
            Permission Slip & Medical Release
          </h2>
        </div>

        {/* Trip Information Box */}
        {trip && (
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Activity/Trip</p>
                <p className="font-semibold text-slate-900">{trip.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
                <p className="font-semibold text-slate-900">{trip.destination}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Dates</p>
                <p className="font-semibold text-slate-900">
                  {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Estimated Cost</p>
                <p className="font-semibold text-slate-900">${trip.cost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scout Information */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Scout Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Scout Name:</span>
              <span className="ml-2 font-medium text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                {scout.name}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Patrol:</span>
              <span className="ml-2 font-medium text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                {scout.patrol || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Rank:</span>
              <span className="ml-2 font-medium text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                {scout.rank || 'Scout'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>
              <span className="ml-2 font-medium text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                {scout.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Consent Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Parental/Guardian Consent
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed space-y-3">
            <p>
              I, <span className="font-semibold border-b border-dotted border-slate-400">{parent.name}</span>,
              the parent/legal guardian of <span className="font-semibold border-b border-dotted border-slate-400">{scout.name}</span>,
              hereby grant permission for my child to participate in the above-described Scouting activity.
            </p>
            <p>
              I understand that participation in this activity involves certain risks, including but not limited to
              physical injury, and I assume all such risks on behalf of my child. I release and hold harmless the
              Boy Scouts of America, Chester County Council, Troop 78, and their respective officers, directors,
              agents, and volunteers from any and all liability arising from my child's participation in this activity.
            </p>
          </div>
        </div>

        {/* Medical Authorization */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Medical Treatment Authorization
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed space-y-3">
            <p>
              In the event of an emergency, I authorize the adult leaders in charge to obtain emergency
              medical treatment for my child, including but not limited to hospitalization, surgery, and
              the administration of anesthesia, if in the judgment of a licensed physician such treatment
              is necessary.
            </p>
            <p>
              I certify that my child is covered by health insurance and that a current BSA Annual Health
              and Medical Record (Parts A & B) is on file with the troop.
            </p>
          </div>
        </div>

        {/* Activity Details & Requirements */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Activity Requirements & Expectations
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed space-y-3">
            <p>
              <strong>Equipment:</strong> Scouts are expected to bring all required gear as outlined in the
              packing list provided by the Scoutmaster. This includes appropriate clothing, personal items,
              and any specialized equipment needed for the activity.
            </p>
            <p>
              <strong>Behavior:</strong> My child agrees to follow the Scout Oath and Law at all times during
              this activity. I understand that failure to comply with troop rules may result in early dismissal
              from the activity at my expense.
            </p>
            <p>
              <strong>Communication:</strong> I understand that communication may be limited during wilderness
              activities. The Scoutmaster will contact parents in case of emergencies or significant changes to
              the itinerary.
            </p>
          </div>
        </div>

        {/* Liability Waiver */}
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-3">
            Release of Liability & Assumption of Risk
          </h3>
          <div className="text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              I acknowledge that participation in Scouting activities involves inherent risks, including but
              not limited to: physical injury, illness, property damage, and in extreme cases, permanent
              disability or death. These risks may arise from the activity itself, the actions of participants,
              or conditions of the activity location.
            </p>
            <p>
              In consideration of my child's participation, I voluntarily assume all risks associated with
              participation and agree to release, indemnify, and hold harmless the Boy Scouts of America,
              Chester County Council, Troop 78, and their respective officers, directors, employees, agents,
              and volunteers from any and all claims, damages, losses, and expenses arising from my child's
              participation in this activity.
            </p>
            <p>
              I have read this release of liability and assumption of risk agreement, fully understand its
              terms, and understand that I am giving up substantial rights by signing it. I sign it freely
              and voluntarily without any inducement.
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Emergency Contact Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-amber-700">Parent/Guardian:</span>
              <span className="ml-2 font-medium text-slate-900">{parent.name}</span>
            </div>
            <div>
              <span className="text-amber-700">Phone:</span>
              <span className="ml-2 font-medium text-slate-900">{parent.phone}</span>
            </div>
            <div className="col-span-2">
              <span className="text-amber-700">Email:</span>
              <span className="ml-2 font-medium text-slate-900">{parent.email}</span>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="border-t-2 border-slate-800 pt-6 mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Parent/Guardian Signature</p>
              {signature ? (
                <div className="h-16 border-b-2 border-slate-800 flex items-end pb-1">
                  <img src={signature} alt="Signature" className="h-14 object-contain" />
                </div>
              ) : (
                <div className="h-16 border-b-2 border-slate-800 flex items-end justify-center pb-2">
                  {onSign ? (
                    <Button onClick={onSign} className="troop-button-primary">
                      <PenTool className="h-4 w-4 mr-2" />
                      Sign Here
                    </Button>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Signature Required</span>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-600 mt-1">{parent.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Date</p>
              <div className="h-16 border-b-2 border-slate-800 flex items-end pb-2">
                <span className="font-medium text-slate-900">
                  {signedDate ? new Date(signedDate).toLocaleDateString() : (signature ? today : '')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Troop 78 • 15 Mill Road, Malvern, PA 19355 • www.troop78.org
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Document ID: {document.id} • Generated: {today}
          </p>
        </div>
      </div>

      {/* Action Buttons (not printed) */}
      <div className="flex justify-center gap-4 mt-6 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
