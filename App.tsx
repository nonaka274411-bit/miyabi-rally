import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { MapPin, Stamp, Gift, QrCode, X, ChevronRight, Sparkles, ScanLine, ArrowRight, Check, Map, Navigation, Locate, Phone, Clock } from 'lucide-react';
import { CHECKPOINTS, PRIZES } from './constants';
import { AppView, Checkpoint, Prize } from './types';
import { generateFortune } from './services/geminiService';

// --- Global Type Definition for Leaflet ---
// @ts-ignore
declare const L: any;

// --- Constants & Styles ---
const COLORS = {
    primary: '#cf2e2e',   // Japanese Red
    gold: '#c5a059',      // Elegant Gold
    text: '#1c1917',      // Warm Black
    bg: '#fafaf9',        // Off-white paper
    white: '#ffffff',
    ink: 'rgba(207, 46, 46, 0.85)'
};

// --- SVG Filters for Realistic Effects ---
const SvgFilters = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
            <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
            </filter>
            <filter id="paper-texture">
                 <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                 <feColorMatrix type="saturate" values="0" />
            </filter>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    </svg>
);

// --- Particle System (Golden Dust) ---
const GoldParticles = () => {
  const particles = useMemo(() => Array.from({ length: 20 }), []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: Math.random() * window.innerHeight, 
            x: Math.random() * window.innerWidth, 
            opacity: 0, 
            scale: Math.random() * 0.5 + 0.2
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [0, 0.4, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
            repeatType: "reverse"
          }}
          className="absolute rounded-full blur-[1px]"
          style={{
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            background: i % 3 === 0 ? COLORS.primary : COLORS.gold,
            opacity: 0.3
          }}
        />
      ))}
    </div>
  );
};

// --- Confetti Effect (Celebration) ---
const Confetti = () => {
    const particles = Array.from({ length: 50 });
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex justify-center">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: "50vh", x: 0, opacity: 1, scale: 0 }}
                    animate={{ 
                        y: ["50vh", -100 + Math.random() * -500], 
                        x: (Math.random() - 0.5) * 600,
                        opacity: [1, 1, 0],
                        scale: [0, 1, 1],
                        rotate: Math.random() * 720
                    }}
                    transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
                    className="absolute w-3 h-3"
                    style={{
                        backgroundColor: [COLORS.gold, COLORS.primary, '#ffffff'][Math.floor(Math.random() * 3)],
                        clipPath: Math.random() > 0.5 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'circle(50%)'
                    }}
                />
            ))}
        </div>
    );
};

// --- Interactive Stamp Action Component ---
const StampActionView = ({ checkpoint, onComplete }: { checkpoint: Checkpoint, onComplete: () => void }) => {
    const controls = useAnimation();
    const [stamped, setStamped] = useState(false);

    const handleStamp = async () => {
        if (stamped) return;
        setStamped(true);
        
        // Impact Animation
        await controls.start({
            scale: [1, 0.8, 1.2, 1],
            rotate: [0, -5, 5, 0],
            transition: { duration: 0.3, type: "spring", stiffness: 300 }
        });

        // Wait a beat for the ink to "set"
        setTimeout(onComplete, 800);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-stone-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-center mb-12"
            >
                <p className="text-sm font-bold tracking-widest opacity-70 mb-2">CHECKPOINT FOUND</p>
                <h2 className="text-3xl font-serif font-bold">{checkpoint.name}</h2>
            </motion.div>

            <motion.div
                animate={controls}
                whileTap={{ scale: 0.9 }}
                onClick={handleStamp}
                className="relative w-64 h-64 cursor-pointer"
            >
                {/* Stamp Handle / Body Visualization */}
                <div className="absolute inset-0 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center justify-center border-8 border-stone-200">
                    <div className="w-48 h-48 rounded-full border-4 border-dashed border-stone-300 flex items-center justify-center">
                        {!stamped ? (
                            <div className="flex flex-col items-center text-stone-300 animate-pulse">
                                <Stamp size={48} />
                                <span className="mt-2 text-xs font-bold tracking-widest">TAP TO STAMP</span>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 1.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <RealisticStamp name={checkpoint.name} />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Impact Ripple */}
                {stamped && (
                    <motion.div
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 rounded-full border-2 border-[#cf2e2e]"
                    />
                )}
            </motion.div>

            <div className="mt-12 text-center text-white/50 text-xs tracking-widest">
                画面中央をタップしてスタンプを押してください
            </div>
        </div>
    );
};

// --- Realistic Stamp Mark Component ---
const RealisticStamp = ({ name }: { name: string }) => (
    <div className="relative w-40 h-40 flex items-center justify-center text-[#cf2e2e] mix-blend-multiply opacity-90">
        <div 
            className="absolute inset-2 border-[6px] border-[#cf2e2e] rounded-full"
            style={{ filter: 'url(#ink-bleed)' }}
        ></div>
        <div className="absolute inset-0 border-[1px] border-[#cf2e2e]/30 rounded-full scale-110 opacity-50" style={{ filter: 'url(#ink-bleed)' }}></div>
        
        <div className="flex flex-col items-center justify-center relative z-10 p-4 text-center" style={{ filter: 'url(#ink-bleed)' }}>
            <span className="font-serif text-[10px] tracking-widest mb-1 font-bold text-[#cf2e2e]">祝・到達</span>
            <span className="font-serif text-2xl font-bold writing-vertical-rl tracking-widest leading-none py-2 border-y border-[#cf2e2e]">{name.slice(0, 4)}</span>
            <div className="flex items-center gap-1 mt-1">
                <span className="font-serif text-[8px] tracking-widest uppercase text-[#cf2e2e]">MIYABI RALLY</span>
            </div>
        </div>
        {/* Date stamp style */}
        <div className="absolute bottom-6 right-6 w-10 h-10 border border-[#cf2e2e] rounded-full flex items-center justify-center rotate-[-15deg] bg-[#f8f8f8]/50 backdrop-blur-[1px]">
             <span className="text-[8px] font-bold text-[#cf2e2e] font-mono">済</span>
        </div>
    </div>
);

// --- Anniversary Badge Component (Opening) ---
const AnniversaryBadge = () => (
  <div className="relative w-72 h-72 flex items-center justify-center">
    {/* Rotating Outer Rings */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 border-[1px] border-[#c5a059]/40 border-dashed rounded-full"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-4 border-[1px] border-[#cf2e2e]/20 rounded-full"
    />

    {/* Main Badge */}
    <motion.div 
       initial={{ scale: 0.8, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
       className="absolute inset-8 rounded-full flex flex-col items-center justify-center bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
    >
        {/* Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-[#f8f8f8] to-[#e5e5e5]"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
            <span className="font-serif text-[#cf2e2e] text-xs font-bold tracking-[0.4em] mb-2 uppercase border-b border-[#cf2e2e]/20 pb-1">Since 1986</span>
            <div className="flex items-baseline leading-none mt-1">
                <span className="font-serif text-[#cf2e2e] text-8xl font-bold tracking-tighter drop-shadow-sm" style={{ fontFamily: '"Shippori Mincho", serif' }}>40</span>
                <span className="font-serif text-[#cf2e2e] text-3xl font-bold ml-1">th</span>
            </div>
            <span className="font-serif text-[#1c1917] text-sm font-medium tracking-[0.3em] mt-4">ANNIVERSARY</span>
            <div className="w-8 h-[2px] bg-[#c5a059] mt-3"></div>
        </div>

        {/* Shine Effect */}
        <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2, ease: "easeInOut", repeatDelay: 3 }}
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
        />
    </motion.div>
  </div>
);

// --- Leaflet Map Component with Geolocation ---
const LeafletMap = ({ checkpoints, stampedIds, onMarkerClick }: { checkpoints: Checkpoint[], stampedIds: number[], onMarkerClick: (id: number) => void }) => {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const userMarkerRef = useRef<any>(null);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [35.226, 138.610], // Default center
            zoom: 13,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        mapRef.current = map;

        // Cleanup
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update Checkpoint Markers
    useEffect(() => {
        if (!mapRef.current) return;
        
        // Clear existing markers (except user marker)
        mapRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
                mapRef.current.removeLayer(layer);
            }
        });

        checkpoints.forEach((cp) => {
            const isStamped = stampedIds.includes(cp.id);
            const color = isStamped ? COLORS.gold : COLORS.primary;
            const size = isStamped ? 24 : 32;
            
            const iconHtml = `
                <div style="
                    width: ${size}px; height: ${size}px;
                    background: ${color};
                    border: 2px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center;
                ">
                    <div style="width: 6px; height: 6px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
                </div>
            `;
            
            const icon = L.divIcon({
                className: 'custom-pin',
                html: iconHtml,
                iconSize: [size, size],
                iconAnchor: [size/2, size]
            });

            const marker = L.marker([cp.lat, cp.lng], { icon }).addTo(mapRef.current);
            
            // Setup popup content with a button that can trigger the React callback
            const popupContent = `
                <div class="text-center p-1 font-sans">
                    <h3 class="font-bold text-sm text-stone-900 mb-1 leading-tight">${cp.name}</h3>
                    <p class="text-[10px] text-stone-500 mb-2 truncate max-w-[150px] mx-auto">${cp.address}</p>
                    <button id="popup-btn-${cp.id}" class="bg-stone-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-stone-700 transition-colors w-full">
                        詳細を見る
                    </button>
                </div>
            `;
            
            marker.bindPopup(popupContent, {
                closeButton: false,
                offset: [0, -size/2],
                className: 'custom-leaflet-popup'
            });

            // Handle popup open to attach event listener to the button inside standard HTML string
            marker.on('popupopen', () => {
                const btn = document.getElementById(`popup-btn-${cp.id}`);
                if(btn) {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        onMarkerClick(cp.id);
                    };
                }
            });
        });
    }, [checkpoints, stampedIds, onMarkerClick]);

    // Handle My Location
    const handleLocateMe = () => {
        if (!mapRef.current) return;

        mapRef.current.locate({ setView: true, maxZoom: 16 });

        mapRef.current.once('locationfound', (e: any) => {
            if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);

            const pulsingIcon = L.divIcon({
                className: 'user-location-pulse',
                html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            userMarkerRef.current = L.marker(e.latlng, { icon: pulsingIcon }).addTo(mapRef.current);
        });
    };

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />
            <button 
                onClick={handleLocateMe}
                className="absolute bottom-6 right-6 z-[1000] bg-white text-stone-700 p-3 rounded-full shadow-xl hover:bg-stone-50 transition-colors active:scale-95"
            >
                <Locate size={20} />
            </button>
        </div>
    );
};

// --- Progress Ring Component ---
const ProgressRing = ({ current, total }: { current: number, total: number }) => {
    const percentage = Math.round((current / total) * 100);
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#e5e5e5"
                    strokeWidth="4"
                    fill="transparent"
                />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={COLORS.primary}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-stone-800 font-serif leading-none">{current}</span>
                <span className="text-[9px] text-stone-400 font-medium">/ {total}</span>
            </div>
        </div>
    );
};

// --- Main Components ---

const Intro = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 bg-[#fafaf9] flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)", transition: { duration: 1, ease: "easeInOut" } }}
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                className="text-center relative z-10"
            >
                <div className="mb-12 inline-block relative scale-110">
                    <AnniversaryBadge />
                </div>
                
                <div className="px-6">
                    <motion.h1 
                        initial={{ opacity:0, y: 20 }}
                        animate={{ opacity:1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3 tracking-tight"
                    >
                        美容室オークラ
                    </motion.h1>
                    <motion.p
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="text-lg font-serif text-stone-600 mb-12"
                    >
                        これからもよろしくスタンプラリー
                    </motion.p>
                </div>
                
                <motion.button 
                    onClick={onComplete}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden rounded-full bg-stone-900 px-12 py-5 text-white shadow-2xl hover:shadow-[0_10px_30px_rgba(207,46,46,0.3)] transition-all group"
                >
                    <div className="absolute inset-0 bg-[#cf2e2e] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.19,1,0.22,1]" />
                    <span className="relative z-10 flex items-center gap-3 text-sm font-bold tracking-[0.2em]">
                        START <ArrowRight size={16} />
                    </span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

const NavBar = ({ currentView, setView }: { currentView: AppView; setView: (v: AppView) => void }) => {
  const navItems = [
    { id: AppView.LOCATIONS, label: 'スポット', icon: Map },
    { id: AppView.STAMP_CARD, label: 'スタンプ帳', icon: Stamp },
    { id: AppView.PRIZES, label: '景品', icon: Gift },
  ];

  return (
    <div className="fixed bottom-6 left-0 w-full z-40 px-6 pointer-events-none flex justify-center">
        <div className="bg-white/90 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-2xl p-2 flex items-center gap-1 pointer-events-auto border border-white/50 ring-1 ring-black/5">
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`relative h-12 w-20 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                            isActive ? 'text-white' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute inset-0 bg-stone-900 rounded-xl"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <item.icon size={20} className="relative z-10 mb-0.5" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="relative z-10 text-[9px] font-bold tracking-tight">
                            {item.label}
                        </span>
                    </button>
                )
            })}
            
            <div className="w-[1px] h-8 bg-stone-200 mx-2"></div>

            <button
                onClick={() => setView(AppView.SCANNER)}
                className="w-14 h-14 bg-[#cf2e2e] text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-95 transition-all relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <QrCode size={24} />
            </button>
        </div>
    </div>
  );
};

const StampBook = ({ stampedIds, onViewDetail }: { stampedIds: number[], onViewDetail: (id: number) => void }) => {
    return (
        <div className="pt-24 pb-32 min-h-screen flex flex-col px-6">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-stone-900">スタンプ帳</h2>
                    <div className="h-1 w-12 bg-[#cf2e2e] mt-2 rounded-full"></div>
                </div>
                <ProgressRing current={stampedIds.length} total={CHECKPOINTS.length} />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CHECKPOINTS.map((cp) => {
                     const isStamped = stampedIds.includes(cp.id);
                     return (
                        <motion.div 
                            key={cp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: cp.id * 0.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onViewDetail(cp.id)}
                            className={`
                                aspect-square relative rounded-2xl shadow-sm border transition-all overflow-hidden group cursor-pointer
                                ${isStamped ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-200/50 border-dashed'}
                            `}
                        >
                            {/* Texture */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none"></div>

                            {/* ID Number Watermark */}
                            <div className="absolute top-2 left-4 text-6xl font-serif font-black text-stone-100/80 pointer-events-none select-none">
                                {String(cp.id).padStart(2, '0')}
                            </div>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
                                <AnimatePresence>
                                    {isStamped ? (
                                        <motion.div 
                                            initial={{ scale: 2, opacity: 0, rotate: -30 }}
                                            animate={{ scale: 1, opacity: 1, rotate: Math.random() * 10 - 5 }}
                                            transition={{ type: "spring", damping: 15 }}
                                            className="w-24 h-24"
                                        >
                                            <RealisticStamp name={cp.name} />
                                        </motion.div>
                                    ) : (
                                        <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                                            <div className="w-10 h-10 bg-stone-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                <Stamp size={18} className="text-stone-400" />
                                            </div>
                                            <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">Collect</span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer Label */}
                            <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-[2px] py-2 px-3 text-center border-t border-stone-100">
                                <p className="text-[10px] font-bold text-stone-600 truncate font-serif">{cp.name}</p>
                            </div>
                        </motion.div>
                     );
                })}
            </div>
        </div>
    );
};

const openGoogleMaps = (e: React.MouseEvent, checkpoint: Checkpoint) => {
    e.stopPropagation();
    const query = `${checkpoint.name} ${checkpoint.address}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
};

const LocationList = ({ stampedIds, onViewDetail }: { stampedIds: number[], onViewDetail: (id: number) => void }) => {
    return (
        <div className="pb-32 min-h-screen flex flex-col relative bg-[#fafaf9]">
             {/* Map Section */}
             <div className="h-[45vh] w-full sticky top-0 z-0 bg-stone-200">
                <LeafletMap checkpoints={CHECKPOINTS} stampedIds={stampedIds} onMarkerClick={onViewDetail} />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fafaf9] to-transparent pointer-events-none z-[400]"></div>
             </div>

             {/* List Section */}
             <div className="px-6 pt-6 bg-[#fafaf9] relative z-10 rounded-t-[2.5rem] -mt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-white/50 min-h-[50vh]">
                 <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-6"></div>
                 
                 <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-stone-900">スポット一覧</h2>
                        <p className="text-[10px] text-stone-400 tracking-widest uppercase mt-1">Checkpoints</p>
                    </div>
                    <span className="text-xs font-bold bg-stone-100 text-stone-500 px-3 py-1.5 rounded-full border border-stone-200">{CHECKPOINTS.length}箇所</span>
                 </div>

                 <div className="grid gap-4 pb-24">
                     {CHECKPOINTS.map((cp, idx) => {
                         const isStamped = stampedIds.includes(cp.id);
                         return (
                            <motion.div 
                                key={cp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white p-3 pr-4 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg hover:border-stone-200"
                                onClick={() => onViewDetail(cp.id)}
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-stone-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <img src={cp.image} className={`w-full h-full object-cover transition-all duration-500 ${isStamped ? '' : 'grayscale contrast-125'}`} alt="" />
                                    {isStamped && (
                                        <div className="absolute inset-0 bg-[#cf2e2e]/80 flex items-center justify-center backdrop-blur-[1px]">
                                            <Check size={20} className="text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-stone-800 text-sm truncate pr-2 font-serif">{cp.name}</h3>
                                        <span className="text-[9px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100">#{String(cp.id).padStart(2,'0')}</span>
                                    </div>
                                    <p className="text-[10px] text-stone-500 truncate mb-2">{cp.address}</p>
                                    
                                    <button 
                                        onClick={(e) => openGoogleMaps(e, cp)}
                                        className="flex items-center gap-1 text-[10px] font-bold text-[#cf2e2e] bg-[#cf2e2e]/5 px-2 py-1 rounded-md hover:bg-[#cf2e2e]/10 transition-colors inline-block"
                                    >
                                        <Map size={10} className="inline mr-1" /> マップ
                                    </button>
                                </div>
                                <ChevronRight size={16} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                            </motion.div>
                         )
                     })}
                 </div>
             </div>
        </div>
    );
};

const PrizeSection = ({ stampedIds }: { stampedIds: number[] }) => {
    return (
        <div className="pt-24 pb-32 px-6 min-h-screen">
             <div className="mb-10">
                <h2 className="text-3xl font-serif font-bold text-stone-900">景品一覧</h2>
                <div className="h-1 w-12 bg-[#cf2e2e] mt-2 rounded-full"></div>
             </div>

             <div className="grid gap-6">
                 {PRIZES.map((prize, idx) => {
                     const isLocked = stampedIds.length < prize.requiredStamps;
                     return (
                        <motion.div
                            key={prize.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative bg-white rounded-3xl overflow-hidden transition-all duration-500 border border-stone-100 ${isLocked ? '' : 'shadow-xl ring-1 ring-[#cf2e2e]/20'}`}
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img 
                                    src={prize.image} 
                                    alt={prize.name} 
                                    className={`w-full h-full object-cover transition-all duration-700 ${isLocked ? 'grayscale brightness-110 blur-[1px]' : 'hover:scale-105'}`} 
                                />
                                {isLocked && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                                        <div className="bg-stone-900/90 text-white px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-stone-500"></div>
                                            <span className="text-xs font-bold tracking-widest">LOCKED</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-stone-900 text-lg font-serif">{prize.name}</h3>
                                    <span className="text-xs font-bold text-[#cf2e2e] bg-[#cf2e2e]/5 px-2 py-1 rounded-md whitespace-nowrap border border-[#cf2e2e]/10">あと {Math.max(0, prize.requiredStamps - stampedIds.length)}個</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed mb-6 font-medium">{prize.description}</p>
                                
                                <button 
                                    disabled={isLocked}
                                    className={`w-full py-4 rounded-xl text-xs font-bold tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                        isLocked 
                                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                                        : 'bg-stone-900 text-white hover:bg-[#cf2e2e] shadow-lg shadow-stone-900/20'
                                    }`}
                                >
                                    {isLocked ? 'スタンプを集めて交換' : '景品と交換する'}
                                </button>
                            </div>
                        </motion.div>
                     )
                 })}
             </div>
        </div>
    );
};

// --- Checkpoint Detail (Modal) ---
const CheckpointDetail = ({ checkpoint, isStamped, onClose }: { checkpoint: Checkpoint, isStamped: boolean, onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div 
                className="bg-white w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[2rem] shadow-2xl relative no-scrollbar overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                layoutId={`card-${checkpoint.id}`}
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className="relative h-64">
                    <img src={checkpoint.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/40 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="px-6 pb-8 -mt-12 relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/50 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#cf2e2e] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">SPOT {String(checkpoint.id).padStart(2,'0')}</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">{checkpoint.name}</h2>
                        
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3 text-stone-600 text-xs font-medium bg-stone-50 p-3 rounded-lg border border-stone-100">
                                <MapPin size={16} className="text-[#cf2e2e] shrink-0" />
                                <div>
                                    <span className="block text-[9px] text-stone-400 font-bold mb-0.5 tracking-wider">住所</span>
                                    {checkpoint.address}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-stone-600 text-xs font-medium bg-stone-50 p-3 rounded-lg border border-stone-100">
                                <Clock size={16} className="text-[#cf2e2e] shrink-0" />
                                <div>
                                    <span className="block text-[9px] text-stone-400 font-bold mb-0.5 tracking-wider">営業時間</span>
                                    {checkpoint.hours}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-stone-600 text-xs font-medium bg-stone-50 p-3 rounded-lg border border-stone-100">
                                <Phone size={16} className="text-[#cf2e2e] shrink-0" />
                                <div>
                                    <span className="block text-[9px] text-stone-400 font-bold mb-0.5 tracking-wider">電話番号</span>
                                    {checkpoint.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm prose-stone mb-8 px-1">
                        <p className="leading-loose text-stone-600 font-medium text-justify">{checkpoint.description}</p>
                    </div>

                    <div className="flex gap-3">
                         <button 
                            onClick={(e) => openGoogleMaps(e, checkpoint)}
                            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Map size={14} /> マップで見る
                        </button>
                        {isStamped && (
                            <div className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-400 text-xs font-bold flex items-center justify-center gap-2 border border-stone-200">
                                <Check size={14} /> 獲得済み
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Scanner ---
const Scanner = ({ onClose, onScan }: { onClose: () => void, onScan: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Simulate Scan Effect
    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => {
                stream = s;
                if (videoRef.current) videoRef.current.srcObject = s;
            })
            .catch(console.error);
        return () => stream?.getTracks().forEach(t => t.stop());
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
        >
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-between py-12 px-6">
                <div className="w-full flex justify-end">
                    <button onClick={onClose} className="p-4 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10"><X size={24}/></button>
                </div>
                
                {/* Scanner Frame */}
                <div className="relative w-72 h-72">
                    <div className="absolute inset-0 border-[1px] border-white/30 rounded-[2rem]"></div>
                    <div className="absolute inset-0 border-[4px] border-transparent border-t-[#cf2e2e] border-b-[#cf2e2e] rounded-[2rem] opacity-80"></div>
                    
                    {/* Scanning Laser */}
                    <motion.div 
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-[#cf2e2e] shadow-[0_0_20px_#cf2e2e] z-10"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine className="text-white/20 w-32 h-32" />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-white text-xs font-bold tracking-widest mb-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                        QRコードをフレームに合わせてください
                    </p>
                    
                    {/* Simulator Button (For Demo) */}
                    <button 
                        onClick={onScan} 
                        className="group relative px-8 py-4 rounded-full bg-white text-stone-900 font-bold text-xs tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                             デモスキャン実行 <ChevronRight size={14} />
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Fortune Result (Typewriter Effect) ---
const FortuneResult = ({ result, checkpointName, onClose }: { result: string, checkpointName: string, onClose: () => void }) => {
    const letters = Array.from(result);
    
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/90 backdrop-blur-xl">
            <Confetti />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#fafaf9] w-full max-w-sm p-10 relative shadow-2xl overflow-hidden rounded-xl border border-white/50"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#cf2e2e] via-[#c5a059] to-[#cf2e2e]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 mix-blend-multiply pointer-events-none"></div>

                <div className="text-center mt-2 mb-10 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block bg-stone-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg mb-4"
                    >
                        Celebration
                    </motion.div>
                    <motion.h3 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-serif text-2xl font-bold text-stone-900"
                    >
                        {checkpointName}
                    </motion.h3>
                </div>

                <div className="min-h-[160px] flex items-center justify-center text-center relative z-10">
                    <motion.p 
                        className="font-serif text-lg leading-loose text-stone-800 font-medium"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        {letters.map((letter, index) => (
                            <motion.span 
                                key={index} 
                                variants={{
                                    visible: { opacity: 1, y: 0 },
                                    hidden: { opacity: 0, y: 10 }
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.p>
                </div>

                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    onClick={onClose} 
                    className="w-full mt-8 py-4 bg-stone-900 text-white text-xs font-bold tracking-widest hover:bg-[#cf2e2e] transition-all uppercase rounded-lg shadow-lg"
                >
                    閉じる
                </motion.button>
            </motion.div>
        </div>
    );
}

// --- Main App Logic ---
export default function App() {
  const [view, setView] = useState<AppView>(AppView.INTRO);
  const [stampedIds, setStampedIds] = useState<number[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [scannedCheckpoint, setScannedCheckpoint] = useState<Checkpoint | null>(null); // For stamp action
  const [fortuneResult, setFortuneResult] = useState<{ text: string, checkpoint: Checkpoint } | null>(null); // For result view
  const [isLoadingFortune, setIsLoadingFortune] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('miyabi_stamps');
    if (saved) setStampedIds(JSON.parse(saved));
  }, []);

  const handleScan = () => {
    const available = CHECKPOINTS.filter(cp => !stampedIds.includes(cp.id));
    // Demo Logic: Pick the next available stamp or random if full
    const target = available.length > 0 ? available[0] : CHECKPOINTS[0];
    
    // 1. Move to Stamp Action View
    setTimeout(() => {
        setScannedCheckpoint(target);
        setView(AppView.STAMP_CARD); // Set background view
    }, 1000);
  };

  const onStampComplete = async () => {
      if (!scannedCheckpoint) return;
      
      // 2. Save Data
      const newIds = Array.from(new Set([...stampedIds, scannedCheckpoint.id]));
      setStampedIds(newIds);
      localStorage.setItem('miyabi_stamps', JSON.stringify(newIds));

      // 3. Generate Fortune (Loading)
      setIsLoadingFortune(true);
      const text = await generateFortune(scannedCheckpoint.name);
      
      // 4. Show Result
      setIsLoadingFortune(false);
      setFortuneResult({ text, checkpoint: scannedCheckpoint });
      setScannedCheckpoint(null); // Close stamp action view
  };

  return (
    <div className="min-h-screen relative font-sans text-stone-900 bg-[#fafaf9]">
      <SvgFilters />
      <GoldParticles />

      <AnimatePresence mode="wait">
        {view === AppView.INTRO && <Intro onComplete={() => setView(AppView.STAMP_CARD)} />}
      </AnimatePresence>

      <main>
        <AnimatePresence mode="wait">
             {view === AppView.STAMP_CARD && (
                <motion.div key="stamp" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.4}}>
                    <StampBook stampedIds={stampedIds} onViewDetail={(id) => setSelectedCheckpoint(CHECKPOINTS.find(c => c.id === id) || null)} />
                </motion.div>
             )}
             {view === AppView.LOCATIONS && (
                <motion.div key="loc" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.4}}>
                    <LocationList stampedIds={stampedIds} onViewDetail={(id) => setSelectedCheckpoint(CHECKPOINTS.find(c => c.id === id) || null)} />
                </motion.div>
             )}
             {view === AppView.PRIZES && (
                <motion.div key="prize" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.4}}>
                    <PrizeSection stampedIds={stampedIds} />
                </motion.div>
             )}
        </AnimatePresence>
      </main>

      {view !== AppView.INTRO && view !== AppView.SCANNER && <NavBar currentView={view} setView={setView} />}
      
      <AnimatePresence>
        {view === AppView.SCANNER && <Scanner onClose={() => setView(AppView.STAMP_CARD)} onScan={handleScan} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCheckpoint && (
            <CheckpointDetail 
                checkpoint={selectedCheckpoint} 
                isStamped={stampedIds.includes(selectedCheckpoint.id)}
                onClose={() => setSelectedCheckpoint(null)}
            />
        )}
      </AnimatePresence>
    
      {/* Stamp Action Overlay */}
      <AnimatePresence>
        {scannedCheckpoint && (
            <StampActionView checkpoint={scannedCheckpoint} onComplete={onStampComplete} />
        )}
      </AnimatePresence>

      {/* Fortune Result Overlay */}
      <AnimatePresence>
        {fortuneResult && (
            <FortuneResult 
                result={fortuneResult.text} 
                checkpointName={fortuneResult.checkpoint.name} 
                onClose={() => setFortuneResult(null)} 
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
          {isLoadingFortune && (
              <motion.div 
                initial={{opacity:0}} 
                animate={{opacity:1}} 
                exit={{opacity:0}} 
                className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-xl flex flex-col items-center justify-center"
              >
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                      <Sparkles className="text-white mb-6" size={48} />
                  </motion.div>
                  <p className="text-xs font-bold tracking-[0.3em] text-white animate-pulse">運勢を読み解き中...</p>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}