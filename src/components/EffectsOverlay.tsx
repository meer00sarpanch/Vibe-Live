import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles } from 'lucide-react';

interface EffectsOverlayProps {
  confettiTrigger: number;
  coinRainTrigger: number;
  heartRainTrigger?: number;
  balloonTrigger?: number;
  bigGift: { emoji: string; name: string; sender: string } | null;
  toast: string | null;
  loading: boolean;
}

export const EffectsOverlay: React.FC<EffectsOverlayProps> = ({
  confettiTrigger,
  coinRainTrigger,
  heartRainTrigger = 0,
  balloonTrigger = 0,
  bigGift,
  toast,
  loading,
}) => {
  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[120] px-5 py-2.5 rounded-full gold-gradient text-white font-semibold text-sm shadow-2xl gold-glow flex items-center gap-2 whitespace-nowrap pointer-events-none"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Golden Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[115] bg-black/50 backdrop-blur-xs flex items-center justify-center pointer-events-none"
          >
            <div className="px-4 h-16 rounded-2xl glass-dark flex flex-col items-center justify-center gap-1.5 gold-glow">
              <div className="w-7 h-7 rounded-full border-2 border-[#FFD700]/30 border-t-[#FFD700] animate-spin" />
              <span className="text-[11px] font-bold text-[#FFD700] whitespace-nowrap">Vibe Live</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big Gift Showcase */}
      <AnimatePresence>
        {bigGift && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.15, y: -30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="fixed inset-x-0 top-1/3 z-[110] flex flex-col items-center justify-center pointer-events-none px-4"
          >
            <div className="glass-dark rounded-3xl px-8 py-6 flex flex-col items-center gap-2 gold-glow border-2 border-[#FFD700]">
              <div className="text-6xl animate-bounce">{bigGift.emoji}</div>
              <div className="flex items-center gap-1.5 text-[#FFD700] font-bold text-lg">
                <Crown className="w-5 h-5 fill-[#FFD700]" />
                <span>{bigGift.name}</span>
              </div>
              <p className="text-xs text-white/90 font-medium">
                Sent by <span className="text-[#FFD700] font-bold">{bigGift.sender}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Golden Coins Rain */}
      {coinRainTrigger > 0 && (
        <div key={`coins-${coinRainTrigger}`} className="fixed inset-0 z-[105] pointer-events-none overflow-hidden">
          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              style={{
                left: `${(i * 4.5 + (i % 3) * 3) % 96}%`,
                animationDelay: `${(i % 6) * 0.14}s`,
              }}
              className="absolute -top-10 animate-rain-fall"
            >
              <div className="w-7 h-7 rounded-full gold-gradient border-2 border-yellow-200 flex items-center justify-center text-xs font-extrabold text-amber-950 shadow-lg">
                $
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISSA 24: Full-Screen Heart Rain (Propose & Shadi) */}
      {heartRainTrigger > 0 && (
        <div key={`hearts-${heartRainTrigger}`} className="fixed inset-0 z-[106] pointer-events-none overflow-hidden">
          {Array.from({ length: 26 }).map((_, i) => (
            <div
              key={i}
              style={{
                left: `${(i * 3.8 + (i % 4) * 2) % 95}%`,
                animationDelay: `${(i % 6) * 0.15}s`,
              }}
              className="absolute -top-10 animate-rain-fall text-2xl sm:text-3xl drop-shadow-[0_0_8px_rgba(244,63,94,0.75)]"
            >
              {i % 3 === 0 ? '💖' : i % 3 === 1 ? '💍' : '❤️'}
            </div>
          ))}
        </div>
      )}

      {/* HISSA 24: Birthday Balloons & Cake Rain */}
      {balloonTrigger > 0 && (
        <div key={`balloons-${balloonTrigger}`} className="fixed inset-0 z-[107] pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                left: `${(i * 5.4 + (i % 3) * 2) % 94}%`,
                animationDelay: `${(i % 5) * 0.2}s`,
              }}
              className="absolute bottom-0 animate-balloon-float text-3xl sm:text-4xl"
            >
              {i % 4 === 0 ? '🎂' : i % 4 === 1 ? '🎈' : i % 4 === 2 ? '🎉' : '🎁'}
            </div>
          ))}
        </div>
      )}

      {/* Golden Confetti */}
      {confettiTrigger > 0 && (
        <div key={`conf-${confettiTrigger}`} className="fixed inset-0 z-[104] pointer-events-none overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const colors = ['#FFD700', '#FF6B00', '#7C3AED', '#FF3B6B', '#FDE047'];
            return (
              <div
                key={i}
                style={{
                  left: `${(i * 3.6 + (i % 5) * 2) % 98}%`,
                  animationDelay: `${(i % 7) * 0.1}s`,
                  backgroundColor: colors[i % colors.length],
                }}
                className="absolute -top-8 w-2.5 h-4 rounded-xs animate-rain-fall"
              />
            );
          })}
        </div>
      )}
    </>
  );
};
