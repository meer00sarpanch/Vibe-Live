import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Globe,
  Languages,
  Search,
  Sparkles,
} from 'lucide-react';
import { AppLanguage, CountryInfo, TranslationSettings } from '../types/mehfil';
import { COUNTRIES_LIST, LANGUAGES_LIST } from '../utils/i18n';
import { triggerHaptic } from '../utils/haptics';

interface CountryLanguageModalProps {
  open: boolean;
  initialTab?: 'country' | 'language' | 'translate';
  isOnboarding?: boolean;
  country: CountryInfo;
  language: AppLanguage;
  translationSettings: TranslationSettings;
  onClose: () => void;
  onFinishOnboarding?: () => void;
  onSelectCountry: (c: CountryInfo) => void;
  onSelectLanguage: (l: AppLanguage) => void;
  onUpdateTranslationSettings: (s: TranslationSettings) => void;
}

export const CountryLanguageModal: React.FC<CountryLanguageModalProps> = ({
  open,
  initialTab = 'country',
  isOnboarding = false,
  country,
  language,
  translationSettings,
  onClose,
  onFinishOnboarding,
  onSelectCountry,
  onSelectLanguage,
  onUpdateTranslationSettings,
}) => {
  const [tab, setTab] = useState<'country' | 'language' | 'translate'>(initialTab);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setTab(isOnboarding ? 'country' : initialTab);
    }
  }, [open, initialTab, isOnboarding]);

  if (!open) return null;

  const filteredCountries = COUNTRIES_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.langLabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleFinish = () => {
    triggerHaptic(16);
    if (isOnboarding && onFinishOnboarding) {
      onFinishOnboarding();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#07070D] text-white flex flex-col">
      <div className="gold-line-top" />

      <header className="h-14 px-4 bg-[#0B0B10] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {!isOnboarding && (
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-white">
              {isOnboarding
                ? tab === 'country'
                  ? 'Select Your Country'
                  : 'Select Your Language'
                : 'Worldwide & Translation'}
            </h1>
            <p className="text-[11px] text-[#FFD700]">
              {country.flag} {country.name} · {language} ({country.currencyCode})
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFinish}
          className="px-4 py-1.5 rounded-full gold-gradient text-white text-xs font-bold shadow"
        >
          {isOnboarding ? (tab === 'country' ? 'Skip' : 'Start Vibe Live') : 'Done'}
        </button>
      </header>

      {/* 3 Sub-Tabs */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-3 grid grid-cols-3 gap-2 shrink-0">
        {[
          { id: 'country' as const, label: 'Country (17)', icon: Globe },
          { id: 'language' as const, label: 'Language (16)', icon: Languages },
          { id: 'translate' as const, label: 'Auto Translate', icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                active ? 'gold-gradient text-white shadow' : 'bg-[#1A1A22] text-[#9CA3AF]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full p-4 space-y-3">
        {tab === 'country' && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Country"
                className="w-full h-10 pl-10 pr-4 rounded-full bg-[#1A1A22] text-sm text-white placeholder-[#888888] border border-white/10 focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <div className="space-y-2">
              {filteredCountries.map((c) => {
                const selected = c.code === country.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      onSelectCountry(c);
                      onSelectLanguage(c.defaultLang);
                      if (isOnboarding) {
                        setTab('language');
                      }
                    }}
                    className={`w-full h-14 px-4 rounded-2xl border flex items-center justify-between text-left transition-all ${
                      selected
                        ? 'bg-[#1D1B29] border-[#FFD700]'
                        : 'bg-[#14141C] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <p className="text-sm font-bold text-white">{c.name}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          {c.langLabel} · {c.currencyCode} ({c.currencySymbol})
                        </p>
                      </div>
                    </div>
                    {selected && <Check className="w-5 h-5 text-[#FFD700]" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === 'language' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LANGUAGES_LIST.map((lang) => {
                const active = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      onSelectLanguage(lang.id);
                    }}
                    className={`h-14 px-4 rounded-2xl border flex items-center justify-between text-left ${
                      active
                        ? 'bg-[#1D1B29] border-[#FFD700]'
                        : 'bg-[#14141C] border-white/10'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{lang.id}</p>
                      <p className="text-xs text-[#9CA3AF]">{lang.nativeName}</p>
                    </div>
                    {active && <Check className="w-5 h-5 text-[#FFD700]" />}
                  </button>
                );
              })}
            </div>

            {isOnboarding && (
              <button
                type="button"
                onClick={handleFinish}
                className="w-full h-12 rounded-full gold-gradient text-white font-extrabold text-sm shadow-lg"
              >
                Continue with {country.flag} {country.name} · {language}
              </button>
            )}
          </div>
        )}

        {tab === 'translate' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#14141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Auto Translate</p>
                <p className="text-xs text-[#9CA3AF]">
                  Translate Live, Party &amp; Private Chat messages in real time (1 sec)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateTranslationSettings({
                    ...translationSettings,
                    autoTranslate: !translationSettings.autoTranslate,
                  })
                }
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  translationSettings.autoTranslate ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    translationSettings.autoTranslate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141C] border border-white/10 space-y-2.5">
              <p className="text-sm font-bold text-white">Display Mode</p>
              <button
                type="button"
                onClick={() =>
                  onUpdateTranslationSettings({ ...translationSettings, mode: 'both' })
                }
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left ${
                  translationSettings.mode === 'both'
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-white/10 bg-[#1A1A22]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white">Show Original + Translation (Default)</p>
                  <p className="text-[11px] text-[#9CA3AF]">Original 15px on top + Translated 11px grey below</p>
                </div>
                {translationSettings.mode === 'both' && <Check className="w-4 h-4 text-[#FFD700]" />}
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateTranslationSettings({ ...translationSettings, mode: 'onlyTranslation' })
                }
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left ${
                  translationSettings.mode === 'onlyTranslation'
                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                    : 'border-white/10 bg-[#1A1A22]'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white">Only Translation Show</p>
                  <p className="text-[11px] text-[#9CA3AF]">Display translated text directly (tap message for original)</p>
                </div>
                {translationSettings.mode === 'onlyTranslation' && <Check className="w-4 h-4 text-[#FFD700]" />}
              </button>
            </div>

            {/* Live Preview Card */}
            <div className="p-4 rounded-2xl bg-[#1A1A22] border border-[#FFD700]/30 space-y-2">
              <p className="text-xs font-bold text-[#FFD700]">Live Preview Example</p>
              <div className="p-3 rounded-2xl bg-[#26262F] max-w-xs space-y-1">
                {translationSettings.mode === 'both' && (
                  <p className="text-[15px] text-white">你好, 你怎么样?</p>
                )}
                <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                  <Languages className="w-3 h-3 text-[#FFD700] shrink-0" />
                  <span>
                    {language === 'Urdu'
                      ? 'Hello, How are you? - Urdu me: Salaam, Kaise Ho?'
                      : `Hello, How are you? · ${language}`}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
