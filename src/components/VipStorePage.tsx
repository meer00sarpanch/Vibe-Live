import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Coins,
  CreditCard,
  Crown,
  Shield,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { VIP_PLANS } from '../data/mockData';
import { CountryInfo, VipStatus } from '../types/mehfil';
import { formatCurrencyPrice } from '../utils/i18n';
import { playGiftChime, triggerHaptic } from '../utils/haptics';

interface VipStorePageProps {
  coins: number;
  vipStatus: VipStatus;
  country: CountryInfo;
  onBack: () => void;
  onBuyVip: (level: 1 | 2 | 3, days: number, costCoins: number, method: 'coins' | 'jazzcash' | 'easypaisa' | 'card') => void;
  onOpenRecharge: () => void;
}

export const VipStorePage: React.FC<VipStorePageProps> = ({
  coins,
  vipStatus,
  country,
  onBack,
  onBuyVip,
  onOpenRecharge,
}) => {
  const [payMethod, setPayMethod] = useState<'coins' | 'jazzcash' | 'easypaisa' | 'card'>('coins');
  const [lowCoinsModal, setLowCoinsModal] = useState<{ needed: number } | null>(null);
  const [celebrateModal, setCelebrateModal] = useState<{ name: string; days: number } | null>(null);

  const handleBuy = (plan: (typeof VIP_PLANS)[number]) => {
    triggerHaptic(18);
    if (payMethod === 'coins' && coins < plan.costCoins) {
      setLowCoinsModal({ needed: plan.costCoins });
      return;
    }
    playGiftChime();
    onBuyVip(plan.level, plan.days, plan.costCoins, payMethod);
    setCelebrateModal({ name: plan.name, days: plan.days });
  };

  return (
    <div className="fixed inset-0 z-[85] bg-[#07070D] text-white overflow-y-auto pb-12">
      <div className="gold-line-top" />

      {/* 1. VIP Page Top */}
      <header className="sticky top-0 z-20 h-14 px-4 bg-[#07070D]/95 backdrop-blur-md border-b border-[#FFD700]/25 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#FFD700] fill-[#FFD700] animate-bounce" />
            <h1 className="text-[20px] font-extrabold gold-text-gradient">VIP</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRecharge}
          className="px-3 py-1.5 rounded-full bg-[#1A1A22] border border-[#FFD700]/40 flex items-center gap-1.5 text-xs font-bold text-[#FFD700]"
        >
          <Coins className="w-4 h-4" />
          <span>{coins.toLocaleString()}</span>
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* 2. Current VIP Status Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#161622] to-[#0B0B10] border-2 border-[#FFD700]/45 p-4 flex items-center justify-between gap-3 gold-glow">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-lg shrink-0">
              <Crown className="w-8 h-8 text-white fill-white/30" />
            </div>
            <div>
              {vipStatus.level === 0 ? (
                <>
                  <p className="text-base font-bold text-[#9CA3AF]">You Are Not VIP Yet</p>
                  <p className="text-xs text-white/60">Unlock No Ads, Gold Frame &amp; 2x Task Coins</p>
                </>
              ) : (
                <>
                  <p className="text-base font-extrabold text-emerald-400">
                    {vipStatus.level === 3 ? 'SVIP' : `VIP Level ${vipStatus.level}`} - {vipStatus.daysLeft} Days Left
                  </p>
                  <p className="text-xs text-[#FFD700]">Active · No Ads · Royal Privileges On</p>
                </>
              )}
            </div>
          </div>

          {vipStatus.level === 0 && (
            <button
              type="button"
              onClick={() => handleBuy(VIP_PLANS[1])}
              className="px-4 py-2 rounded-full gold-gradient text-white text-xs font-extrabold shadow-lg shrink-0 active:scale-95"
            >
              Become VIP
            </button>
          )}
        </div>

        {/* 4. Payment Method Radio Selector */}
        <div className="rounded-2xl bg-[#14141C] border border-white/10 p-3.5 space-y-2.5">
          <p className="text-xs font-bold text-[#FFD700]">Select Payment Method</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'coins' as const, label: 'Vibe Live Coins', icon: Coins },
              { id: 'jazzcash' as const, label: 'JazzCash', icon: Wallet },
              { id: 'easypaisa' as const, label: 'Easypaisa', icon: Wallet },
              { id: 'card' as const, label: 'Card', icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              const active = payMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`h-11 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    active
                      ? 'border-[#FFD700] bg-[#FFD700]/15 text-[#FFD700]'
                      : 'border-white/10 bg-[#1A1A22] text-white/75'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      active ? 'border-[#FFD700] bg-[#FFD700]' : 'border-white/40'
                    }`}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </span>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. VIP Plans — 3 Vertical Cards Gap 12px */}
        <div className="space-y-3">
          {VIP_PLANS.map((plan) => {
            const isPopular = plan.level === 2;
            const isSvip = plan.level === 3;
            return (
              <div
                key={plan.level}
                className={`relative rounded-3xl p-4 border transition-all ${
                  isPopular
                    ? 'bg-gradient-to-br from-[#23190B] via-[#14141C] to-[#1A1228] border-2 border-[#FFD700] gold-glow'
                    : isSvip
                      ? 'bg-gradient-to-br from-[#1F1035] via-[#14141C] to-[#261808] border border-purple-400/50'
                      : 'bg-[#14141C] border-white/15'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow ${
                      plan.level === 2 ? 'bg-red-600' : 'gold-gradient'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {isSvip ? (
                        <Shield className="w-5 h-5 text-[#FFD700]" />
                      ) : (
                        <Crown className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
                      )}
                      <h2 className="text-lg font-extrabold text-white">{plan.name}</h2>
                      <span className="text-xs font-semibold text-[#FFD700]">· {plan.days} Days</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {payMethod === 'coins'
                        ? `${plan.costCoins.toLocaleString()} Coins`
                        : formatCurrencyPrice(plan.pricePkr, country)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuy(plan)}
                    className={`rounded-full gold-gradient text-white font-extrabold shadow-lg active:scale-95 transition-transform shrink-0 ${
                      isPopular ? 'px-5 py-3 text-sm gold-glow' : 'px-4 py-2 text-xs'
                    }`}
                  >
                    {payMethod === 'coins'
                      ? plan.buttonText
                      : `Buy ${formatCurrencyPrice(plan.pricePkr, country)}`}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-white/10">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-1.5 text-xs text-white/90">
                      <Check className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Coins Popup */}
      {lowCoinsModal && (
        <div className="fixed inset-0 z-[95] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass-dark p-5 text-center space-y-4">
            <Coins className="w-12 h-12 text-[#FFD700] mx-auto" />
            <h3 className="text-lg font-bold text-white">Coins Kam Hain - Recharge Karo</h3>
            <p className="text-xs text-[#9CA3AF]">
              You need <span className="text-[#FFD700] font-bold">{lowCoinsModal.needed.toLocaleString()} Coins</span>. Current balance: {coins.toLocaleString()}.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setLowCoinsModal(null)}
                className="h-11 rounded-full bg-[#26262F] text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLowCoinsModal(null);
                  onOpenRecharge();
                }}
                className="h-11 rounded-full gold-gradient text-white text-xs font-extrabold shadow-lg"
              >
                Recharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Congratulations VIP Popup */}
      {celebrateModal && (
        <div className="fixed inset-0 z-[96] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass-dark border-2 border-[#FFD700] p-6 text-center space-y-4 gold-glow relative">
            <button
              type="button"
              onClick={() => setCelebrateModal(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-20 h-20 rounded-full gold-gradient mx-auto flex items-center justify-center animate-bounce shadow-xl">
              <Crown className="w-10 h-10 text-white fill-white" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#FFD700] flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>VIP ACTIVATED</span>
              </p>
              <h3 className="text-xl font-extrabold text-white">
                Congratulations! You Are Now {celebrateModal.name}
              </h3>
              <p className="text-xs text-emerald-400 font-semibold">
                {celebrateModal.days} Days Active · Profile VIP Badge Updated!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCelebrateModal(null);
                onBack();
              }}
              className="w-full h-11 rounded-full gold-gradient text-white font-extrabold text-sm"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
