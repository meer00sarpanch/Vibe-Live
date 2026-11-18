import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, Mail, Phone, Sparkles, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface VibeLiveLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const VibeLiveLogo: React.FC<VibeLiveLogoProps> = ({ size = 'sm' }) => {
  const boxCls =
    size === 'lg'
      ? 'w-16 h-16 rounded-2xl text-4xl'
      : size === 'md'
        ? 'w-10 h-10 rounded-xl text-xl'
        : 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-base sm:text-lg';

  const textCls =
    size === 'lg'
      ? 'text-4xl sm:text-5xl'
      : size === 'md'
        ? 'text-2xl'
        : 'text-[17px] sm:text-[21px]';

  const dotCls =
    size === 'lg'
      ? 'w-3 h-3 -top-1 -right-3'
      : size === 'md'
        ? 'w-2.5 h-2.5 -top-0.5 -right-2.5'
        : 'w-2 h-2 -top-0.5 -right-2';

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 select-none shrink-0">
      {/* Large Gold Gradient "V" Mark */}
      <div
        className={`${boxCls} gold-gradient flex items-center justify-center font-black text-amber-950 shadow-[0_0_14px_rgba(255,215,0,0.65)] border border-yellow-200/70 shrink-0 leading-none`}
      >
        V
      </div>

      {/* "Vibe" White + "Live" Red Gradient + Blinking Red Live Dot */}
      <div className={`relative flex items-center gap-1 font-extrabold tracking-tight leading-none ${textCls}`}>
        <span className="text-white">Vibe</span>
        <span className="bg-gradient-to-r from-[#FF3B5C] via-[#EF4444] to-[#FF6B00] bg-clip-text text-transparent">
          Live
        </span>
        {/* Small Blinking Red Live Dot on Top */}
        <span className={`absolute ${dotCls} flex items-center justify-center`}>
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-full w-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
        </span>
      </div>
    </div>
  );
};

interface SplashOverlayProps {
  onFinish: () => void;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 950);
    return () => window.clearTimeout(t);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.25 }}
          onClick={() => {
            setVisible(false);
            onFinish();
          }}
          className="fixed inset-0 z-[150] bg-[#07070D] flex flex-col items-center justify-center px-6 cursor-pointer"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.14),transparent_60%)] pointer-events-none" />
          <motion.div
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col items-center text-center gap-4"
          >
            <VibeLiveLogo size="lg" />
            <p className="text-base sm:text-lg font-bold text-[#FFD700] tracking-wide">
              Live. Connect. Shine.
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Vibe Live - Feel The World Live
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LoginSignupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const LoginSignupModal: React.FC<LoginSignupModalProps> = ({ open, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [contact, setContact] = useState('bilal@vibelive.com');

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-[#0B0B10] border border-[#FFD700]/45 p-6 space-y-5 shadow-2xl relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <VibeLiveLogo size="md" />
          <h2 className="text-xl font-extrabold text-white mt-1">Welcome to Vibe Live</h2>
          <p className="text-xs text-[#9CA3AF]">Vibe Live - Feel The World Live</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#1A1A22]">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`h-9 rounded-full text-xs font-bold capitalize transition-all ${
                mode === m ? 'gold-gradient text-white shadow' : 'text-[#9CA3AF]'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="h-11 px-3.5 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#FFD700] shrink-0" />
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email or Phone..."
              className="flex-1 bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
          <div className="h-11 px-3.5 rounded-2xl bg-[#1A1A22] border border-white/10 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#FFD700] shrink-0" />
            <input
              type="password"
              defaultValue="••••••••"
              className="flex-1 bg-transparent text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(18);
            onSuccess(`Welcome to Vibe Live! Signed in as ${contact}`);
            onClose();
          }}
          className="w-full h-11 rounded-full gold-gradient text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>{mode === 'login' ? 'Continue to Vibe Live' : 'Create Vibe Live Account'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onSuccess('Signed in with Phone OTP to Vibe Live!');
            onClose();
          }}
          className="w-full h-10 rounded-full bg-[#1A1A22] border border-white/10 text-xs font-semibold text-white/85 flex items-center justify-center gap-2"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Phone Login</span>
        </button>
      </div>
    </div>
  );
};
