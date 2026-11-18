import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  Clock,
  Film,
  FlipHorizontal,
  Gauge,
  Image as ImageIcon,
  Layers,
  MapPin,
  MessageSquare,
  Mic,
  Music,
  Pause,
  Play,
  Scissors,
  Search,
  Smile,
  Sparkles,
  Trash2,
  Type,
  Users,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  FILTERS_CATALOG,
  IMG_HERO_LIVE,
  IMG_HOST_FEMALE,
  IMG_HOST_MALE,
  IMG_MUSIC_PARTY,
  SONGS_CATALOG,
  STICKERS_CATALOG,
} from '../data/mockData';
import {
  BeautySettings,
  FilterItem,
  ShortVideoItem,
  SongItem,
  TextOverlayItem,
} from '../types/mehfil';
import { startBeatPreview, stopBeatPreview, triggerHaptic } from '../utils/haptics';

interface CreateVideoStudioProps {
  onClose: () => void;
  onPublishVideo: (video: ShortVideoItem) => void;
  onNotify: (msg: string) => void;
}

type StudioStage = 'camera' | 'editor' | 'post';
type EditorTool = 'Trim' | 'Split' | 'Speed' | 'Text' | 'Stickers' | 'Effects' | 'Voice Over' | 'Volume' | 'Delete';

const SONG_CATS: Array<'Trending' | 'Pakistani' | 'Punjabi' | 'English' | 'Arabic' | 'Hindi' | 'Viral'> = [
  'Trending',
  'Pakistani',
  'Punjabi',
  'English',
  'Arabic',
  'Hindi',
  'Viral',
];

const FILTER_CATS: Array<'Beauty' | 'Vintage' | 'Cinematic' | 'Glam' | 'Funny' | 'Anime' | 'Dark' | 'Golden'> = [
  'Beauty',
  'Vintage',
  'Cinematic',
  'Glam',
  'Funny',
  'Anime',
  'Dark',
  'Golden',
];

export const CreateVideoStudio: React.FC<CreateVideoStudioProps> = ({
  onClose,
  onPublishVideo,
  onNotify,
}) => {
  const [stage, setStage] = useState<StudioStage>('camera');

  // Camera state (HISSA 6)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashOn, setFlashOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [countdownVal, setCountdownVal] = useState<number | null>(null);
  const [timerDelay, setTimerDelay] = useState<0 | 3 | 10>(0);
  const [speed, setSpeed] = useState<'0.5x' | '1x' | '2x'>('1x');
  const [capturedImage, setCapturedImage] = useState<string>(IMG_HERO_LIVE);

  // Gallery Crop Modal (HISSA 6)
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPreview, setGalleryPreview] = useState(IMG_HOST_FEMALE);
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [galleryPanX, setGalleryPanX] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Songs & Filters Sheets (HISSA 7)
  const [songsOpen, setSongsOpen] = useState(false);
  const [songSearch, setSongSearch] = useState('');
  const [songCategory, setSongCategory] = useState<(typeof SONG_CATS)[number]>('Trending');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(SONGS_CATALOG[0]);
  const [originalVol, setOriginalVol] = useState(80);
  const [musicVol, setMusicVol] = useState(90);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<(typeof FILTER_CATS)[number]>('Beauty');
  const [selectedFilter, setSelectedFilter] = useState<FilterItem>(FILTERS_CATALOG[1]);
  const [beauty, setBeauty] = useState<BeautySettings>({ smooth: 45, whitening: 30, slim: 25 });

  // Editor state (HISSA 8)
  const [editorPlaying, setEditorPlaying] = useState(true);
  const [activeTool, setActiveTool] = useState<EditorTool>('Trim');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [splits, setSplits] = useState<number[]>([50]);
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([]);
  const [newText, setNewText] = useState('');
  const [textFont, setTextFont] = useState<'Poppins' | 'Bold' | 'Cursive'>('Poppins');
  const [textColor, setTextColor] = useState('#FFD700');
  const [textAnim, setTextAnim] = useState<'Fade' | 'Pop' | 'Slide'>('Pop');
  const [addedStickers, setAddedStickers] = useState<string[]>([]);
  const [stickerSearch, setStickerSearch] = useState('');
  const [activeEffect, setActiveEffect] = useState<'None' | 'Transition' | 'Glitch' | 'Blur' | 'Slow Motion' | 'Flash'>('None');
  const [voiceOverActive, setVoiceOverActive] = useState(false);
  const [voiceOverSecs, setVoiceOverSecs] = useState(0);

  // Post Page state (HISSA 9)
  const [caption, setCaption] = useState('Vibe Live tonight ✨ #VibeLive #PK');
  const [location, setLocation] = useState('Lahore');
  const [visibility, setVisibility] = useState<'Everyone' | 'Friends' | 'Only Me'>('Everyone');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(false);

  // Computed live CSS filter combining preset + beauty sliders
  const computedFilterCss = [
    selectedFilter.css !== 'none' ? selectedFilter.css : '',
    `brightness(${1 + beauty.whitening / 400})`,
    beauty.smooth > 55 ? `contrast(${1 - (beauty.smooth - 55) / 400})` : '',
  ]
    .filter(Boolean)
    .join(' ') || 'none';

  // Camera initialization
  useEffect(() => {
    if (stage !== 'camera') return;
    let active = true;
    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraReady(true);
      } catch {
        setCameraReady(false);
      }
    };
    initCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [stage, facingMode]);

  useEffect(() => {
    return () => {
      stopBeatPreview();
    };
  }, []);

  // Recording 30s timer with Auto Stop -> Go to Editor
  useEffect(() => {
    if (!recording) return;
    const interval = window.setInterval(() => {
      setRecSeconds((prev) => {
        const step = speed === '2x' ? 1.5 : speed === '0.5x' ? 0.5 : 1;
        const next = Number((prev + step).toFixed(1));
        if (next >= 30) {
          setRecording(false);
          stopBeatPreview();
          onNotify('30s Auto Stop — Moving to Studio Editor');
          setStage('editor');
          return 30;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [recording, speed, onNotify]);

  // Voice Over timer
  useEffect(() => {
    if (!voiceOverActive) return;
    const t = window.setInterval(() => setVoiceOverSecs((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [voiceOverActive]);

  const startOrStopRecord = () => {
    triggerHaptic(20);
    if (recording) {
      setRecording(false);
      stopBeatPreview();
      // Snapshot frame if camera active
      if (cameraReady && videoRef.current) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth || 720;
          canvas.height = videoRef.current.videoHeight || 1280;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setCapturedImage(canvas.toDataURL('image/jpeg', 0.85));
          }
        } catch {
          // keep fallback image
        }
      }
      setStage('editor');
      return;
    }

    if (timerDelay > 0 && countdownVal === null) {
      let c: number = timerDelay;
      setCountdownVal(c);
      const t = window.setInterval(() => {
        c -= 1;
        if (c <= 0) {
          window.clearInterval(t);
          setCountdownVal(null);
          setRecSeconds(0);
          setRecording(true);
          if (selectedSong) startBeatPreview(selectedSong.freq, selectedSong.bpm);
        } else {
          setCountdownVal(c);
        }
      }, 1000);
      return;
    }

    setRecSeconds(0);
    setRecording(true);
    if (selectedSong) startBeatPreview(selectedSong.freq, selectedSong.bpm);
  };

  const togglePlaySong = (song: SongItem) => {
    triggerHaptic();
    if (playingSongId === song.id) {
      stopBeatPreview();
      setPlayingSongId(null);
    } else {
      startBeatPreview(song.freq, song.bpm);
      setPlayingSongId(song.id);
    }
  };

  const handleUseSong = (song: SongItem) => {
    triggerHaptic(15);
    stopBeatPreview();
    setPlayingSongId(null);
    setSelectedSong(song);
    setSongsOpen(false);
    onNotify(`Added "${song.title}"`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setGalleryPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatSec = (s: number) => `00:${String(Math.floor(s)).padStart(2, '0')}`;

  // =================== STAGE 1: CAMERA (HISSA 6 + HISSA 7 SHEETS) ===================
  if (stage === 'camera') {
    const filteredSongs = SONGS_CATALOG.filter((s) => {
      if (songSearch.trim()) {
        const q = songSearch.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
      }
      return s.category === songCategory || songCategory === 'Trending';
    });

    const filteredFilters = FILTERS_CATALOG.filter((f) => {
      if (filterSearch.trim()) return f.name.toLowerCase().includes(filterSearch.toLowerCase());
      return f.category === filterCategory || filterCategory === 'Beauty';
    });

    return (
      <div className="fixed inset-0 z-[90] bg-[#07070D] flex flex-col overflow-hidden">
        {/* Live Camera or Studio Backdrop */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {cameraReady ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                filter: computedFilterCss,
                transform: `${facingMode === 'user' ? 'scaleX(-1)' : ''} scaleX(${1 - beauty.slim / 700})`,
              }}
              className="w-full h-full object-cover transition-all duration-200"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Camera Studio Preview"
                referrerPolicy="no-referrer"
                style={{
                  filter: computedFilterCss,
                  transform: `scaleX(${1 - beauty.slim / 700})`,
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/50" />
            </div>
          )}

          {/* Flash Simulation Overlay */}
          {flashOn && <div className="absolute inset-0 bg-white/15 pointer-events-none" />}

          {/* Countdown Display */}
          {countdownVal !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30 pointer-events-none">
              <span className="text-8xl font-extrabold text-[#FFD700] drop-shadow-[0_0_24px_rgba(255,215,0,0.9)] animate-ping">
                {countdownVal}
              </span>
            </div>
          )}

          {/* Top Progress Bar 0-30s */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/15 z-20">
            <div
              style={{ width: `${(recSeconds / 30) * 100}%` }}
              className="h-full gold-gradient transition-all duration-300"
            />
          </div>

          {/* Top Controls */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                stopBeatPreview();
                onClose();
              }}
              aria-label="Close Camera"
              className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="px-3.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-[#FFD700]/40 text-xs font-bold text-white font-mono-num">
                {formatSec(recSeconds)} / 00:30
              </div>
              {selectedSong && (
                <button
                  type="button"
                  onClick={() => setSongsOpen(true)}
                  className="px-3 py-1 rounded-full bg-black/55 text-[11px] font-semibold text-[#FFD700] flex items-center gap-1 max-w-[190px]"
                >
                  <Music className="w-3 h-3 shrink-0" />
                  <span className="truncate">{selectedSong.title}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSongsOpen(true)}
                aria-label="Music Library"
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center active:scale-95"
              >
                <Music className="w-5 h-5 text-[#FFD700]" />
              </button>
              <button
                type="button"
                onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
                aria-label="Flip Camera"
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center active:scale-95"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlashOn((f) => !f);
                  onNotify(!flashOn ? 'Flash On' : 'Flash Off');
                }}
                aria-label="Toggle Flash"
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 ${
                  flashOn ? 'gold-gradient text-white' : 'bg-black/45 text-white'
                }`}
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Vertical Icons: Filters, Beauty, Speed, Timer */}
          <div className="absolute right-3 top-24 z-20 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setFilterCategory('Golden');
                setFiltersOpen(true);
              }}
              className="flex flex-col items-center gap-1 active:scale-95"
            >
              <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-[#FFD700]" />
              </div>
              <span className="text-[11px] font-semibold text-white drop-shadow">Filters</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterCategory('Beauty');
                setFiltersOpen(true);
              }}
              className="flex flex-col items-center gap-1 active:scale-95"
            >
              <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white">
                <Smile className="w-5 h-5 text-pink-300" />
              </div>
              <span className="text-[11px] font-semibold text-white drop-shadow">Beauty</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = speed === '1x' ? '2x' : speed === '2x' ? '0.5x' : '1x';
                setSpeed(next);
                onNotify(`Speed ${next}`);
              }}
              className="flex flex-col items-center gap-1 active:scale-95"
            >
              <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-xs font-extrabold text-white">
                {speed}
              </div>
              <span className="text-[11px] font-semibold text-white drop-shadow">Speed</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = timerDelay === 0 ? 3 : timerDelay === 3 ? 10 : 0;
                setTimerDelay(next);
                onNotify(next === 0 ? 'Timer Off' : `Timer ${next}s`);
              }}
              className="flex flex-col items-center gap-1 active:scale-95"
            >
              <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/25 flex items-center justify-center text-white relative">
                <Clock className="w-5 h-5" />
                {timerDelay > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 rounded-full gold-gradient text-[9px] font-bold">
                    {timerDelay}s
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-white drop-shadow">Timer</span>
            </button>
          </div>

          {/* Bottom Camera Area — Height 160px */}
          <div className="absolute bottom-0 left-0 right-0 h-[160px] bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-5 flex flex-col justify-end gap-3 z-20">
            <div className="flex items-center justify-between max-w-md mx-auto w-full">
              {/* Gallery Left 48px */}
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="flex flex-col items-center gap-1 active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/70 shadow-lg">
                  <img src={galleryPreview} alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-semibold text-white">Gallery</span>
              </button>

              {/* Center Big Red Record Button 72px */}
              <button
                type="button"
                onClick={startOrStopRecord}
                aria-label={recording ? 'Stop Recording' : 'Start Recording'}
                className="w-[76px] h-[76px] rounded-full border-4 border-white p-1 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.65)] active:scale-95 transition-transform"
              >
                <div
                  className={`transition-all duration-200 bg-red-600 ${
                    recording ? 'w-7 h-7 rounded-md' : 'w-full h-full rounded-full'
                  }`}
                />
              </button>

              {/* Effects Right 48px */}
              <button
                type="button"
                onClick={() => {
                  setFiltersOpen(true);
                }}
                className="flex flex-col items-center gap-1 active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 border border-white/40 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-white">Effects</span>
              </button>
            </div>

            <p className="text-center text-xs text-white/70 font-medium">
              {recording ? 'Recording... Tap to Stop & Edit' : '30 Sec Max - Tap to Record'}
            </p>
          </div>
        </div>

        {/* GALLERY PIC + CROP/ZOOM/PAN MODAL (HISSA 6) */}
        {galleryOpen && (
          <div className="fixed inset-0 z-[95] bg-black/90 flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="w-10 h-10 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-white">Select & Crop Pic</h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-[#1A1A22] text-xs font-semibold text-[#FFD700] border border-[#FFD700]/40"
              >
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden my-4">
              <div className="w-72 h-96 rounded-3xl overflow-hidden border-2 border-[#FFD700] relative">
                <img
                  src={galleryPreview}
                  alt="Crop preview"
                  style={{
                    transform: `scale(${galleryZoom}) translateX(${galleryPanX}px)`,
                    filter: computedFilterCss,
                  }}
                  className="w-full h-full object-cover transition-transform"
                />
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto w-full bg-[#1A1A22] p-4 rounded-2xl">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                {[IMG_HOST_FEMALE, IMG_HERO_LIVE, IMG_HOST_MALE, IMG_MUSIC_PARTY].map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryPreview(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 ${
                      galleryPreview === img ? 'border-[#FFD700]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="Option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Zoom</span>
                  <span>{galleryZoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2}
                  step={0.1}
                  value={galleryZoom}
                  onChange={(e) => setGalleryZoom(Number(e.target.value))}
                  className="w-full accent-[#FFD700]"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Pan</span>
                  <span>{galleryPanX}px</span>
                </div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  step={2}
                  value={galleryPanX}
                  onChange={(e) => setGalleryPanX(Number(e.target.value))}
                  className="w-full accent-[#FFD700]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(galleryPreview);
                  setGalleryOpen(false);
                  setStage('editor');
                }}
                className="w-full h-11 rounded-full gold-gradient text-white font-bold text-sm shadow-lg"
              >
                Use This Pic
              </button>
            </div>
          </div>
        )}

        {/* SONGS LIBRARY SHEET (HISSA 7) */}
        {songsOpen && (
          <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-2xl h-[68vh] bg-[#1A1A22] rounded-t-[24px] border-t border-[#FFD700]/45 flex flex-col">
              <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Global Songs</h3>
                    <p className="text-xs text-[#FFD700]">10,000+ Licensed Tracks</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      stopBeatPreview();
                      setPlayingSongId(null);
                      setSongsOpen(false);
                    }}
                    className="w-9 h-9 rounded-full bg-[#26262F] text-white flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={songSearch}
                    onChange={(e) => setSongSearch(e.target.value)}
                    placeholder="Search 10,000+ Global Songs..."
                    className="w-full h-9 pl-10 pr-4 rounded-full bg-[#26262F] text-sm text-white placeholder-[#888888] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {SONG_CATS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSongCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                        songCategory === cat ? 'gold-gradient text-white' : 'bg-[#26262F] text-[#A1A1AA]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                {filteredSongs.map((song) => {
                  const isPlaying = playingSongId === song.id;
                  return (
                    <div
                      key={song.id}
                      className="h-16 px-2.5 rounded-2xl bg-[#26262F]/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${song.coverColor} flex items-center justify-center shrink-0`}
                        >
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-white truncate">{song.title}</p>
                          <p className="text-[13px] text-[#9CA3AF] truncate">
                            {song.artist} · {song.uses}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePlaySong(song)}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                          className="w-9 h-9 rounded-full bg-white text-[#07070D] flex items-center justify-center active:scale-95"
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUseSong(song)}
                          className="w-[60px] h-9 rounded-full gold-gradient text-white text-xs font-bold shadow active:scale-95"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Volume Sliders */}
              <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-4 bg-[#14141C]">
                <div>
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>Original Sound</span>
                    <span className="text-[#FFD700] font-bold">{originalVol}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={originalVol}
                    onChange={(e) => setOriginalVol(Number(e.target.value))}
                    className="w-full accent-[#FFD700]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-white/80 mb-1">
                    <span>Music Sound</span>
                    <span className="text-[#FFD700] font-bold">{musicVol}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={musicVol}
                    onChange={(e) => setMusicVol(Number(e.target.value))}
                    className="w-full accent-[#FFD700]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILTERS & BEAUTY PANEL SHEET (HISSA 7) */}
        {filtersOpen && (
          <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex items-end justify-center">
            <div className="w-full max-w-2xl h-[56vh] bg-[#1A1A22] rounded-t-[24px] border-t border-[#FFD700]/45 flex flex-col">
              <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Filters - 10,000</h3>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#26262F] text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#888888] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Search Beauty, Vintage, Golden..."
                    className="w-full h-9 pl-9 pr-3 rounded-full bg-[#26262F] text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {FILTER_CATS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                        filterCategory === cat ? 'gold-gradient text-white' : 'bg-[#26262F] text-[#A1A1AA]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {filteredFilters.map((f) => {
                    const active = selectedFilter.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic();
                          setSelectedFilter(f);
                        }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                            active ? 'border-[#FFD700] scale-105 shadow-[0_0_12px_rgba(255,215,0,0.6)]' : 'border-white/20'
                          }`}
                        >
                          <img
                            src={capturedImage}
                            alt={f.name}
                            style={{ filter: f.css }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`text-[11px] font-semibold truncate w-full text-center ${active ? 'text-[#FFD700]' : 'text-white/80'}`}>
                          {f.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Beauty Controls */}
                <div className="p-3.5 rounded-2xl bg-[#26262F] space-y-2.5">
                  {[
                    { key: 'smooth' as const, label: 'Smooth Skin', val: beauty.smooth },
                    { key: 'whitening' as const, label: 'Whitening', val: beauty.whitening },
                    { key: 'slim' as const, label: 'Face Slim', val: beauty.slim },
                  ].map((slider) => (
                    <div key={slider.key}>
                      <div className="flex justify-between text-xs text-white mb-1">
                        <span>{slider.label}</span>
                        <span className="text-[#FFD700] font-bold">{slider.val}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={slider.val}
                        onChange={(e) => setBeauty((prev) => ({ ...prev, [slider.key]: Number(e.target.value) }))}
                        className="w-full accent-[#FFD700]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =================== STAGE 2: CAPCUT VIDEO EDITOR (HISSA 8) ===================
  if (stage === 'editor') {
    const tools: { id: EditorTool; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: 'Trim', icon: Scissors },
      { id: 'Split', icon: Layers },
      { id: 'Speed', icon: Gauge },
      { id: 'Text', icon: Type },
      { id: 'Stickers', icon: Smile },
      { id: 'Effects', icon: Sparkles },
      { id: 'Voice Over', icon: Mic },
      { id: 'Volume', icon: Volume2 },
      { id: 'Delete', icon: Trash2 },
    ];

    return (
      <div className="fixed inset-0 z-[90] bg-[#07070D] flex flex-col overflow-y-auto">
        <div className="gold-line-top" />

        {/* Top Bar + Video Preview Height 380px */}
        <div className="relative w-full h-[360px] sm:h-[400px] bg-black shrink-0 overflow-hidden">
          <img
            src={capturedImage}
            alt="Video Editor Preview"
            style={{
              filter: `${computedFilterCss !== 'none' ? computedFilterCss : ''} ${
                activeEffect === 'Blur' ? 'blur(2px)' : activeEffect === 'Glitch' ? 'hue-rotate(90deg) contrast(1.4)' : ''
              }`.trim(),
            }}
            className={`w-full h-full object-cover ${
              activeEffect === 'Flash' && editorPlaying ? 'animate-pulse' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

          {/* Text & Stickers Overlays */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2 p-4">
            {textOverlays.map((t) => (
              <span
                key={t.id}
                style={{ color: t.color }}
                className={`text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                  t.font === 'Bold' ? 'font-extrabold tracking-wide' : t.font === 'Cursive' ? 'italic font-semibold' : 'font-bold'
                } ${t.animation === 'Pop' ? 'animate-bounce' : t.animation === 'Fade' ? 'animate-pulse' : ''}`}
              >
                {t.text}
              </span>
            ))}
            {addedStickers.length > 0 && (
              <div className="flex items-center gap-2 text-4xl">
                {addedStickers.map((st, idx) => (
                  <span key={idx}>{st}</span>
                ))}
              </div>
            )}
          </div>

          {/* Header Controls */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStage('camera')}
              className="w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 rounded-full bg-black/55 text-xs font-bold text-[#FFD700]">
              Studio Editor · {speed} · {activeEffect !== 'None' ? activeEffect : selectedFilter.name}
            </span>
            <button
              type="button"
              onClick={() => {
                stopBeatPreview();
                setStage('post');
              }}
              className="px-4 py-2 rounded-full gold-gradient text-white text-xs font-bold shadow-lg active:scale-95"
            >
              Next
            </button>
          </div>

          {/* Center Play/Pause */}
          <button
            type="button"
            onClick={() => {
              const next = !editorPlaying;
              setEditorPlaying(next);
              if (next && selectedSong) startBeatPreview(selectedSong.freq, selectedSong.bpm);
              else stopBeatPreview();
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 text-[#07070D] flex items-center justify-center shadow-xl active:scale-95"
          >
            {editorPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Bottom Timeline Height 80px */}
        <div className="bg-[#1A1A22] border-y border-[#FFD700]/25 px-4 py-2.5 space-y-1.5 shrink-0">
          <div className="relative h-10 rounded-xl overflow-hidden bg-[#26262F] flex">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <img key={i} src={capturedImage} alt="Clip" className="flex-1 h-full object-cover opacity-85 border-r border-black/40" />
            ))}
            {splits.map((sp, i) => (
              <div key={i} style={{ left: `${sp}%` }} className="absolute top-0 bottom-0 w-0.5 bg-white shadow" />
            ))}
            <div
              style={{ left: `${trimStart}%`, right: `${100 - trimEnd}%` }}
              className="absolute inset-y-0 border-2 border-[#FFD700] rounded-lg pointer-events-none"
            />
          </div>
          {/* Music Wave Gold Below */}
          <div className="h-5 rounded-lg bg-[#0B0B10] px-2 flex items-center gap-1 overflow-hidden">
            <Music className="w-3 h-3 text-[#FFD700] shrink-0" />
            <div className="flex-1 flex items-center gap-0.5 h-3">
              {Array.from({ length: 42 }).map((_, idx) => (
                <span
                  key={idx}
                  style={{ height: `${30 + ((idx * 17) % 70)}%` }}
                  className="flex-1 rounded-full bg-[#FFD700]/80"
                />
              ))}
            </div>
            <span className="text-[10px] text-[#FFD700] font-semibold truncate max-w-[110px]">
              {selectedSong?.title || 'Original'}
            </span>
          </div>
        </div>

        {/* Tools Row Horizontal Scroll */}
        <div className="px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 border-b border-white/10">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setActiveTool(tool.id);
                  if (tool.id === 'Split') {
                    setSplits((prev) => [...prev, 25 + Math.floor(Math.random() * 50)]);
                    onNotify('Clip Split at Playhead');
                  }
                }}
                className="flex flex-col items-center gap-1 shrink-0 active:scale-95"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-[#1A1A22] flex items-center justify-center border-2 transition-colors ${
                    active ? 'border-[#FFD700] text-[#FFD700]' : 'border-white/10 text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold ${active ? 'text-[#FFD700]' : 'text-white'}`}>
                  {tool.id}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Panel */}
        <div className="flex-1 p-4 space-y-3 max-w-2xl mx-auto w-full">
          {activeTool === 'Trim' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] space-y-3">
              <p className="text-sm font-bold text-[#FFD700]">Trim Clip ({trimStart}% – {trimEnd}%)</p>
              <input
                type="range"
                min={0}
                max={45}
                value={trimStart}
                onChange={(e) => setTrimStart(Number(e.target.value))}
                className="w-full accent-[#FFD700]"
              />
              <input
                type="range"
                min={55}
                max={100}
                value={trimEnd}
                onChange={(e) => setTrimEnd(Number(e.target.value))}
                className="w-full accent-[#FFD700]"
              />
            </div>
          )}

          {activeTool === 'Speed' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] flex items-center justify-center gap-3">
              {(['0.5x', '1x', '2x'] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSpeed(sp)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold ${
                    speed === sp ? 'gold-gradient text-white' : 'bg-[#26262F] text-white/80'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          )}

          {activeTool === 'Text' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter video text..."
                  className="flex-1 h-10 px-3 rounded-xl bg-[#26262F] text-sm text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newText.trim()) return;
                    setTextOverlays((prev) => [
                      ...prev,
                      { id: `txt-${Date.now()}`, text: newText.trim(), font: textFont, color: textColor, animation: textAnim },
                    ]);
                    setNewText('');
                  }}
                  className="px-4 h-10 rounded-xl gold-gradient text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {(['Poppins', 'Bold', 'Cursive'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTextFont(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      textFont === f ? 'gold-gradient text-white' : 'bg-[#26262F] text-white/70'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                {['#FFD700', '#FFFFFF', '#EF4444', '#111111'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTextColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 ${textColor === c ? 'border-[#FFD700] scale-110' : 'border-white/30'}`}
                  />
                ))}
                {(['Fade', 'Pop', 'Slide'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setTextAnim(a)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      textAnim === a ? 'bg-purple-600 text-white' : 'bg-[#26262F] text-white/70'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTool === 'Stickers' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] space-y-3">
              <input
                type="text"
                value={stickerSearch}
                onChange={(e) => setStickerSearch(e.target.value)}
                placeholder="Search 1000+ Stickers & Emojis..."
                className="w-full h-9 px-3 rounded-full bg-[#26262F] text-xs text-white focus:outline-none"
              />
              <div className="grid grid-cols-9 gap-2 max-h-28 overflow-y-auto">
                {STICKERS_CATALOG.map((st, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAddedStickers((prev) => [...prev, st])}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTool === 'Effects' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] flex flex-wrap gap-2">
              {(['None', 'Transition', 'Glitch', 'Blur', 'Slow Motion', 'Flash'] as const).map((ef) => (
                <button
                  key={ef}
                  type="button"
                  onClick={() => {
                    setActiveEffect(ef);
                    onNotify(`Effect: ${ef}`);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold ${
                    activeEffect === ef ? 'gold-gradient text-white' : 'bg-[#26262F] text-white/80'
                  }`}
                >
                  {ef}
                </button>
              ))}
            </div>
          )}

          {activeTool === 'Voice Over' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Voice Over Mic</p>
                <p className="text-xs text-[#FFD700] font-mono-num">Recorded: {voiceOverSecs}s</p>
              </div>
              <button
                type="button"
                onClick={() => setVoiceOverActive((v) => !v)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 ${
                  voiceOverActive ? 'bg-red-600 text-white animate-pulse' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{voiceOverActive ? 'Stop Mic' : 'Record Voice'}</span>
              </button>
            </div>
          )}

          {activeTool === 'Volume' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white mb-1">Original ({originalVol}%)</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={originalVol}
                  onChange={(e) => setOriginalVol(Number(e.target.value))}
                  className="w-full accent-[#FFD700]"
                />
              </div>
              <div>
                <p className="text-xs text-white mb-1">Music ({musicVol}%)</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={musicVol}
                  onChange={(e) => setMusicVol(Number(e.target.value))}
                  className="w-full accent-[#FFD700]"
                />
              </div>
            </div>
          )}

          {activeTool === 'Delete' && (
            <div className="p-4 rounded-2xl bg-[#1A1A22] flex items-center justify-between">
              <p className="text-sm text-white/80">Discard this clip and re-shoot?</p>
              <button
                type="button"
                onClick={() => {
                  setTextOverlays([]);
                  setAddedStickers([]);
                  setActiveEffect('None');
                  setStage('camera');
                }}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold"
              >
                Delete Clip
              </button>
            </div>
          )}
        </div>

        {/* Bottom Full Width Gold Post Button */}
        <div className="p-4 bg-[#0B0B10] border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              stopBeatPreview();
              setStage('post');
            }}
            className="w-full max-w-2xl mx-auto h-12 rounded-full gold-gradient text-white font-bold text-sm shadow-xl gold-glow flex items-center justify-center active:scale-95 transition-transform"
          >
            Post
          </button>
        </div>
      </div>
    );
  }

  // =================== STAGE 3: POST TO PROFILE (HISSA 9) ===================
  const suggestedTags = ['#VibeLive', '#PK', '#Shayari', '#Music', '#Viral', '#Pakistan'];

  const handlePublish = () => {
    triggerHaptic(20);
    const extractedTags = caption.match(/#\w+/g) || ['#VibeLive'];
    const newVideo: ShortVideoItem = {
      id: `vid-user-${Date.now()}`,
      title: caption.slice(0, 28) || 'Vibe Live New Reel',
      caption: caption.trim() || 'Vibe Live New Reel #VibeLive',
      hostName: 'BiLAL Shafique2494',
      handle: '@bilal_shafique',
      avatar: IMG_HOST_MALE,
      cover: capturedImage,
      mediaUrl: capturedImage,
      level: 24,
      views: '0',
      likes: 0,
      hashtags: extractedTags,
      isUserCreated: true,
      songName: selectedSong?.title,
      filterCss: computedFilterCss,
      location,
      visibility,
      textOverlays,
      stickers: addedStickers,
    };
    onPublishVideo(newVideo);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#07070D] flex flex-col overflow-y-auto">
      <div className="gold-line-top" />

      {/* Top Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setStage('editor')}
            className="w-9 h-9 rounded-full bg-[#1A1A22] text-white flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[20px] font-bold text-white">Post</h2>
        </div>
        <button
          type="button"
          onClick={handlePublish}
          className="px-4 py-1.5 rounded-full gold-gradient text-white text-xs font-bold shadow"
        >
          Post to Profile
        </button>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
        {/* Middle: Preview 90x140 + Caption Box */}
        <div className="flex gap-3">
          <div className="w-[90px] h-[140px] rounded-[12px] overflow-hidden border border-[#FFD700]/45 shrink-0 relative">
            <img
              src={capturedImage}
              alt="Post Preview"
              style={{ filter: computedFilterCss }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white">
              <Film className="w-3 h-3 inline mr-0.5 text-[#FFD700]" />
              {formatSec(recSeconds || 15)}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <textarea
              value={caption}
              maxLength={150}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption Likho... #VibeLive #PK"
              className="w-full h-[112px] p-3 rounded-[12px] bg-[#1A1A22] text-white placeholder-[#888888] text-sm resize-none border border-white/10 focus:outline-none focus:border-[#FFD700]/60"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-[#888888] font-mono-num">{caption.length}/150</span>
            </div>
          </div>
        </div>

        {/* Hashtags Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {suggestedTags.map((tag) => {
            const included = caption.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (!included && caption.length + tag.length + 1 <= 150) {
                    setCaption((c) => `${c.trim()} ${tag}`.trim());
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                  included ? 'gold-gradient text-white' : 'bg-[#1A1A22] text-white/80 border border-white/10'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {/* Location */}
          <div className="h-14 px-4 rounded-[12px] bg-[#1A1A22] flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white text-sm font-semibold">
              <MapPin className="w-5 h-5 text-[#FFD700]" />
              <span>Add Location</span>
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-sm text-[#9CA3AF] font-semibold focus:outline-none text-right"
            >
              <option value="Lahore" className="bg-[#1A1A22]">Lahore</option>
              <option value="Karachi" className="bg-[#1A1A22]">Karachi</option>
              <option value="Islamabad" className="bg-[#1A1A22]">Islamabad</option>
              <option value="Dubai" className="bg-[#1A1A22]">Dubai</option>
            </select>
          </div>

          {/* Who Can See */}
          <div className="min-h-14 px-4 py-2 rounded-[12px] bg-[#1A1A22] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-white text-sm font-semibold">
              <Users className="w-5 h-5 text-[#FFD700]" />
              <span>Who Can See</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['Everyone', 'Friends', 'Only Me'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setVisibility(opt)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    visibility === opt ? 'gold-gradient text-white' : 'bg-[#26262F] text-[#9CA3AF]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Allow Comments */}
          <div className="h-14 px-4 rounded-[12px] bg-[#1A1A22] flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white text-sm font-semibold">
              <MessageSquare className="w-5 h-5 text-[#FFD700]" />
              <span>Allow Comments</span>
            </div>
            <button
              type="button"
              onClick={() => setAllowComments((v) => !v)}
              aria-label="Toggle Allow Comments"
              className={`w-12 h-7 rounded-full p-1 transition-colors ${allowComments ? 'bg-emerald-500' : 'bg-white/20'}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  allowComments ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Allow Duet */}
          <div className="h-14 px-4 rounded-[12px] bg-[#1A1A22] flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white text-sm font-semibold">
              <ImageIcon className="w-5 h-5 text-[#FFD700]" />
              <span>Allow Duet</span>
            </div>
            <button
              type="button"
              onClick={() => setAllowDuet((v) => !v)}
              aria-label="Toggle Allow Duet"
              className={`w-12 h-7 rounded-full p-1 transition-colors ${allowDuet ? 'bg-emerald-500' : 'bg-white/20'}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  allowDuet ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Big Gold Button */}
      <div className="p-4 bg-[#0B0B10] border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={handlePublish}
          className="w-full max-w-2xl mx-auto h-[52px] rounded-full gold-gradient text-white font-bold text-base shadow-xl gold-glow flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Check className="w-5 h-5" />
          <span>Post to Profile</span>
        </button>
      </div>
    </div>
  );
};
