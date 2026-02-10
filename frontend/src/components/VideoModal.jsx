import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from 'lucide-react';
import { Button } from '../components/ui/button';

export function VideoModal({ isOpen, onClose, videoId = 'demo' }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);

  const chapters = [
    { id: 0, title: 'Introduction', time: '0:00', duration: 30 },
    { id: 1, title: 'Form Builder', time: '0:30', duration: 45 },
    { id: 2, title: 'Offline Collection', time: '1:15', duration: 40 },
    { id: 3, title: 'GPS & Media', time: '1:55', duration: 35 },
    { id: 4, title: 'Sync & Analytics', time: '2:30', duration: 30 },
    { id: 5, title: 'Team Management', time: '3:00', duration: 25 },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Area (Simulated) */}
          <div className="relative aspect-video bg-slate-800">
            {/* Animated Demo Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: isPlaying ? [1, 1.1, 1] : 1,
                    opacity: isPlaying ? 1 : 0.5 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Play className="w-10 h-10 text-sky-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {chapters[currentChapter].title}
                </h3>
                <p className="text-slate-400">
                  Chapter {currentChapter + 1} of {chapters.length}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
              <motion.div
                className="h-full bg-sky-500"
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : `${(currentChapter / chapters.length) * 100}%` }}
                transition={{ duration: chapters[currentChapter].duration, ease: 'linear' }}
                onAnimationComplete={() => {
                  if (currentChapter < chapters.length - 1) {
                    setCurrentChapter(c => c + 1);
                  }
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center justify-between">
              {/* Play Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentChapter(c => Math.min(c + 1, chapters.length - 1))}
                  className="text-white"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <span className="text-sm text-slate-400 ml-2">
                  {chapters[currentChapter].time}
                </span>
              </div>

              {/* Chapter Selection */}
              <div className="hidden md:flex items-center gap-1">
                {chapters.map((chapter, idx) => (
                  <button
                    key={chapter.id}
                    onClick={() => setCurrentChapter(idx)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      idx === currentChapter
                        ? 'bg-sky-500 text-white'
                        : idx < currentChapter
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>

            {/* Chapter List (Mobile) */}
            <div className="md:hidden mt-4 grid grid-cols-3 gap-2">
              {chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => setCurrentChapter(idx)}
                  className={`p-2 text-xs rounded-lg text-left ${
                    idx === currentChapter
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="block font-medium truncate">{chapter.title}</span>
                  <span className="text-[10px] opacity-70">{chapter.time}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VideoModal;
