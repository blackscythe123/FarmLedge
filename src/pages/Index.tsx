import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronRight, Search, Package, ArrowRight, Leaf, ShieldCheck, Clock, QrCode, Copy, Link as LinkIcon, Download, Tractor, Store, ShoppingCart, User, Sprout, Target, Beaker, CloudRain, FileText, TrendingUp, Warehouse, Thermometer, Shield, Check, Cloud, Building2, Mic } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.jpg";
import hero4 from "@/assets/hero4.jpg";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

const HERO_IMAGES = [hero1, hero2, hero3, hero4];

const CROP_IMAGES: Record<string, string> = {
  "banana": "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=2070&auto=format&fit=crop",
  "banana - green": "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=2070&auto=format&fit=crop",
  "onion-bhima shweta": "https://icar.org.in/sites/default/files/inline-images/Bhima-Shweta.jpg",
  "bitter gourd": "https://images.unsplash.com/photo-1628773822503-93038c063306?q=80&w=2070&auto=format&fit=crop",
  "brinjal": "https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?q=80&w=2070&auto=format&fit=crop",
  "cabbage": "https://images.unsplash.com/photo-1591586007768-40725cc562a1?q=80&w=2110&auto=format&fit=crop",

  "onion-bhima super": "https://icar.org.in/sites/default/files/inline-images/Bhima-Super.jpg",
  "carrot": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=1887&auto=format&fit=crop",
  "cashewnuts": "https://images.unsplash.com/photo-1686721635333-d71af2f1084b?q=80&w=1074&auto=format&fit=crop",
  "cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?q=80&w=2070&auto=format&fit=crop",
  "chili red": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=2070&auto=format&fit=crop",
  "coconut": "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?q=80&w=2070&auto=format&fit=crop",
  "dry chillies": "https://images.unsplash.com/photo-1601648764658-ad3793bc91a9?q=80&w=2070&auto=format&fit=crop",
  "fish": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop",
  "garlic": "https://images.unsplash.com/photo-1615485500704-8e99099928b3?q=80&w=2070&auto=format&fit=crop",
  "green chilli": "https://images.unsplash.com/photo-1601648764658-ad3793bc91a9?q=80&w=2070&auto=format&fit=crop",
  "ground nut seed": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=2071&auto=format&fit=crop",
  "groundnut": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=2071&auto=format&fit=crop",
  "hen": "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1974&auto=format&fit=crop",
  "jack fruit": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=2070&auto=format&fit=crop",
  "jute": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?q=80&w=2070&auto=format&fit=crop",
  "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=2070&auto=format&fit=crop",
  "mustard": "https://images.unsplash.com/photo-1508595165502-3e2652e5a405?q=80&w=2070&auto=format&fit=crop",
  "onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=2070&auto=format&fit=crop",
  "ox": "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=2070&auto=format&fit=crop",
  "papaya": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?q=80&w=2070&auto=format&fit=crop",
  "peas cod": "https://images.unsplash.com/photo-1592323360831-5f1f68947868?q=80&w=2070&auto=format&fit=crop",
  "potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2070&auto=format&fit=crop",
  "pumpkin": "https://images.unsplash.com/photo-1570586437263-160f0d1e813d?q=80&w=2070&auto=format&fit=crop",
  "raddish": "https://images.unsplash.com/photo-1593157923663-27248b238446?q=80&w=2070&auto=format&fit=crop",
  "rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop",
  "tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2070&auto=format&fit=crop",
  "water melon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=2070&auto=format&fit=crop",
  "wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2070&auto=format&fit=crop",
  "corn": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2070&auto=format&fit=crop",
  "maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2070&auto=format&fit=crop",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=2074&auto=format&fit=crop"
};

const getCropImage = (cropType: string | undefined) => {
  const type = (cropType || "").toLowerCase();
  return CROP_IMAGES[type] || "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2070&auto=format&fit=crop";
};

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [batchId, setBatchId] = useState("");
  const qrWrapRef = useRef<HTMLDivElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Delay loading of secondary images to prioritize LCP
    const t = setTimeout(() => setImagesLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Build destination using env-based site URL, fallback to current origin
  const SITE_URL = (import.meta.env.VITE_SITE_URL as string) ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const BASE_URL = `${SITE_URL.replace(/\/$/, "")}/batch?id=`;
  // Sanitize id (digits only) but keep user's input for display
  const sanitizedId = useMemo(() => batchId.replace(/\D/g, ""), [batchId]);
  const hasInput = batchId.trim().length > 0;
  const isValid = sanitizedId.length > 0;
  const targetUrl = isValid ? `${BASE_URL}${encodeURIComponent(sanitizedId)}` : "";

  const handleCopyUrl = async () => {
    try {
      if (!isValid) return;
      await navigator.clipboard.writeText(targetUrl);
      toast({ title: "Link copied", description: targetUrl, duration: 1800 });
    } catch {
      // no-op
    }
  };

  const handleDownload = () => {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `batch-${sanitizedId || "qr"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleShare = async () => {
    try {
      if (!isValid || typeof navigator === "undefined" || !navigator.share) return;
      await navigator.share({ title: "AgriTruthChain Batch", text: `Batch #${sanitizedId}`, url: targetUrl });
    } catch {
      // user might cancel share; ignore
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  type Batch = {
    id: number | string;
    cropType?: string;
    quantityKg?: number | string;
    basePriceINR?: number | string;
    minPriceINR?: number | string;
    priceByDistributorINR?: number | string;
    priceByRetailerINR?: number | string;
    farmer?: string;
    distributor?: string;
    retailer?: string;
    consumer?: string;
    currentOwner?: string;
    harvestDate?: number | string;
    expiryDate?: number | string;
    createdAt?: number | string;
    metadataCID?: string;
    boughtByDistributorAt?: number | string;
    boughtByRetailerAt?: number | string;
    boughtByConsumerAt?: number | string;
    verification?: { status: 'unverified' | 'pending' | 'verified'; by?: string | null; timestamp?: number | null };
  };

  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Batch | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalBatches, setTotalBatches] = useState(0);
  const [pagesCache, setPagesCache] = useState<Record<number, Batch[]>>({});

  useEffect(() => {
    const fetchBatches = async () => {
      if (pagesCache[page]) {
        setAllBatches(pagesCache[page]);
        return;
      }

      try {
        setLoading(true); setError(null);
        const res = await fetch(`/api/batches?limit=6&page=${page}`);
        const data = await res.json();
        const batches = Array.isArray(data?.batches) ? data.batches : [];
        setAllBatches(batches);
        setTotalBatches(data?.total || 0);
        setPagesCache(prev => ({ ...prev, [page]: batches }));
      } catch (e: any) {
        setError(e?.message || "Failed to load batches");
      } finally { setLoading(false); }
    };
    fetchBatches();
  }, [page]);

  // Backend now handles sorting and pagination
  const recentBatches = allBatches;

  const handleSearch = () => {
    if (!search.trim()) return;
    // If numeric, assume ID and go to details
    if (/^\d+$/.test(search.trim())) {
      navigate(`/batch?id=${search.trim()}`);
    } else {
      // Otherwise just filter the list (not implemented in this view, maybe redirect to a search page)
      // For now, let's just scroll to list
      document.getElementById('recent-batches')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ownerRoleKey = (b: Batch) => {
    const owner = (b.currentOwner || "").toLowerCase();
    if (!owner) return "unknown" as const;
    if (owner === (b.consumer || "").toLowerCase()) return "consumer" as const;
    if (owner === (b.retailer || "").toLowerCase()) return "retailer" as const;
    if (owner === (b.distributor || "").toLowerCase()) return "distributor" as const;
    if (owner === (b.farmer || "").toLowerCase()) return "farmer" as const;
    return "holder" as const;
  };

  const getProgress = (b: Batch) => {
    const role = ownerRoleKey(b);
    if (role === 'consumer') return 100;
    if (role === 'retailer') return 75;
    if (role === 'distributor') return 50;
    return 25;
  };

  const openDetails = (b: Batch) => { setSelected(b); setOpen(true); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 font-sans text-slate-600">
      <Navigation />
      
      <main>
        {/* Hero Section - Professional Government Style */}
        <section className="relative pt-24 pb-16 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 overflow-hidden">
          {/* Elegant Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Official Government Header */}
              <div className="flex items-start gap-8 mb-10">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full shadow-2xl ring-4 ring-white/20 overflow-hidden">
                    <img 
                      src="/src/assets/odisha-logo.jpg" 
                      alt="Odisha Government Emblem" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 mb-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-5 py-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-white font-medium text-sm tracking-wide">{t('hero.badge')}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-none tracking-tight">
                    Department of Agriculture 
                  </h1>
                  <div className="flex items-center gap-3 text-emerald-100">
                    <div className="h-px w-12 bg-emerald-300" />
                    <p className="text-lg md:text-xl font-semibold">
                      {t('hero.badge')}
                    </p>
                  </div>
                  <p className="text-emerald-200/90 text-base mt-2 font-medium">
                    {t('hero.titleSpan')}
                  </p>
                </div>
              </div>

              {/* Main Content Card */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border-2 border-white/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
                        {t('hero.titleMain')}
                      </h2>
                      <p className="text-xl md:text-2xl text-emerald-700 font-bold mb-4">
                        {t('hero.titleSpan')}
                      </p>
                    </div>
                    <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-semibold">
                      <Clock className="w-4 h-4 mr-2" />
                      Live Tracking
                    </Badge>
                  </div>
                  <p className="text-base text-gray-700 mb-8 max-w-3xl leading-relaxed">
                    {t('hero.description')}
                  </p>

                {/* Search Box */}
                <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-3 shadow-2xl max-w-2xl">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('index.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBatchId(search);
                        setQrOpen(true);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      {t('index.searchPlaceholder').includes('QR') ? 'Generate QR' : 'Generate QR'}
                    </Button>
                    <Button 
                      onClick={handleSearch}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                      size="lg"
                    >
                      {t('index.trackButton')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
                </div>
              </div>

              {/* Professional Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 p-6 hover:shadow-xl transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-bold">{t('stats.verified')}</Badge>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-green-700">100%</p>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">{t('stats.blockchainVerified')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 p-6 hover:shadow-xl transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Package className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-bold">{t('stats.live')}</Badge>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-blue-700">{totalBatches}</p>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">{t('stats.totalBatches')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 p-6 hover:shadow-xl transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Tractor className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs font-bold">{t('stats.active')}</Badge>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-orange-700">500+</p>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">{t('stats.farmersRegistered')}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 p-6 hover:shadow-xl transition-all group">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Leaf className="h-7 w-7 text-white" />
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-bold">{t('stats.eco')}</Badge>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-emerald-700">Green</p>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">{t('stats.sustainable')}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Government Style */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-600 text-white">
                {t('howItWorks.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('howItWorks.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="text-center p-6 border-2 hover:border-green-500 transition-all hover:shadow-xl">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tractor className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{t('howItWorks.step1Title')}</h3>
                <p className="text-sm text-gray-600">{t('howItWorks.step1Desc')}</p>
              </Card>

              <Card className="text-center p-6 border-2 hover:border-blue-500 transition-all hover:shadow-xl">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{t('howItWorks.step2Title')}</h3>
                <p className="text-sm text-gray-600">{t('howItWorks.step2Desc')}</p>
              </Card>

              <Card className="text-center p-6 border-2 hover:border-purple-500 transition-all hover:shadow-xl">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{t('howItWorks.step3Title')}</h3>
                <p className="text-sm text-gray-600">{t('howItWorks.step3Desc')}</p>
              </Card>

              <Card className="text-center p-6 border-2 hover:border-orange-500 transition-all hover:shadow-xl">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{t('howItWorks.step4Title')}</h3>
                <p className="text-sm text-gray-600">{t('howItWorks.step4Desc')}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Crop Price Prediction Section */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-900 mb-3 flex items-center justify-center gap-2">
                  <Sprout className="w-8 h-8 text-emerald-600" />
                  {t('cropPrediction.title')}
                </h2>
                <p className="text-slate-600 text-lg">{t('cropPrediction.subtitle')}</p>
              </div>

              <Card className="border-emerald-200 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <Link to="/price-prediction" className="block">
                    <Button 
                      size="lg" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      {t('cropPrediction.selectParameters')}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700">30+</div>
                      <div className="text-sm text-slate-600">{t('cropPrediction.selectDistrict') || 'Districts Covered'}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700">8</div>
                      <div className="text-sm text-slate-600">{t('cropPrediction.soilType') || 'Soil Types'}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700">93%</div>
                      <div className="text-sm text-slate-600">{t('cropPrediction.highAccuracy') || 'Accuracy'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Batches - Grid Layout */}
        <section id="recent-batches" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">{t('index.recentShipments')}</h2>
                <p className="text-slate-500">{t('index.liveUpdates')}</p>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden border-slate-100 shadow-sm">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentBatches.map((b) => (
                  <Card 
                    key={String(b.id)} 
                    className="group relative bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => openDetails(b)}
                  >
                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={getCropImage(b.cropType)} 
                        alt={b.cropType}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      
                      {/* Badges */}
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/50 backdrop-blur-md text-white border-none font-mono">
                          #{String(b.id)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        {b?.verification?.status === 'verified' ? (
                          <Badge className="bg-emerald-500 text-white border-none flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {t('index.verified')}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-400 text-amber-900 border-none flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t('index.pending')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-serif font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                            {b.cropType || t('index.unknownCrop')}
                          </h3>
                          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Owner: <span className="font-medium text-slate-700 capitalize">{t(`index.${ownerRoleKey(b)}`)}</span>
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          {b.quantityKg || 0} kg
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                          <span>FARMER</span>
                          <span>CONSUMER</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${getProgress(b)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalBatches > 6 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                >
                  {t('index.prev')}
                </Button>
                
                {Array.from({ length: Math.ceil(totalBatches / 6) }).map((_, i) => {
                   const p = i + 1;
                   const totalPages = Math.ceil(totalBatches / 6);
                   // Show first, last, and current +/- 1
                   if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                     return (
                        <Button
                            key={p}
                            variant={page === p ? "default" : "outline"}
                            className={page === p ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </Button>
                     );
                   }
                   if (p === page - 2 || p === page + 2) {
                       return <span key={p} className="text-slate-400">...</span>
                   }
                   return null;
                })}

                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 6 >= totalBatches}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                >
                  {t('index.next')}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-600 text-white">
                {t('solutions.badge')}
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t('solutions.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('solutions.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {/* Blockchain Tracking */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-600 rounded-full text-white">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('solutions.blockchainTracking')}</h3>
                      <Badge className="bg-blue-500 text-white">{t('solutions.blockchainTrackingBadge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.supplyChainTransparency')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.qrCodeGeneration')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.immutableBlockchainRecords')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.priceTransparency')}</span>
                    </li>
                  </ul>
                  <Link to="/batch?id=1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      {t('solutions.trackProduce')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Weather Alerts */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:border-cyan-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-cyan-600 rounded-full text-white">
                      <CloudRain className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('solutions.weatherAlerts')}</h3>
                      <Badge className="bg-cyan-500 text-white">{t('solutions.weatherAlertsBadge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.sevenDayWeatherForecasts')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.multiChannelAlerts')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.irrigationAdvisories')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.pestOutbreakAlerts')}</span>
                    </li>
                  </ul>
                  <Link to="/weather-alerts">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      {t('solutions.viewWeather')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Government Schemes */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 hover:border-indigo-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-indigo-600 rounded-full text-white">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('solutions.governmentSchemes')}</h3>
                      <Badge className="bg-indigo-500 text-white">{t('solutions.governmentSchemesBadge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.pmKisanPmfbyKcc')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.expiryAlerts')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.directPortalLinks')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.eligibilityChecks')}</span>
                    </li>
                  </ul>
                  <Link to="/gov-schemes">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      {t('solutions.exploreSchemes')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Storage Services */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-orange-600 rounded-full text-white">
                      <Warehouse className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('solutions.storageServices')}</h3>
                      <Badge className="bg-orange-500 text-white">{t('solutions.storageServicesBadge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.warehousesColdStorage')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.alternateCropUses')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.csiCftriGuidelines')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.kvikTestingLabs')}</span>
                    </li>
                  </ul>
                  <Link to="/storage-services">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      {t('solutions.findStorage')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Price Prediction */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:border-emerald-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-emerald-600 rounded-full text-white">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('solutions.pricePrediction')}</h3>
                      <Badge className="bg-emerald-500 text-white">{t('solutions.pricePredictionBadge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.mlBasedPriceForecasting')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.soilTypeAnalysis')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.districtSpecificData')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.accuracyRate')}</span>
                    </li>
                  </ul>
                  <Link to="/price-prediction">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      {t('solutions.predictPrices')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Location Services */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-600 rounded-full text-white">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('solutions.locationServices')}</h3>
                      <Badge className="bg-purple-500 text-white">{t('solutions.locationServicesBadge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.findNearbyKvks')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.testingLaboratories')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.agriculturalCenters')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>{t('solutions.interactiveMaps')}</span>
                    </li>
                  </ul>
                  <Link to="/location-services">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      {t('solutions.exploreLocations')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Voice Bot Assistant */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 hover:border-teal-500">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-teal-600 rounded-full text-white">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('voiceBot.title')}</h3>
                      <Badge className="bg-teal-500 text-white">{t('voiceBot.badge')}</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span>{t('voiceBot.features.multiLanguage')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span>{t('voiceBot.features.realtimeVoice')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span>{t('voiceBot.features.cropGuidance')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span>{t('voiceBot.features.availability247')}</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={() => toast({ title: t('voiceBot.comingSoon'), description: t('voiceBot.subtitle') })}>
                    {t('voiceBot.tryVoiceBot')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Details Dialog - Kept mostly same logic but styled */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-emerald-900">{t('index.batch')} #{selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{t('index.product')}</div>
                <div className="font-medium text-slate-800 text-lg">{selected?.cropType}</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{t('index.quantity')}</div>
                <div className="font-medium text-slate-800 text-lg">{selected?.quantityKg} kg</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Harvest Date</div>
                <div className="font-medium text-slate-800 text-lg">
                  {selected?.harvestDate ? new Date(Number(selected.harvestDate) * 1000).toLocaleDateString() : '-'}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Use-By Date</div>
                <div className="font-medium text-red-600 text-lg">
                  {selected?.expiryDate ? new Date(Number(selected.expiryDate) * 1000).toLocaleDateString() : '-'}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 border-b pb-2">{t('index.priceHistory')}</h4>
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-500">{t('index.farmerPrice')}</span>
                <span className="font-mono font-medium text-amber-600">₹{selected?.minPriceINR || selected?.basePriceINR || 0}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-500">{t('index.distributorPrice')}</span>
                <span className="font-mono font-medium text-amber-600">₹{selected?.priceByDistributorINR || 0}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-500">{t('index.retailerPrice')}</span>
                <span className="font-mono font-medium text-amber-600">₹{selected?.priceByRetailerINR || 0}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link to={`/batch?id=${encodeURIComponent(String(selected?.id || ""))}`} className="w-full">
                <Button className="w-full bg-emerald-900 hover:bg-emerald-800 text-white">
                  {t('index.viewFullJourney')}
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Generator Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan or Generate Product QR</DialogTitle>
            <DialogDescription>
              QR Code for Batch #{sanitizedId || "..."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-lg bg-muted border min-h-[268px] min-w-[268px] flex items-center justify-center" ref={qrWrapRef}>
                {isValid ? (
                  <QRCodeCanvas value={targetUrl} size={220} level="M" includeMargin />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <QrCode className="w-12 h-12 mb-2" />
                    <span className="text-sm">Enter a valid batch ID to preview the QR</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground break-all text-center w-full">
                {isValid ? (
                  <a href={targetUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                    {targetUrl}
                  </a>
                ) : (
                  `${BASE_URL}<id>`
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
            <div className="flex flex-wrap gap-2 order-2 sm:order-1">
              <Button variant="outline" size="sm" onClick={handleCopyUrl} disabled={!isValid}>
                <Copy className="w-4 h-4 mr-1" /> Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!isValid}>
                <Download className="w-4 h-4 mr-1" /> Download QR
              </Button>
              <a href={isValid ? targetUrl : undefined} target="_blank" rel="noreferrer noopener">
                <Button variant="ghost" size="sm" disabled={!isValid}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Open Link
                </Button>
              </a>
              {typeof navigator !== "undefined" && (navigator as any).share ? (
                <Button variant="ghost" size="sm" onClick={handleShare} disabled={!isValid}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Share
                </Button>
              ) : null}
            </div>
            <div className="order-1 sm:order-2">
              <Button onClick={() => setQrOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
