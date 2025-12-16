import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Factory,
  Leaf,
  Link2,
  ShieldCheck,
  Store,
  Timer,
  ArrowUpRight,
  Clock,
  Recycle,
  PackageCheck,
  Flame,
  ThermometerSun,
  Truck,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Local Images
import onionImg from "@/assets/crops/onion.jpg";
import potatoImg from "@/assets/crops/potato.png";
import tomatoImg from "@/assets/crops/tomato.png";

export function ZeroLossPanel({ batchId, cropType }: { batchId: string; cropType?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["zero-loss", batchId],
    queryFn: async () => {
      const res = await fetch(`/api/batch/${encodeURIComponent(batchId)}/zero-loss`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "zero_loss_error");
      return json;
    },
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });

  const [showImage, setShowImage] = useState(false);

  if (error) return null;

  const days = data?.batch?.daysRemaining;
  const urgency = data?.batch?.urgency;
  const guide = data?.guide; // Contains handling, shelfLife, etc.
  const options = data?.options || [];
  const awareness = data?.awareness || [];
  const mnrega = data?.mnrega; // Assuming backend might return this structure based on new UI request, else we mock/adapt

  const getCropImage = (ct?: string) => {
    const key = (ct || "").trim().toLowerCase();
    if (key.includes("onion")) return onionImg;
    if (key.includes("potato")) return potatoImg;
    if (key.includes("tomato")) return tomatoImg;

    // Fallbacks
    const map: Record<string, string> = {
      rice: "https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1600&auto=format&fit=crop",
      paddy: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
      wheat: "https://images.unsplash.com/photo-1505051508008-923feaf53e44?q=80&w=1600&auto=format&fit=crop",
      maize: "https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=1600&auto=format&fit=crop",
      corn: "https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=1600&auto=format&fit=crop",
      millet: "https://images.unsplash.com/photo-1625246333195-78a8c7e3fdfe?q=80&w=1600&auto=format&fit=crop",
      vegetables: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
      fruits: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=1600&auto=format&fit=crop"
    };
    return map[key] || "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1600&auto=format&fit=crop";
  };

  const urgencyColor = () => {
    if (days == null) return "bg-slate-100 text-slate-700";
    if (days <= 0) return "bg-red-100 text-red-700";
    if (days <= 3) return "bg-red-100 text-red-700";
    if (days <= 7) return "bg-amber-100 text-amber-800";
    return "bg-emerald-100 text-emerald-800";
  };

  const cropName = cropType || "Crop";

  return (
    <div className="space-y-8 animate-fade-in">

      {/* 1. Hero / Header Card - Expanded & Richer */}
      <Card className="overflow-hidden border-0 shadow-xl rounded-2xl group bg-white">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 min-h-[400px]">

          {/* Left: Huge Immersive Image */}
          <div className="relative lg:col-span-2 h-64 md:h-full overflow-hidden cursor-pointer" onClick={() => setShowImage(true)}>
            <img
              src={getCropImage(cropType)}
              alt={cropName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />

            <div className="absolute bottom-4 left-4 p-2">
              <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-md">
                {cropType}
              </Badge>
              {days != null && (
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-lg">{days > 0 ? `${days} Days Left` : 'Expired'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Key Stats & Summary */}
          <div className="p-6 md:p-8 lg:col-span-3 flex flex-col justify-between bg-white relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    {cropName}
                  </h2>
                  <p className="text-slate-500 text-lg">Zero-Loss Handling Guide</p>
                </div>
                <Badge variant="outline" className={`${urgencyColor()} px-3 py-1 text-sm border-0 font-bold uppercase tracking-wider`}>
                  {urgency || 'Normal'} Priority
                </Badge>
              </div>

              {/* Mint Green Shelf Life Box */}
              {guide?.shelfLife && (
                <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 mb-6">
                  <h4 className="text-emerald-900 font-bold flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-emerald-600" /> Shelf Life
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-700 font-medium whitespace-nowrap">Ambient:</span>
                      <span className="text-slate-700">{guide.shelfLife.normal || "2-3 days"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-700 font-medium whitespace-nowrap">Cold Storage:</span>
                      <span className="text-slate-700">{guide.shelfLife.coldStorage || "7-10 days"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions / Recos */}
              <div className="space-y-4">
                {guide?.handling?.primary && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <PackageCheck className="w-4 h-4 text-indigo-500" /> Primary Handling
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{guide.handling.primary}</p>
                  </div>
                )}
                {guide?.handling?.secondary && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Factory className="w-4 h-4 text-orange-500" /> Processing Options
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200">
                        Pulping
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200">
                        Dehydration
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200">
                        Paste
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Data sourced from Odisha University of Agriculture & Technology
              </div>
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                <Info className="w-4 h-4 mr-2" /> Full Guide
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Detailed Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Market & Processing - Left */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
            Alternative Markets & Steps
          </h3>

          {options.map((opt: any, idx: number) => (
            <Card key={idx} className="border-0 shadow-sm ring-1 ring-slate-100 hover:ring-emerald-200 transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  {opt.option}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-slate-600">{opt.description}</p>
                {opt.markets?.length > 0 && (
                  <div className="bg-amber-50/50 p-3 rounded-lg">
                    <p className="font-semibold text-amber-800 mb-2 text-xs uppercase">Potential Buyers</p>
                    <ul className="space-y-1">
                      {opt.markets.map((m: any, i: number) => (
                        <li key={i} className="flex justify-between text-slate-700">
                          <span>• {m.type}</span>
                          <span className="font-medium">{m.priceRange}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Storage & MNREGA - Right */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-l-4 border-blue-500 pl-3">
            Storage & Livelihood Support
          </h3>

          <Card className="border-0 shadow-sm ring-1 ring-slate-100 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                <ThermometerSun className="w-5 h-5 text-blue-600" />
                Storage Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                  <span className="block text-xs font-bold text-blue-500 uppercase">Temp</span>
                  <span className="text-lg font-semibold text-slate-800">{guide?.storage?.temp || "8-12"}°C</span>
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                  <span className="block text-xs font-bold text-blue-500 uppercase">Humidity</span>
                  <span className="text-lg font-semibold text-slate-800">{guide?.storage?.humidity || "85-90"}%</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {guide?.storage?.notes || "Store in a cool, dry place away from direct sunlight. Use perforated crates for ventilation."}
              </p>
            </CardContent>
          </Card>

          {/* MNREGA / Livelihood Card */}
          <Card className="border-0 shadow-sm ring-1 ring-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
                <Recycle className="w-5 h-5 text-emerald-600" />
                MNREGA / Livelihood Potential
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm border-b border-emerald-100 pb-3">
                <span className="text-slate-600">Eligible for Processing?</span>
                <Badge className="bg-emerald-600 hover:bg-emerald-700">Yes</Badge>
              </div>
              <div className="flex items-center justify-between text-sm pb-1">
                <span className="text-slate-600">Daily Wage Support</span>
                <span className="font-bold text-emerald-800">₹250 - ₹350</span>
              </div>
              <p className="text-xs text-slate-500 italic">
                *Contact your local Gram Panchayat for processing unit setup support under MNREGA.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Image Modal */}
      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <img src={getCropImage(cropType)} alt={cropName} className="w-full h-auto rounded-xl shadow-2xl" />
        </DialogContent>
      </Dialog>

    </div>
  );
}
