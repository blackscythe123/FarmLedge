import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, Search, Package, ArrowRight, Leaf, ShieldCheck, Clock, 
  QrCode, User, Tractor, Store, ShoppingCart, Target, Sprout, 
  FileText, CloudRain, Warehouse, Megaphone, Calendar, ExternalLink,
  Users, Building2, TrendingUp, AlertTriangle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.jpg";
import hero4 from "@/assets/hero4.jpg";
import cmPhoto from "@/assets/cm_photo.png";
import ministerPhoto from "@/assets/minister_photo.png";
import { useToast } from "@/components/ui/use-toast";

const HERO_IMAGES = [hero1, hero2, hero3, hero4];

const CROP_IMAGES: Record<string, string> = {
  "banana": "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=2070&auto=format&fit=crop",
  "rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop",
  "wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2070&auto=format&fit=crop",
  "vegetables": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2070&auto=format&fit=crop",
};

const getCropImage = (cropType: string | undefined) => {
  const type = (cropType || "").toLowerCase();
  // Simple fallback logic
  if (type.includes("banana")) return CROP_IMAGES["banana"];
  if (type.includes("rice") || type.includes("paddy")) return CROP_IMAGES["rice"];
  if (type.includes("wheat")) return CROP_IMAGES["wheat"];
  return CROP_IMAGES[type] || "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2070&auto=format&fit=crop";
};

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  
  // Reuse existing state logic
  const [batchId, setBatchId] = useState("");
  const [search, setSearch] = useState("");
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Ticker content
  const newsItems = [
    "KALIA Scheme installment released for 50 Lakh farmers.",
    "New Minimum Support Price (MSP) announced for Paddy 2024-25.",
    "Farmer Registration mandatory for selling paddy in Mandis.",
    "Weather Alert: Heavy rainfall expected in coastal districts."
  ];

  const handleSearch = () => {
    if (!search.trim()) return;
    if (/^\d+$/.test(search.trim())) {
      navigate(`/batch?id=${search.trim()}`);
    } else {
      document.getElementById('recent-batches')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Logic (Simplified for this view)
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        // Mock fetch if API is not actually running in this context, or real fetch
        const res = await fetch(`/api/batches?limit=6`);
        const data = await res.json();
        setAllBatches(data.batches || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <Navigation />
      
      <main>
        {/* Scrolling Ticker */}
        <div className="bg-[#fefce8] border-b border-yellow-200 py-2 overflow-hidden flex items-center">
           <div className="bg-[#b91c1c] text-white px-4 py-1 text-xs font-bold uppercase tracking-wider mx-4 shrink-0 rounded-sm">
             What's New
           </div>
           <div className="whitespace-nowrap overflow-hidden w-full">
             <div className="animate-marquee inline-block">
               {newsItems.map((item, i) => (
                 <span key={i} className="mx-8 text-sm font-medium text-red-800">• {item}</span>
               ))}
               {/* Duplicate for seamless loop */}
               {newsItems.map((item, i) => (
                 <span key={`dup-${i}`} className="mx-8 text-sm font-medium text-red-800">• {item}</span>
               ))}
             </div>
           </div>
        </div>

        {/* Hero Section - 2 Columns */}
        <div className="container mx-auto px-4 py-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Slider */}
              <div className="lg:col-span-8 relative rounded-none overflow-hidden border-4 border-white shadow-lg h-[400px]">
                 {HERO_IMAGES.map((img, index) => (
                   <div 
                     key={index}
                     className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                   >
                     <img src={img} alt="Farm" className="w-full h-full object-cover" />
                     <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-6 text-white backdrop-blur-sm">
                        <h2 className="text-2xl font-bold mb-1">Empowering Farmers, Enriching Odisha</h2>
                        <p className="text-sm opacity-90">Building a sustainable and verified agricultural ecosystem through technology.</p>
                     </div>
                   </div>
                 ))}
                 
                 {/* Slider Controls */}
                 <div className="absolute right-4 bottom-4 flex gap-2">
                    {HERO_IMAGES.map((_, idx) => (
                       <button 
                         key={idx}
                         onClick={() => setCurrentImageIndex(idx)}
                         className={`w-3 h-3 rounded-full ${idx === currentImageIndex ? 'bg-yellow-400' : 'bg-white/50'}`}
                       />
                    ))}
                 </div>
              </div>

              {/* Right - Ministers / Important Info */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                 <Card className="rounded-none border-t-4 border-t-[#ce4242] shadow-md flex-1 bg-[#fffbfb]">
                    <div className="p-4 flex flex-col items-center text-center h-full justify-center">
                       <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 border-2 border-gray-300 overflow-hidden shadow-sm">
                          <img src={cmPhoto} alt="CM" className="w-full h-full object-cover object-top scale-100" onError={(e) => e.currentTarget.src='https://via.placeholder.com/100?text=CM'} />
                       </div>
                       <h3 className="font-bold text-gray-900 border-b pb-1 mb-1 border-gray-200 w-full">Shri Mohan Charan Majhi</h3>
                       <p className="text-xs text-gray-500 uppercase">Honourable Chief Minister</p>
                    </div>
                 </Card>
                 <Card className="rounded-none border-t-4 border-t-[#047857] shadow-md flex-1 bg-[#f0fdf4]">
                     <div className="p-4 flex flex-col items-center text-center h-full justify-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 border-2 border-gray-300 overflow-hidden shadow-sm">
                           <img src={ministerPhoto} alt="Minister" className="w-full h-full object-cover object-top scale-100" onError={(e) => e.currentTarget.src='https://via.placeholder.com/100?text=Minister'} />
                        </div>
                        <h3 className="font-bold text-gray-900 border-b pb-1 mb-1 border-gray-200 w-full">Shri K. V. Singh Deo</h3>
                        <p className="text-xs text-gray-500 uppercase">Honourable Minister, Agriculture</p>
                     </div>
                  </Card>
              </div>
           </div>
        </div>

        {/* Quick Services Grid */}
        <section className="bg-gray-50 py-10 border-t border-gray-200">
           <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-[#064e3b] mb-6 flex items-center gap-2 border-l-4 border-[#fbbf24] pl-3">
                 Online Services
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 {[
                   { icon: User, label: "Farmer Registration", color: "bg-blue-600", href: "/join" },
                   { icon: Search, label: "Track Application", color: "bg-emerald-600", href: "/status" },
                   { icon: Sprout, label: "Seed Licensing", color: "bg-green-600", href: "#" },
                   { icon: Tractor, label: "Farm Mechanization", color: "bg-orange-600", href: "#" },
                   { icon: CloudRain, label: "Weather Alerts", color: "bg-red-600", href: "/weather-alerts" },
                   { icon: Target, label: "Market Prices", color: "bg-purple-600", href: "/price-prediction" },
                 ].map((service, idx) => (
                   <Link key={idx} to={service.href} className="group">
                     <Card className="h-full hover:shadow-lg transition-all border-0 shadow-sm overflow-hidden">
                        <div className={`${service.color} h-1.5 w-full`} />
                        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                           <div className={`p-3 rounded-full ${service.color} bg-opacity-10 text-white group-hover:scale-110 transition-transform shadow-sm`}>
                              <service.icon className={`w-8 h-8 ${service.color.replace('bg-', 'text-')}`} />
                           </div>
                           <p className="text-sm font-semibold text-gray-700 leading-tight">{service.label}</p>
                        </CardContent>
                     </Card>
                   </Link>
                 ))}
              </div>
           </div>
        </section>

        {/* Main Functional Area (Track Batch) embedded as a Service Panel */}
        <section className="py-12 bg-white">
           <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12">
                 
                 {/* Batches / Tracking */}
                 <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a] mb-4 border-b-2 border-gray-100 pb-2">
                       <Search className="w-5 h-5 inline mr-2 text-emerald-600" />
                       Track Shipment / Batch
                    </h2>
                    <div className="bg-[#f0fdf4] p-6 rounded-lg border border-emerald-100">
                       <p className="text-sm text-gray-600 mb-4">Enter your Batch ID or verify the QR code on your produce to trace its journey from farm to fork.</p>
                       <div className="flex gap-2">
                          <Input 
                            placeholder="Enter Batch ID (e.g. 101)" 
                            className="bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)} 
                          />
                          <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSearch}>
                             Track
                          </Button>
                       </div>
                       <div className="mt-4 flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-600" /> 100% Immutable</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-orange-600" /> Real-time Updates</span>
                       </div>
                    </div>

                    <div className="mt-6">
                       <h3 className="font-bold text-sm text-gray-700 mb-3">Recent Verified Batches</h3>
                       <div className="space-y-3">
                          {loading ? (
                             <Skeleton className="h-12 w-full" /> 
                          ) : (
                             allBatches.slice(0, 3).map((b, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/batch?id=${b.id}`)}>
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                         <img src={getCropImage(b.cropType)} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                         <p className="font-bold text-sm text-gray-800 uppercase">{b.cropType}</p>
                                         <p className="text-xs text-gray-500">ID: #{b.id}</p>
                                      </div>
                                   </div>
                                   <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">Verified</Badge>
                                </div>
                             ))
                          )}
                       </div>
                       <Button variant="link" className="text-emerald-700 p-0 h-auto mt-2 text-sm" onClick={() => document.getElementById('recent-batches')?.scrollIntoView()}>
                          View All Shipments &rarr;
                       </Button>
                    </div>
                 </div>

                 {/* Notices and Updates Tab */}
                 <div>
                    <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 pb-2">
                       <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-red-600" />
                          Notifications
                       </h2>
                       <Link to="/notifications" className="text-xs text-blue-600 hover:underline">View Archive</Link>
                    </div>
                    
                    <div className="space-y-0 border border-gray-200 rounded-md overflow-hidden">
                       {[
                         { date: "09 Dec", text: "Guidelines for procurement of Kharif Paddy 2024-25" },
                         { date: "08 Dec", text: "List of beneficiaries under KALIA Scheme updated" },
                         { date: "05 Dec", text: "Tender for supply of agricultural implements" },
                         { date: "01 Dec", text: "Advisory for cotton farmers regarding pest control" },
                         { date: "28 Nov", text: "Training schedule for district officers" },
                       ].map((notice, i) => (
                          <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 group cursor-pointer transition-colors">
                             <div className="bg-red-50 text-red-800 px-2 py-1 rounded text-center min-w-[60px] h-fit">
                                <p className="text-xs font-bold">{notice.date.split(' ')[1]}</p>
                                <p className="text-lg font-bold leading-none">{notice.date.split(' ')[0]}</p>
                             </div>
                             <p className="text-sm font-medium text-gray-700 group-hover:text-red-700 group-hover:underline">
                                {notice.text} 
                                <span className="ml-2 inline-block">
                                   <img src="https://agri.odisha.gov.in/sites/all/themes/agri/images/new.gif" alt="new" className={`h-4 ${i > 1 ? 'hidden' : ''}`} />
                                </span>
                             </p>
                          </div>
                       ))}
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* Govt Schemes Carousel */}
        <section className="bg-[#f8fafc] py-12 border-t border-gray-200">
           <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
                 Major Schemes
                 <span className="block h-1 w-20 bg-yellow-400 mx-auto mt-2 rounded"></span>
              </h2>
              
              <div className="grid md:grid-cols-4 gap-6">
                 {[
                    { title: "KALIA", desc: "Krushak Assistance for Livelihood and Income Augmentation", color: "bg-green-700" },
                    { title: "Balaram", desc: "Credit facility to landless farmers", color: "bg-blue-700" },
                    { title: "Millet Mission", desc: "Reviving millets in farms and on plates", color: "bg-orange-700" },
                    { title: "Farm Mechanization", desc: "Subsidy on purchase of agricultural implements", color: "bg-red-700" },
                 ].map((scheme, i) => (
                    <div key={i} className="bg-white rounded shadow hover:shadow-xl transition-shadow overflow-hidden group">
                       <div className={`h-32 ${scheme.color} flex items-center justify-center p-4`}>
                          <h3 className="text-white text-2xl font-black opacity-90 group-hover:scale-110 transition-transform">{scheme.title}</h3>
                       </div>
                       <div className="p-4">
                          <p className="text-sm text-gray-600 mb-4 h-10">{scheme.desc}</p>
                          <Button variant="outline" size="sm" className="w-full hover:bg-gray-100 border-gray-300">
                             Read More
                          </Button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Footer Statistics Banner */}
        <section className="bg-[#1e1b4b] text-white py-12">
            <div className="container mx-auto px-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-indigo-900/50">
                  <div>
                     <p className="text-4xl font-black text-yellow-400 mb-2">30+</p>
                     <p className="text-sm uppercase tracking-widest text-indigo-200">Districts</p>
                  </div>
                  <div>
                     <p className="text-4xl font-black text-yellow-400 mb-2">{loading ? "..." : allBatches.length + 500}</p>
                     <p className="text-sm uppercase tracking-widest text-indigo-200">Verified Batches</p>
                  </div>
                  <div>
                     <p className="text-4xl font-black text-yellow-400 mb-2">45 Lakh</p>
                     <p className="text-sm uppercase tracking-widest text-indigo-200">Farmers Benefited</p>
                  </div>
                  <div>
                     <p className="text-4xl font-black text-yellow-400 mb-2">100%</p>
                     <p className="text-sm uppercase tracking-widest text-indigo-200">Transparency</p>
                  </div>
               </div>
            </div>
        </section>
      </main>

      <Footer />
      
      {/* Styles for Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
