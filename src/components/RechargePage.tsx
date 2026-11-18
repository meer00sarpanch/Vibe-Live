import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Coins,
  CreditCard,
  Globe,
  Landmark,
  Loader2,
  Lock,
  PlayCircle,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { PAYMENT_METHODS, RECHARGE_PACKAGES } from '../data/mockData';
import { CountryInfo, PaymentMethodItem, RechargePackage } from '../types/mehfil';
import { formatCurrencyPrice } from '../utils/i18n';
import { playGiftChime, triggerHaptic } from '../utils/haptics';

interface RechargePageProps {
  coins: number;
  country: CountryInfo;
  isFirstRecharge: boolean;
  adsWatchedToday: number;
  onBack: () => void;
  onWatchRewardedAd: () => void;
  onCompleteRecharge: (pkg: RechargePackage, method: PaymentMethodItem) => void;
}

export const RechargePage: React.FC<RechargePageProps> = ({
  coins,
  country,
  isFirstRecharge,
  adsWatchedToday,
  onBack,
  onWatchRewardedAd,
  onCompleteRecharge,
}) => {
  const orderedMethods = useMemo(() => {
    return [...PAYMENT_METHODS].sort((a, b) => {
      const aIdx = a.regionPriority.indexOf(country.code);
      const bIdx = b.regionPriority.indexOf(country.code);
      const aScore = aIdx === -1 ? 99 : aIdx;
      const bScore = bIdx === -1 ? 99 : bIdx;
      return aScore - bScore;
    });
  }, [country.code]);

  const [selectedPkg, setSelectedPkg] = useState<RechargePackage>(RECHARGE_PACKAGES[2]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodItem>(orderedMethods[0]);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{ wasFirst: boolean; total: number; base: number; bonus: number } | null>(null);
  const payTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedMethod(orderedMethods[0]);
  }, [orderedMethods]);

  useEffect(() => {
    return () => {
      if (payTimerRef.current) {
        window.clearTimeout(payTimerRef.current);
      }
    };
  }, []);

  const renderMethodAvatar = (method: PaymentMethodItem) => {
    let content: React.ReactNode = <Wallet className="w-4 h-4" />;
    if (method.id === 'jazzcash') {
      content = <span className="text-[11px] font-black tracking-tight">JC</span>;
    } else if (method.id === 'easypaisa') {
      content = <span className="text-[11px] font-black tracking-tight">EP</span>;
    } else if (method.id === 'paypal') {
      content = <span className="text-sm font-black italic">P</span>;
    } else if (method.id === 'card') {
      content = <CreditCard className="w-4 h-4" />;
    } else if (method.id === 'gpay') {
      content = <span className="text-[10px] font-black">G Pay</span>;
    } else if (method.id === 'applepay') {
      content = <Smartphone className="w-4 h-4" />;
    } else if (method.id === 'stripe') {
      content = <span className="text-sm font-black">S</span>;
    } else if (method.id === 'usdt') {
      content = <span className="text-sm font-black">₮</span>;
    } else if (method.id === 'payoneer') {
      content = <Globe className="w-4 h-4" />;
    } else if (method.id === 'bank') {
      content = <Landmark className="w-4 h-4" />;
    }

    return (
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.accent} flex items-center justify-center text-white shrink-0 shadow-sm`}
      >
        {content}
      </div>
    );
  };

  const handlePay = () => {
    triggerHaptic(18);
    setProcessing(true);
    setPaymentResult(null);
    if (payTimerRef.current) window.clearTimeout(payTimerRef.current);

    const snapshotWasFirst = isFirstRecharge;
    const snapshotBase = selectedPkg.coins;
    const snapshotBonus = selectedPkg.bonusCoins;
    const snapshotTotal = (snapshotWasFirst ? snapshotBase * 2 : snapshotBase) + snapshotBonus;

    payTimerRef.current = window.setTimeout(() => {
      setProcessing(false);
      playGiftChime();
      setLastReceipt({
        wasFirst: snapshotWasFirst,
        total: snapshotTotal,
        base: snapshotBase,
        bonus: snapshotBonus,
      });
      onCompleteRecharge(selectedPkg, selectedMethod);
      setPaymentResult('success');
    }, 1250);
  };

  const handleCancelProcessing = () => {
    if (payTimerRef.current) {
      window.clearTimeout(payTimerRef.current);
      payTimerRef.current = null;
    }
    setProcessing(false);
    setPaymentResult('failed');
  };

  const autoDetectLabel =
    country.code === 'PK'
      ? 'Pakistan Auto-Detected → JazzCash First'
      : country.code === 'IN'
        ? 'India Auto-Detected → UPI / Google Pay First'
        : `${country.name} Auto-Detected → ${orderedMethods[0].name} First`;

  const coinsToReceive =
    (isFirstRecharge ? selectedPkg.coins * 2 : selectedPkg.coins) + selectedPkg.bonusCoins;

  return (
    <div className="fixed inset-0 z-[85] bg-[#07070D] text-white overflow-y-auto pb-32">
      <div className="gold-line-top" />

      {/* 1. Top Header */}
      <header className="sticky top-0 z-20 h-14 px-4 bg-[#07070D]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
              Coins Recharge
            </h1>
            <p className="text-[11px] text-[#FFD700] font-bold truncate">
              Your Coins: {coins.toLocaleString()} · First Recharge Pe DOUBLE Coins!
            </p>
          </div>
        </div>

        {/* Free Coins Watch Ad Button (HISSA 22) */}
        <button
          type="button"
          onClick={onWatchRewardedAd}
          disabled={adsWatchedToday >= 5}
          className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1.5 shadow active:scale-95 shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Free Coins ({adsWatchedToday}/5)</span>
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-5">
        {/* First Recharge Double Banner */}
        {isFirstRecharge && (
          <div className="rounded-2xl bg-gradient-to-r from-[#FF4D4D] via-[#FF8C00] to-[#FFD700] p-3.5 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-white fill-white shrink-0" />
              <div>
                <p className="text-base font-extrabold text-white">First Recharge Double!</p>
                <p className="text-xs text-white/95 font-medium">
                  {formatCurrencyPrice(200, country)} pack = 4,500 + 4,500 = 9,000 Coins!
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-black/25 text-white text-[11px] font-extrabold shrink-0">
              2X COINS
            </span>
          </div>
        )}

        {/* STEP 1: Select Payment Method — All 10 Global Methods (56px Height Each) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-sm font-extrabold text-[#FFD700]">Select Payment Method</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-bold">
              {country.flag} {autoDetectLabel}
            </span>
          </div>

          <div className="space-y-2">
            {orderedMethods.map((method, index) => {
              const active = selectedMethod.id === method.id;
              const isPopular = index === 0 || method.id === 'paypal' || method.id === 'jazzcash';
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setSelectedMethod(method);
                  }}
                  className={`w-full h-14 px-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all text-left ${
                    active
                      ? 'bg-[#1D1B29] border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                      : 'bg-[#14141C] border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderMethodAvatar(method)}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{method.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] truncate">{method.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPopular && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[10px] font-extrabold text-[#FFD700]">
                        {method.tag === 'Popular' ? 'Popular' : `${method.tag}`}
                      </span>
                    )}
                    {!isPopular && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/80">
                        {method.tag}
                      </span>
                    )}
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        active ? 'border-[#FFD700] bg-[#FFD700]' : 'border-white/30'
                      }`}
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-black" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 2: Amount Select — 10 Coin Packages (2-Column Scrollable Grid) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white">Select Coin Package (10 Packs)</h2>
            <span className="text-xs text-[#FFD700] font-semibold">
              {country.flag} {country.currencySymbol} {country.currencyCode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {RECHARGE_PACKAGES.map((pkg) => {
              const selected = selectedPkg.id === pkg.id;
              const isGoldPopular = pkg.glow === 'gold' || pkg.popular;
              const isRedLegend = pkg.glow === 'red';
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setSelectedPkg(pkg);
                  }}
                  className={`relative p-3.5 rounded-2xl text-left transition-all active:scale-[0.98] ${
                    isGoldPopular
                      ? `bg-gradient-to-br from-[#3D2A05] via-[#241A08] to-[#361B04] border-2 border-[#FFD700] shadow-[0_0_26px_rgba(255,215,0,0.48)] ${
                          selected ? 'ring-2 ring-white/80 scale-[1.01]' : ''
                        }`
                      : isRedLegend
                        ? `bg-gradient-to-br from-[#3B0A12] via-[#1C090E] to-[#2B060B] border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.48)] ${
                            selected ? 'ring-2 ring-[#FFD700]' : ''
                          }`
                        : selected
                          ? 'bg-gradient-to-br from-[#2B1F06] via-[#1A1610] to-[#261204] border-2 border-[#FFD700] gold-glow'
                          : 'bg-[#14141C] border border-white/10 hover:border-white/25'
                  }`}
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold mb-1.5 ${
                      isGoldPopular
                        ? 'gold-gradient text-white shadow-md'
                        : isRedLegend
                          ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md'
                          : pkg.tag === 'BEST VALUE'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-[#FFD700]'
                    }`}
                  >
                    {pkg.tag}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Coins className={`w-5 h-5 shrink-0 ${isRedLegend ? 'text-red-400' : 'text-[#FFD700]'}`} />
                    <span className="text-lg font-extrabold text-white tabular-nums">
                      {pkg.coins.toLocaleString()}
                    </span>
                  </div>

                  {isFirstRecharge && (
                    <p className="text-[11px] font-bold text-emerald-400">
                      + {pkg.coins.toLocaleString()} First Bonus!
                    </p>
                  )}

                  {pkg.bonusCoins > 0 && (
                    <p className="text-[11px] font-semibold text-[#FFD700]">
                      +{pkg.bonusCoins.toLocaleString()} Bonus Free
                    </p>
                  )}
                  {pkg.vipDaysFree && (
                    <p className="text-[11px] font-bold text-purple-300">+ {pkg.vipDaysFree.label}</p>
                  )}
                  {pkg.legendFrame && (
                    <p className="text-[11px] font-extrabold text-red-300">+ Special Legend Frame</p>
                  )}

                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className={`text-sm font-extrabold font-mono-num ${isRedLegend ? 'text-red-300' : 'text-[#FFD700]'}`}>
                      {formatCurrencyPrice(pkg.pricePkr, country)}
                    </span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Security Note */}
        <div className="p-3.5 rounded-2xl bg-[#14141C] border border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
          <Lock className="w-4 h-4 shrink-0" />
          <span>100% Secure Payment - Your Money is Safe</span>
        </div>
      </div>

      {/* Fixed Bottom Gold Pay Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pt-2 pb-3 bg-[#0B0B10]/95 backdrop-blur-md border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <Lock className="w-3 h-3" />
            <span>100% Secure Payment - Your Money is Safe</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[#9CA3AF] truncate">{selectedMethod.name}</p>
              <p className="text-base font-extrabold text-[#FFD700] font-mono-num">
                {formatCurrencyPrice(selectedPkg.pricePkr, country)}
              </p>
            </div>
            <button
              type="button"
              disabled={processing}
              onClick={handlePay}
              className="flex-1 h-12 rounded-full gold-gradient text-white font-extrabold text-sm shadow-xl gold-glow active:scale-95 transition-transform"
            >
              Pay {formatCurrencyPrice(selectedPkg.pricePkr, country)} · +{coinsToReceive.toLocaleString()} Coins
            </button>
          </div>
        </div>
      </div>

      {/* Gateway Processing Modal */}
      {processing && (
        <div className="fixed inset-0 z-[94] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl glass-dark p-6 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Connecting to {selectedMethod.name}...</h3>
              <p className="text-xs text-[#9CA3AF]">
                Charging {formatCurrencyPrice(selectedPkg.pricePkr, country)}
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Secure Payment - Your Money is Safe</span>
            </div>
            <button
              type="button"
              onClick={handleCancelProcessing}
              className="w-full h-9 rounded-full bg-white/10 text-xs font-bold text-white/80 hover:bg-white/20"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

      {/* Payment Result Popup */}
      {paymentResult && (
        <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl glass-dark p-6 text-center space-y-4 relative">
            <button
              type="button"
              onClick={() => setPaymentResult(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            {paymentResult === 'success' ? (
              <>
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                {lastReceipt?.wasFirst && (
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF4D4D] via-[#FF8C00] to-[#FFD700] inline-block text-xs font-black text-white shadow">
                    First Recharge Double! 2X
                  </div>
                )}
                <h3 className="text-lg font-extrabold text-white">Payment Successful! Coins Added</h3>
                <p className="text-xs text-[#FFD700] font-semibold">
                  {lastReceipt?.wasFirst
                    ? `${lastReceipt.base.toLocaleString()} + ${lastReceipt.base.toLocaleString()}${
                        lastReceipt.bonus > 0 ? ` + ${lastReceipt.bonus.toLocaleString()} Bonus` : ''
                      } = ${lastReceipt.total.toLocaleString()} Coins`
                    : `+${(lastReceipt?.total ?? coinsToReceive).toLocaleString()} Coins`}{' '}
                  via {selectedMethod.name} ({formatCurrencyPrice(selectedPkg.pricePkr, country)})
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>100% Secure Payment - Your Money is Safe</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentResult(null);
                    onBack();
                  }}
                  className="w-full h-11 rounded-full gold-gradient text-white font-bold text-sm"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="w-14 h-14 text-red-500 mx-auto" />
                <h3 className="text-lg font-extrabold text-white">Payment Failed - Try Again</h3>
                <p className="text-xs text-[#9CA3AF]">
                  Your {selectedMethod.name} transaction was not completed. No money was charged.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>100% Secure Payment - Your Money is Safe</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentResult(null);
                    handlePay();
                  }}
                  className="w-full h-11 rounded-full gold-gradient text-white font-bold text-sm"
                >
                  Dobara Try
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
