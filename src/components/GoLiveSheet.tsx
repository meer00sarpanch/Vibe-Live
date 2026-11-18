import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Mic, Shuffle, Swords, Video, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface GoLiveSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectGoLive: () => void;
  onSelectCreateParty: () => void;
  onSelectStartPK: () => void;
  onSelectRandomMatch: () => void;
  onSelectCreateVideo: () => void;
}

export const GoLiveSheet: React.FC<GoLiveSheetProps> = ({
  open,
  onClose,
  onSelectGoLive,
  onSelectCreateParty,
  onSelectStartPK,
  onSelectRandomMatch,
  onSelectCreateVideo,
}) => {
  const cards = [
    {
      id: 'go-live',
      title: 'Go Live',
      subtitle: 'Video Live Shuru Karo',
      gradient: 'from-red-500 to-rose-600',
      icon: Video,
      action: onSelectGoLive,
    },
    {
      id: 'create-party',
      title: 'Create Party',
      subtitle: 'Voice Room Banao',
      gradient: 'from-purple-500 to-violet-700',
      icon: Mic,
      action: onSelectCreateParty,
    },
    {
      id: 'start-pk',
      title: 'Start PK',
      subtitle: '1v1 Battle Karo',
      gradient: 'from-blue-500 to-indigo-600',
      icon: Swords,
      action: onSelectStartPK,
    },
    {
      id: 'random-match',
      title: 'Random Match',
      subtitle: 'Random Bande Se Milo',
      gradient: 'from-emerald-500 to-green-600',
      icon: Shuffle,
      action: onSelectRandomMatch,
    },
    {
      id: 'create-video',
      title: 'Create Video',
      subtitle: '30 Sec Video Banao - Songs + Filters',
      gradient: 'from-pink-500 to-fuchsia-600',
      icon: Video,
      action: onSelectCreateVideo,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-end justify-center"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#1A1A22] rounded-t-[24px] border-t border-[#FFD700]/45 px-4 pt-3 pb-6 shadow-[0_-12px_40px_rgba(0,0,0,0.8)]"
          >
            {/* Drag Handle */}
            <div className="w-10 h-1.5 rounded-full bg-white/25 mx-auto mb-3" />

            {/* Title Row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[20px] font-bold text-white leading-tight">Go Live</h2>
                <p className="text-[13px] text-[#9CA3AF] mt-0.5">Kya karna chahte ho?</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onClose();
                }}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-[#26262F] text-white flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Big Cards */}
            <div className="space-y-3">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(16);
                      onClose();
                      card.action();
                    }}
                    className="w-full h-16 px-3.5 rounded-[16px] bg-[#26262F] hover:bg-[#2F2F3B] border border-white/5 hover:border-[#FFD700]/40 flex items-center justify-between gap-3 active:scale-[0.98] transition-all text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-white truncate">{card.title}</p>
                        <p className="text-[12px] text-[#9CA3AF] truncate">{card.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#9CA3AF] shrink-0" />
                  </button>
                );
              })}
            </div>

            <p className="text-center text-xs font-semibold text-[#FFD700] mt-4">
              Live me Gifts Milenge, Rank Badhega
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
