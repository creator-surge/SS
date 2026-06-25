/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Search, ShoppingBag, User, 
  Play, Radio, MapPin, TrendingUp, 
  ChevronRight, MessageSquare, Heart, Share2,
  Plus, Bell, Settings, Globe, Zap, ShieldCheck,
  BarChart3, Sparkles, CreditCard, Layers, 
  Lock, Eye, Users, DollarSign, Activity, X
} from 'lucide-react';
import { cn } from './lib/utils';
import { Reel, Listing, AudioSpace, GeoPoint, CreatorProfile, Analytic, Notification, Tier, SystemSetting } from './types';
import { geminiService } from './services/geminiService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('/api/notifications').then(res => res.json()).then(setNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const tabs = [
    { id: 'reels', icon: Play, label: 'Reels' },
    { id: 'spaces', icon: Radio, label: 'Spaces' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Market' },
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'admin', icon: ShieldCheck, label: 'Admin' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="text-black w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white hidden sm:block">SURGE</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-white text-black" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden md:block">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-white/60 hover:text-white transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black" />
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <button className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Mark all as read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={cn("p-4 border-b border-white/5 hover:bg-white/5 transition-colors", !n.is_read && "bg-emerald-500/5")}>
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            n.type === 'system' ? 'bg-blue-500/20 text-blue-400' :
                            n.type === 'activity' ? 'bg-purple-500/20 text-purple-400' :
                            n.type === 'membership' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                          )}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white">{n.title}</p>
                            <p className="text-[11px] text-white/40 leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-white/20 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center">
                        <p className="text-white/20 text-xs">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 p-[1px] cursor-pointer" onClick={() => setActiveTab('profile')}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/seed/user/100" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Market' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10 px-6 py-3 sm:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === tab.id ? "text-emerald-400" : "text-white/40"
            )}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- Screens ---

const HomeScreen = () => {
  const stats = [
    { label: 'Active Creators', value: '12.4K', trend: '+12%' },
    { label: 'Total Commerce', value: '$4.2M', trend: '+24%' },
    { label: 'Live Spaces', value: '142', trend: '+8%' },
  ];

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto space-y-12">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[400px] flex items-center px-8 sm:px-16">
        <img 
          src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          alt="Hero"
        />
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3 h-3" />
            The Future of Social Commerce
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold text-white leading-[0.9] tracking-tighter"
          >
            EMPOWERING THE <br /> <span className="text-emerald-400">CREATOR ECONOMY</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-lg"
          >
            Join the global super-app where creators build, connect, and thrive. 
            From shoppable reels to live audio spaces.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all flex items-center gap-2">
              Start Creating <ChevronRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-md transition-all">
              Explore Marketplace
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group"
          >
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
              <span className="text-emerald-400 text-sm font-bold mb-1">{stat.trend}</span>
            </div>
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-emerald-500"
              />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Built for Growth</h2>
            <p className="text-white/40">Everything you need to scale your digital empire.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Play, title: 'Shoppable Reels', desc: 'Convert views into sales instantly with integrated checkout.', color: 'bg-blue-500' },
            { icon: Radio, title: 'Live Spaces', desc: 'Host audio rooms and connect with your community in real-time.', color: 'bg-purple-500' },
            { icon: Globe, title: 'Global Market', desc: 'Sell digital, physical, or services to a worldwide audience.', color: 'bg-emerald-500' },
            { icon: ShieldCheck, title: 'Guardian AI', desc: 'Advanced analytics and growth insights powered by Gemini.', color: 'bg-orange-500' },
          ].map((feature, i) => (
            <div key={feature.title} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:bg-white/[0.07] transition-all">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", feature.color)}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">{feature.title}</h4>
              <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ReelsScreen = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  useEffect(() => {
    fetch('/api/reels').then(res => res.json()).then(setReels);
  }, []);

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {reels.map((reel, index) => (
          index === activeReelIndex && (
            <motion.div 
              key={reel.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <video 
                src={reel.video_url} 
                autoPlay 
                loop 
                muted 
                className="h-full w-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

              {/* Content */}
              <div className="absolute bottom-24 left-6 right-20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500 p-0.5">
                    <img src={reel.avatar_url} className="w-full h-full rounded-full object-cover" alt={reel.handle} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">@{reel.handle}</h4>
                    <p className="text-white/60 text-sm">{reel.caption}</p>
                  </div>
                </div>
                
                {reel.is_shoppable && (
                  <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 group hover:bg-emerald-400 transition-all">
                    <ShoppingBag className="w-4 h-4" />
                    Shop this Reel
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Engagement Bar */}
              <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center">
                <div className="flex flex-col items-center gap-1">
                  <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:text-red-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <span className="text-white text-xs font-bold">12.4K</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-6 h-6" />
                  </button>
                  <span className="text-white text-xs font-bold">842</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:text-emerald-400 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                  <span className="text-white text-xs font-bold">Share</span>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 right-0 w-20 flex flex-col items-center justify-center gap-4 z-10">
        <button 
          onClick={() => setActiveReelIndex(prev => Math.max(0, prev - 1))}
          className="p-2 text-white/40 hover:text-white"
        >
          <ChevronRight className="w-8 h-8 -rotate-90" />
        </button>
        <button 
          onClick={() => setActiveReelIndex(prev => (prev + 1) % reels.length)}
          className="p-2 text-white/40 hover:text-white"
        >
          <ChevronRight className="w-8 h-8 rotate-90" />
        </button>
      </div>
    </div>
  );
};

const MarketplaceScreen = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 8;

  const fetchListings = async (currentOffset: number, currentCategory: string, isInitial: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace?limit=${LIMIT}&offset=${currentOffset}&category=${currentCategory}`);
      const data = await res.json();
      
      if (isInitial) {
        setListings(data);
      } else {
        setListings(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === LIMIT);
      setOffset(currentOffset + data.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchListings(0, category, true);
  }, [category]);

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchListings(offset, category);
      }
    });

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore, offset, category]);

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white tracking-tighter">Marketplace</h2>
          <p className="text-white/40">Discover unique digital and physical goods from top creators.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['all', 'digital', 'service', 'physical'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap",
                category === cat ? "bg-emerald-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((item, index) => (
          <motion.div 
            layout
            key={item.id}
            ref={index === listings.length - 1 ? lastElementRef : null}
            className="group rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all"
          >
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${item.id}/600`} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                {item.category}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">@{item.handle}</p>
                <h4 className="text-xl font-bold text-white line-clamp-1">{item.title}</h4>
                <p className="text-white/40 text-sm line-clamp-2 mt-2">{item.description}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-2xl font-bold text-white">${item.price}</span>
                <button className="p-3 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 transition-all">
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && listings.length > 0 && (
        <p className="text-center text-white/20 text-sm font-medium py-8 uppercase tracking-widest">
          You've reached the end of the market
        </p>
      )}
    </div>
  );
};

const MapScreen = () => {
  const [points, setPoints] = useState<GeoPoint[]>([]);

  useEffect(() => {
    fetch('/api/map/creators').then(res => res.json()).then(setPoints);
  }, []);

  return (
    <div className="h-screen w-full pt-16 relative overflow-hidden bg-[#0a0a0a]">
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[800px] h-[500px]">
          {/* Mock Continents */}
          <div className="absolute top-20 left-40 w-40 h-32 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-60 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
          
          {points.map((point) => (
            <motion.div
              key={point.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute cursor-pointer group"
              style={{ 
                left: `${(point.lng + 180) * (800 / 360)}px`, 
                top: `${(90 - point.lat) * (500 / 180)}px` 
              }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 p-0.5 bg-black overflow-hidden group-hover:scale-125 transition-transform">
                  <img src={point.avatar_url} alt={point.handle} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                    @{point.handle}
                  </span>
                </div>
                {/* Pulse Effect */}
                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-32 left-8 space-y-4">
        <div className="p-6 rounded-3xl bg-black/80 backdrop-blur-xl border border-white/10 max-w-xs space-y-4">
          <h3 className="text-xl font-bold text-white">Geo Discovery</h3>
          <p className="text-white/40 text-sm">Find and connect with creators in your local area or across the globe.</p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {points.slice(0, 3).map(p => (
                <img key={p.id} src={p.avatar_url} className="w-8 h-8 rounded-full border-2 border-black" />
              ))}
            </div>
            <span className="text-white/60 text-xs font-medium">+{points.length} creators nearby</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListingOptimizer = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<{ optimized_title: string, optimized_description: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!title || !description) return;
    setLoading(true);
    try {
      const res = await geminiService.optimizeListing(title, description);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Listing Optimizer</h3>
              <p className="text-white/40 text-sm">Guardian AI visibility enhancement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          {!result ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Current Title</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Creator Masterclass"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Current Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your listing..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all resize-none"
                />
              </div>
              <button 
                onClick={handleOptimize}
                disabled={loading || !title || !description}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Zap className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'Analyzing with Guardian AI...' : 'Optimize Visibility'}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-orange-400">Optimized Title</label>
                    <button 
                      onClick={() => { setTitle(result.optimized_title); setResult(null); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Edit Original
                    </button>
                  </div>
                  <p className="text-xl font-bold text-white">{result.optimized_title}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-orange-400">Optimized Description</label>
                  <p className="text-white/60 text-sm leading-relaxed">{result.optimized_description}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Try Again
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all"
                >
                  Apply Changes
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProfileScreen = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);

  const statsData = [
    { name: 'Mon', views: 4000, sales: 2400 },
    { name: 'Tue', views: 3000, sales: 1398 },
    { name: 'Wed', views: 2000, sales: 9800 },
    { name: 'Thu', views: 2780, sales: 3908 },
    { name: 'Fri', views: 1890, sales: 4800 },
    { name: 'Sat', views: 2390, sales: 3800 },
    { name: 'Sun', views: 3490, sales: 4300 },
  ];

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await geminiService.generateGrowthInsights(statsData);
      setInsights(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto space-y-12">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[40px] bg-white/5 border border-white/10">
        <div className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1">
          <img src="https://picsum.photos/seed/alex/200" className="w-full h-full rounded-full object-cover" alt="Profile" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tighter">Alex Surge</h2>
            <p className="text-emerald-400 font-bold tracking-widest uppercase text-sm">@alex_surge • Pro Creator</p>
          </div>
          <p className="text-white/60 max-w-xl">
            Building the future of social commerce. Digital artist and brand strategist. 
            Helping creators scale their digital empires.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">124K</p>
              <p className="text-white/40 text-xs uppercase tracking-widest">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">42</p>
              <p className="text-white/40 text-xs uppercase tracking-widest">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">$42.5K</p>
              <p className="text-white/40 text-xs uppercase tracking-widest">Revenue</p>
            </div>
          </div>
        </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all">
              Edit Profile
            </button>
            <button 
              onClick={() => setShowOptimizer(true)}
              className="px-8 py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold rounded-full hover:bg-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Optimize Listing
            </button>
            <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all">
              Creator Studio
            </button>
          </div>
        </section>

        {showOptimizer && <ListingOptimizer onClose={() => setShowOptimizer(false)} />}

      {/* Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              Growth Analytics
            </h3>
            <select className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-orange-400" />
              Guardian AI
            </h3>
            <button 
              onClick={generateInsights}
              disabled={loadingInsights}
              className="p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all disabled:opacity-50"
            >
              <Zap className={cn("w-5 h-5", loadingInsights && "animate-pulse")} />
            </button>
          </div>
          
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2"
                >
                  <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">{insight.impact}</p>
                  <h5 className="text-white font-bold">{insight.title}</h5>
                  <p className="text-white/40 text-xs leading-relaxed">{insight.insight}</p>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/40 text-sm">Click the zap icon to generate AI growth insights based on your recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const SpacesScreen = () => {
  const [spaces, setSpaces] = useState<AudioSpace[]>([]);

  useEffect(() => {
    fetch('/api/spaces').then(res => res.json()).then(setSpaces);
  }, []);

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto space-y-12">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white tracking-tighter">Live Spaces</h2>
          <p className="text-white/40">Join real-time audio conversations with your favorite creators.</p>
        </div>
        <button className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full flex items-center gap-2">
          <Plus className="w-5 h-5" /> Start a Space
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {spaces.length > 0 ? spaces.map((space) => (
          <div key={space.id} className="p-8 rounded-[40px] bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Now
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i}/100`} className="w-8 h-8 rounded-full border-2 border-black" />
                ))}
                <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
                  +42
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{space.title}</h3>
            <p className="text-white/40 text-sm mb-8">Hosted by <span className="text-white font-medium">@{space.handle}</span></p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-white font-bold">1.2K</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Listening</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white font-bold">12</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Speakers</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-emerald-400 transition-all">
                Join Room
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <Radio className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/40">No live spaces right now. Why not start one?</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

const AdminScreen = () => {
  const [analytics, setAnalytics] = useState<Analytic[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'settings' | 'membership'>('analytics');

  useEffect(() => {
    fetch('/api/analytics').then(res => res.json()).then(setAnalytics);
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/membership/tiers').then(res => res.json()).then(setTiers);
  }, []);

  const stats = [
    { label: 'Total Signups', value: analytics.find(a => a.metric_name === 'signups')?.metric_value || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Content Views', value: analytics.find(a => a.metric_name === 'views')?.metric_value || 0, icon: Eye, color: 'text-purple-400' },
    { label: 'Monthly Revenue', value: `$${analytics.find(a => a.metric_name === 'mrr')?.metric_value || 0}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Open Tickets', value: analytics.find(a => a.metric_name === 'tickets')?.metric_value || 0, icon: Activity, color: 'text-orange-400' },
  ];

  return (
    <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white tracking-tighter">Platform Control</h2>
          <p className="text-white/40">Manage analytics, membership logic, and system configurations.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'membership', label: 'Membership', icon: Layers },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                activeSubTab === tab.id ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(stat => (
                <div key={stat.label} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{stat.label}</p>
                    <h4 className="text-3xl font-bold text-white">{stat.value}</h4>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-xl font-bold text-white">User Retention</h3>
                <div className="h-64 w-full bg-white/5 rounded-3xl flex items-center justify-center">
                  <p className="text-white/20 text-sm italic">Retention cohort visualization coming soon...</p>
                </div>
              </div>
              <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-xl font-bold text-white">Revenue Growth</h3>
                <div className="h-64 w-full bg-white/5 rounded-3xl flex items-center justify-center">
                  <p className="text-white/20 text-sm italic">Revenue trend visualization coming soon...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'membership' && (
          <motion.div 
            key="membership"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {tiers.map(tier => (
              <div key={tier.id} className="p-8 rounded-[40px] bg-white/5 border border-white/10 flex flex-col h-full">
                <div className="mb-8">
                  <h4 className="text-2xl font-bold text-white mb-2">{tier.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${tier.monthly_price}</span>
                    <span className="text-white/40 text-xs">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-1 mb-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10">
                  Manage Tier
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeSubTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {['general', 'ai', 'notifications'].map(cat => (
              <div key={cat} className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
                <h3 className="text-xl font-bold text-white capitalize">{cat} Settings</h3>
                <div className="space-y-6">
                  {settings.filter(s => s.category === cat).map(s => (
                    <div key={s.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-widest">{s.key.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-white/40">Platform-wide configuration</p>
                      </div>
                      {s.value === 'true' || s.value === 'false' ? (
                        <button 
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            s.value === 'true' ? "bg-emerald-500" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                            s.value === 'true' ? "right-1" : "left-1"
                          )} />
                        </button>
                      ) : (
                        <input 
                          type="text" 
                          defaultValue={s.value}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'reels': return <ReelsScreen />;
      case 'marketplace': return <MarketplaceScreen />;
      case 'map': return <MapScreen />;
      case 'spaces': return <SpacesScreen />;
      case 'profile': return <ProfileScreen />;
      case 'admin': return <AdminScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pb-20 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
