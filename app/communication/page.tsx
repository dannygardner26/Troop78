'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockBlastMessages, BlastMessage, mockUsers, PATROLS } from '@/data/mock-db';
import { useAppStore, canSendBlast, canSendEmergencyBlast, getRoleLabel } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Radio,
  Send,
  Mail,
  MessageSquare,
  AlertTriangle,
  Users,
  User,
  CheckCircle,
  Clock,
  Lock,
  Bell,
  Zap,
  History,
  ChevronRight
} from 'lucide-react';

export default function CommunicationPage() {
  const { currentRole, currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<BlastMessage[]>(mockBlastMessages);

  // Compose form state
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [recipients, setRecipients] = useState<string[]>(['all_scouts']);
  const [channels, setChannels] = useState<string[]>(['email']);
  const [selectedPatrols, setSelectedPatrols] = useState<string[]>([]);

  // Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Check if current role can access this page
  const canAccess = canSendBlast(currentRole);

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="troop-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-500 mb-4">
              Communication blasts can only be sent by Scoutmasters and the Senior Patrol Leader.
            </p>
            <p className="text-sm text-slate-400">
              Current role: <span className="font-medium">{getRoleLabel(currentRole)}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Toggle recipient
  const toggleRecipient = (recipient: string) => {
    if (recipients.includes(recipient)) {
      setRecipients(recipients.filter(r => r !== recipient));
    } else {
      setRecipients([...recipients, recipient]);
    }
  };

  // Toggle channel
  const toggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      if (channels.length > 1) {
        setChannels(channels.filter(c => c !== channel));
      }
    } else {
      setChannels([...channels, channel]);
    }
  };

  // Toggle patrol
  const togglePatrol = (patrol: string) => {
    if (selectedPatrols.includes(patrol)) {
      setSelectedPatrols(selectedPatrols.filter(p => p !== patrol));
    } else {
      setSelectedPatrols([...selectedPatrols, patrol]);
    }
  };

  // Handle send
  const handleSend = () => {
    if (isEmergency) {
      setConfirmModalOpen(true);
    } else {
      sendMessage();
    }
  };

  // Actually send the message
  const sendMessage = () => {
    setSendingMessage(true);

    // Simulate sending delay
    setTimeout(() => {
      const newMessage: BlastMessage = {
        id: `msg-${Date.now()}`,
        title: messageTitle || (isEmergency ? 'EMERGENCY ALERT' : 'Troop Announcement'),
        content: messageBody,
        sender: currentUser?.id || '1',
        recipients: recipients.includes('all_scouts') ? ['all'] : recipients,
        channels: channels as ('sms' | 'email' | 'app')[],
        isEmergency,
        sentDate: new Date().toISOString(),
        readBy: []
      };

      setMessages([newMessage, ...messages]);

      // Reset form
      setMessageTitle('');
      setMessageBody('');
      setIsEmergency(false);
      setRecipients(['all_scouts']);
      setChannels(['email']);
      setSelectedPatrols([]);
      setSendingMessage(false);
      setConfirmModalOpen(false);
    }, 1500);
  };

  // Get sender name
  const getSenderName = (senderId: string) => {
    const sender = mockUsers.find(u => u.id === senderId);
    return sender?.name || 'Unknown';
  };

  // Check if form is valid
  const isFormValid = messageBody.trim().length > 0 && recipients.length > 0 && channels.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Radio className="h-6 w-6 text-red-900" />
                Communication Center
              </h1>
              <p className="text-slate-500 mt-1">
                Send announcements and alerts to scouts and parents
              </p>
            </div>

            {canSendEmergencyBlast(currentRole) && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                <Zap className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">Emergency Mode Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Compose Card */}
        <Card className={`troop-card mb-8 ${isEmergency ? 'ring-2 ring-red-500' : ''}`}>
          <CardHeader className={`border-b ${isEmergency ? 'bg-red-50 border-red-200' : 'border-slate-200'}`}>
            <CardTitle className={`flex items-center gap-2 ${isEmergency ? 'text-red-900' : 'text-slate-900'}`}>
              {isEmergency ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Compose Emergency Alert
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 text-red-900" />
                  Compose Message
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Emergency Toggle */}
            {canSendEmergencyBlast(currentRole) && (
              <div className={`p-4 rounded-lg ${isEmergency ? 'bg-red-50 border-2 border-red-500' : 'bg-slate-50 border border-slate-200'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${isEmergency ? 'text-red-600' : 'text-slate-400'}`} />
                    <div>
                      <p className={`font-medium ${isEmergency ? 'text-red-900' : 'text-slate-700'}`}>
                        Emergency Mode
                      </p>
                      <p className={`text-sm ${isEmergency ? 'text-red-600' : 'text-slate-500'}`}>
                        Sends immediate push notification and text to all emergency contacts
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject (optional)
              </label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder={isEmergency ? 'Emergency Alert' : 'Message subject...'}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  isEmergency
                    ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                    : 'border-slate-300 focus:ring-red-900 focus:border-transparent'
                }`}
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message here..."
                rows={5}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 resize-none ${
                  isEmergency
                    ? 'border-red-300 focus:ring-red-500 focus:border-transparent bg-red-50'
                    : 'border-slate-300 focus:ring-red-900 focus:border-transparent'
                }`}
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Recipients *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'all_scouts', label: 'All Scouts', icon: Users },
                  { id: 'all_parents', label: 'All Parents', icon: User },
                  { id: 'leadership', label: 'Leadership', icon: Users },
                ].map(recipient => (
                  <label
                    key={recipient.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      recipients.includes(recipient.id)
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={recipients.includes(recipient.id)}
                      onChange={() => toggleRecipient(recipient.id)}
                      className="sr-only"
                    />
                    <recipient.icon className={`h-4 w-4 ${recipients.includes(recipient.id) ? 'text-red-900' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{recipient.label}</span>
                    {recipients.includes(recipient.id) && (
                      <CheckCircle className="h-4 w-4 text-red-900 ml-auto" />
                    )}
                  </label>
                ))}
              </div>

              {/* By Patrol */}
              <div className="mt-3">
                <p className="text-sm text-slate-500 mb-2">Or select specific patrols:</p>
                <div className="flex flex-wrap gap-2">
                  {PATROLS.map(patrol => (
                    <label
                      key={patrol}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm transition-colors ${
                        selectedPatrols.includes(patrol)
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPatrols.includes(patrol)}
                        onChange={() => togglePatrol(patrol)}
                        className="sr-only"
                      />
                      {patrol}
                      {selectedPatrols.includes(patrol) && <CheckCircle className="h-3 w-3" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Channels */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Send via *
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'sms', label: 'SMS Text', icon: MessageSquare },
                  { id: 'app', label: 'App Push', icon: Bell },
                ].map(channel => (
                  <label
                    key={channel.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                      channels.includes(channel.id)
                        ? 'bg-green-50 border-green-300 text-green-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={channels.includes(channel.id)}
                      onChange={() => toggleChannel(channel.id)}
                      className="sr-only"
                    />
                    <channel.icon className={`h-4 w-4 ${channels.includes(channel.id) ? 'text-green-700' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{channel.label}</span>
                    {channels.includes(channel.id) && (
                      <CheckCircle className="h-4 w-4 text-green-700" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={handleSend}
                disabled={!isFormValid || sendingMessage}
                className={`w-full ${
                  isEmergency
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'troop-button-primary'
                }`}
              >
                {sendingMessage ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : isEmergency ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Emergency Alert
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sent History */}
        <Card className="troop-card">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <History className="h-5 w-5 text-red-900" />
              Sent History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 ${message.isEmergency ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isEmergency ? 'bg-red-100' : 'bg-slate-100'
                    }`}>
                      {message.isEmergency ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Mail className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium truncate ${message.isEmergency ? 'text-red-900' : 'text-slate-900'}`}>
                          {message.title}
                        </h3>
                        {message.isEmergency && (
                          <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                            Emergency
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{message.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>By {getSenderName(message.sender)}</span>
                        <span>·</span>
                        <span>{new Date(message.sentDate).toLocaleString()}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          {message.channels.map(ch => (
                            <span key={ch} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                              {ch.toUpperCase()}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {messages.length === 0 && (
                <div className="p-12 text-center">
                  <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No messages sent yet</h3>
                  <p className="text-slate-500">Compose your first message above.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Emergency Alert
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800">
                <strong>Warning:</strong> This will send an immediate push notification and text message to <strong>all emergency contacts</strong> for every scout in the troop.
              </p>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-2"><strong>Message Preview:</strong></p>
              <p className="text-sm text-slate-800">{messageBody || '(No message content)'}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={sendingMessage}
            >
              Cancel
            </Button>
            <Button
              onClick={sendMessage}
              disabled={sendingMessage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {sendingMessage ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Emergency Alert
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
