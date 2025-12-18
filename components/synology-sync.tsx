'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { delay } from '@/lib/utils';
import {
  Terminal,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
  Wifi
} from 'lucide-react';

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

const mockFiles = [
  '/vol/photos/2024/summer_camp/archery_practice_001.jpg',
  '/vol/photos/2024/winter_camp/snow_shelter_build.jpg',
  '/vol/photos/2023/eagle_ceremony/danny_wilson_ceremony.jpg',
  '/vol/photos/2023/gettysburg/battlefield_tour_group.jpg',
  '/vol/photos/2022/kandersteg_prep/gear_check_meeting.jpg',
  '/vol/photos/2024/merit_badge_weekend/cooking_demo.jpg',
  '/vol/photos/2024/campfire/songs_and_stories.jpg',
  '/vol/photos/2023/hiking/appalachian_trail_section.jpg',
  '/vol/photos/2024/service_project/trail_maintenance.jpg',
  '/vol/photos/2022/court_of_honor/rank_advancement.jpg',
  '/vol/photos/2024/patrol_meetings/leadership_training.jpg',
  '/vol/photos/2023/fundraiser/car_wash_weekend.jpg',
  '/vol/photos/2024/camping/tent_setup_competition.jpg',
  '/vol/photos/2023/orienteering/compass_navigation.jpg',
  '/vol/photos/2024/first_aid/emergency_response_drill.jpg',
];

export function SynologySync() {
  const { isTerminalOpen, setTerminalOpen, syncProgress, setSyncProgress, isSyncing, setIsSyncing } = useAppStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [...prev, newLog]);
  };

  const resetSync = () => {
    setLogs([]);
    setSyncProgress(0);
    setFilesProcessed(0);
    setShowSuccess(false);
    setCurrentPhase('');
    setIsSyncing(false);
  };

  const startSync = async () => {
    resetSync();
    setIsSyncing(true);

    // Phase 1: Connection
    addLog('> Initializing Synology NAS connection...', 'info');
    await delay(500);
    addLog('> Connected to DS920+ (192.168.1.78)', 'success');
    setCurrentPhase('Connecting to NAS');
    setSyncProgress(5);

    // Phase 2: Authentication
    await delay(300);
    addLog('> Authenticating with admin credentials...', 'info');
    await delay(400);
    addLog('> Authentication successful', 'success');
    setCurrentPhase('Authenticating');
    setSyncProgress(10);

    // Phase 3: Index scanning
    await delay(200);
    addLog('> Scanning /vol/photos directory...', 'info');
    setCurrentPhase('Scanning directories');
    setSyncProgress(15);

    await delay(500);
    addLog('> Found 42,247 files across 847 directories', 'info');
    addLog('> Detected 14TB of photo data', 'info');
    setSyncProgress(25);

    // Phase 4: High-speed file processing
    setCurrentPhase('Indexing files');
    const totalFiles = mockFiles.length * 150; // Simulate many more files

    for (let i = 0; i < mockFiles.length; i++) {
      const file = mockFiles[i];
      const processed = i * 150;

      // Add multiple variations of each file rapidly
      for (let j = 0; j < 150; j++) {
        if (j % 30 === 0) {
          const variation = file.replace('.jpg', `_${String(j + 1).padStart(3, '0')}.jpg`);
          addLog(`> Indexing ${variation}... [OK]`, 'success');
        }

        const progress = 25 + ((processed + j) / totalFiles) * 60;
        setSyncProgress(Math.min(progress, 85));
        setFilesProcessed(processed + j + 1);

        if (j % 10 === 0) {
          await delay(50); // Brief pause for animation effect
        }
      }
    }

    // Phase 5: Face recognition
    setCurrentPhase('Running AI face recognition');
    await delay(300);
    addLog('> Initializing facial recognition engine...', 'info');
    await delay(400);
    addLog('> Detected 127 unique scout faces', 'success');
    addLog('> Confidence threshold: 88%', 'info');
    setSyncProgress(90);

    // Phase 6: Metadata extraction
    setCurrentPhase('Extracting metadata');
    await delay(400);
    addLog('> Extracting EXIF data from 42,247 images...', 'info');
    await delay(600);
    addLog('> GPS coordinates extracted: 1,247 locations', 'success');
    addLog('> Event tags generated: 45 categories', 'success');
    setSyncProgress(95);

    // Phase 7: Completion
    await delay(300);
    addLog('> Building search index...', 'info');
    await delay(500);
    addLog('> Sync completed successfully!', 'success');
    addLog(`> Total files processed: ${filesProcessed.toLocaleString()}`, 'info');
    addLog('> Archive status: ONLINE', 'success');

    setSyncProgress(100);
    setCurrentPhase('Complete');
    setShowSuccess(true);
    setIsSyncing(false);
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-blue-400" />;
    }
  };

  const getLogTextColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-green-300';
    }
  };

  return (
    <Dialog open={isTerminalOpen} onOpenChange={setTerminalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-black border border-green-400/30">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-green-400 font-mono">
            <Terminal className="h-5 w-5" />
            <span>Synology NAS Sync Terminal</span>
            <div className="flex items-center space-x-1 ml-auto">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm">DS920+</span>
              <Wifi className="h-4 w-4 text-green-400" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="terminal-text bg-black rounded-lg border border-green-400/30 h-96 overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center justify-between p-3 border-b border-green-400/30">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-green-400" />
              <span className="text-sm">synology@troop78:/volume1/photos</span>
            </div>
            <div className="text-xs text-green-400">
              {currentPhase && (
                <span className="flex items-center space-x-1">
                  {isSyncing && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{currentPhase}</span>
                </span>
              )}
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-3 h-full overflow-y-auto">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center space-x-2 mb-1 font-mono text-sm"
                >
                  {getLogIcon(log.type)}
                  <span className="text-gray-500 text-xs">[{log.timestamp}]</span>
                  <span className={getLogTextColor(log.type)}>{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {isSyncing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-green-400"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="font-mono text-sm">Processing...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(isSyncing || showSuccess) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-green-400 font-mono">
              <span>Progress: {Math.round(syncProgress)}%</span>
              <span>Files: {filesProcessed.toLocaleString()}</span>
            </div>
            <div className="relative">
              <Progress value={syncProgress} className="h-2 bg-green-900" />
              <div
                className="absolute top-0 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900/20 border border-green-400/30 rounded-lg p-4 maroon-glow"
          >
            <div className="flex items-center space-x-2 text-green-400 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">14TB Synced Successfully!</span>
            </div>
            <div className="text-sm text-green-300 space-y-1 font-mono">
              <div>• 42,247 Photos Indexed</div>
              <div>• 127 Scout Faces Recognized</div>
              <div>• 45 Event Categories Generated</div>
              <div>• Archive Status: ONLINE</div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setTerminalOpen(false)}
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            Close Terminal
          </Button>
          <div className="space-x-2">
            {!isSyncing && !showSuccess && (
              <Button
                onClick={startSync}
                className="bg-green-600 hover:bg-green-700 text-black"
              >
                Start 14TB Sync
              </Button>
            )}
            {showSuccess && (
              <Button
                onClick={resetSync}
                variant="outline"
                className="border-green-400/30 text-green-400 hover:bg-green-400/10"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}