import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Factory, Leaf, Link2, ShieldCheck, Store, Timer, Image as ImageIcon, ArrowUpRight, Clock, Recycle, PackageCheck, Wheat, Zap, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  if (error) return null;

  const days = data?.batch?.daysRemaining;
  const urgency = data?.batch?.urgency;
  const guide = data?.guide;
  const options = data?.options || [];
  const awareness = data?.awareness || [];
  const [showImage, setShowImage] = useState(false);

  const getCropImage = (ct?: string) => {
    const key = (ct || "").trim().toLowerCase();
    const map: Record<string, string> = {
      rice: "https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=1600&auto=format&fit=crop",
      paddy: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
      wheat: "https://images.unsplash.com/photo-1505051508008-923feaf53e44?q=80&w=1600&auto=format&fit=crop",
      maize: "https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=1600&auto=format&fit=crop",
      corn: "https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=1600&auto=format&fit=crop",
      millet: "https://images.unsplash.com/photo-1625246333195-78a8c7e3fdfe?q=80&w=1600&auto=format&fit=crop",
      pulses: "https://images.unsplash.com/photo-1604908554049-1ba7b4809e8a?q=80&w=1600&auto=format&fit=crop",
      oilseeds: "https://images.unsplash.com/photo-1563208840-05f6182dc82a?q=80&w=1600&auto=format&fit=crop",
      vegetables: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop",
      fruits: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=1600&auto=format&fit=crop",
      onion: "https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=1600&auto=format&fit=crop",
      tomato: "https://images.unsplash.com/photo-1437750769460-3014ff1f44aa?q=80&w=1600&auto=format&fit=crop",
      banana: "https://images.unsplash.com/photo-1541216970279-6c36ed0d000e?q=80&w=1600&auto=format&fit=crop",
      potato: "https://images.unsplash.com/photo-1518977676601-b53f0b141f74?q=80&w=1600&auto=format&fit=crop",
      brinjal: "https://images.unsplash.com/photo-1625730000972-8f3a2a8e11b9?q=80&w=1600&auto=format&fit=crop",
      groundnut: "https://images.unsplash.com/photo-1601004890684-d8cbf98209a2?q=80&w=1600&auto=format&fit=crop",
      cotton: "https://images.unsplash.com/photo-1535392432937-a27c36ec07c0?q=80&w=1600&auto=format&fit=crop",
      sugarcane: "https://images.unsplash.com/photo-1629572445951-8a2ed1f7632e?q=80&w=1600&auto=format&fit=crop",
    };
    return map[key] || "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1600&auto=format&fit=crop";
  };

  const urgencyLabel = () => {
    if (days == null) return "Unknown";
    if (days <= 0) return "Expired";
    if (days <= 3) return "Critical";
    if (days <= 7) return "Urgent";
    return "Normal";
  };

  const urgencyColor = () => {
    if (days == null) return "bg-slate-100 text-slate-700";
    if (days <= 0) return "bg-red-100 text-red-700";
    if (days <= 3) return "bg-red-100 text-red-700";
    if (days <= 7) return "bg-amber-100 text-amber-800";
    return "bg-emerald-100 text-emerald-800";
  };

  const tagIcon = (tag?: string) => {
    const key = (tag || '').toLowerCase();
    if (key.includes('process')) return <Factory className="w-3.5 h-3.5 text-blue-600" />;
    if (key.includes('market') || key.includes('sell')) return <Store className="w-3.5 h-3.5 text-amber-600" />;
    if (key.includes('dry') || key.includes('dehydrate')) return <Flame className="w-3.5 h-3.5 text-red-600" />;
    if (key.includes('pack') || key.includes('grade')) return <PackageCheck className="w-3.5 h-3.5 text-emerald-700" />;
    if (key.includes('recycle') || key.includes('alternate')) return <Recycle className="w-3.5 h-3.5 text-emerald-600" />;
    if (key.includes('storage')) return <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />;
    if (key.includes('fodder')) return <Wheat className="w-3.5 h-3.5 text-lime-700" />;
    return <Leaf className="w-3.5 h-3.5 text-emerald-700" />;
  };

  const bestNextAction = () => {
    if (days == null || days <= 0) return 'Dispose safely / non-edible use';
    const hasProcessors = options.some((o: any) => Array.isArray(o.processors) && o.processors.length > 0);
    const hasMarkets = options.some((o: any) => Array.isArray(o.markets) && o.markets.length > 0);
    if (days <= 3) return hasProcessors ? 'Immediate processing' : hasMarkets ? 'Fire-sale to nearest market' : 'Cold storage or rapid drying';
    if (days <= 7) return hasMarkets ? 'Sell within a week' : hasProcessors ? 'Schedule processing' : 'Improve storage';
    return hasMarkets ? 'Plan sale at better price' : 'Maintain storage and monitor';
  };

  return (
    <>
    <Card className="mb-10 border-red-100 shadow-md overflow-hidden rounded-2xl">
      {/* Image banner */}
      <div className="relative h-40 md:h-48">
        <img src={getCropImage(cropType)} alt={cropType || 'Crop'} className="w-full h-full object-cover cursor-pointer" onClick={() => setShowImage(true)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <Badge className="bg-white/90 text-slate-800 border-slate-200">{cropType || 'Crop'}</Badge>
          <span className="inline-flex items-center gap-1 text-white/90 text-xs">
            <Clock className="w-3 h-3" /> {days != null ? `~${days} days left` : 'Time unknown'}
          </span>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-red-800 text-2xl md:text-3xl font-extrabold">
          <AlertTriangle className="w-6 h-6" />
          Zero-loss options
        </CardTitle>
        <CardDescription className="text-base md:text-lg">Act before spoilage; switch to alternates or processing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <Badge className={urgencyColor()}>{urgencyLabel()} {days != null ? `(~${days} days left)` : ''}</Badge>
          {cropType ? (
            <Badge variant="outline" className="border-slate-200 text-slate-700">Crop: {cropType}</Badge>
          ) : null}
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Best next: {bestNextAction()}</Badge>
        </div>

        {/* Progress bar */}
        {days != null && days >= 0 && (
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${days <= 3 ? 'bg-red-500' : days <= 7 ? 'bg-amber-500' : 'bg-emerald-600'}`}
              style={{ width: `${Math.max(0, Math.min(100, (days / 14) * 100))}%` }}
            />
          </div>
        )}

        {isLoading ? <p className="text-sm text-slate-500">Loading zero-loss options...</p> : null}

        {!isLoading && options.length === 0 ? (
          <p className="text-sm text-slate-500">No zero-loss guidance found.</p>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          {options.map((opt: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {opt.option}
              </div>
              {opt.description ? <p className="text-sm text-slate-600 mt-1">{opt.description}</p> : null}
              {opt.markets?.length ? (
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {opt.markets.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <Store className="w-4 h-4 text-amber-600 mt-0.5" />
                      <span>{m.type}: {m.description}{m.priceRange ? ` (${m.priceRange})` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {opt.processors?.length ? (
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {opt.processors.map((p: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <Factory className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>{p.type}{p.relatedUnits?.length ? ` — ${p.relatedUnits.join(', ')}` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {opt.dailyWage ? (
                <p className="mt-2 text-sm text-emerald-700">MNREGA approx wage: ₹{opt.dailyWage}</p>
              ) : null}
              {opt.recommendation ? (
                <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide inline-flex items-center gap-1">{tagIcon(opt.recommendation)} Tag: {opt.recommendation}</p>
              ) : null}
              {/* CTA */}
              <div className="mt-3">
                <a href={opt.link || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  Explore <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {guide?.shelfLife ? (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Timer className="w-4 h-4 text-slate-500" />
            Shelf life: {guide.shelfLife.normal ? `Ambient ${guide.shelfLife.normal}` : ''} {guide.shelfLife.coldStorage ? `| Cold ${guide.shelfLife.coldStorage}` : ''}
          </div>
        ) : null}

        {awareness?.length ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-700" /> Awareness resources
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {awareness.map((r: any) => (
                <a key={r._id || r.title} href={r.link || '#'} target="_blank" rel="noreferrer" className="block border rounded-lg p-4 bg-white hover:border-emerald-200 hover:shadow-sm">
                  <div className="text-base font-semibold text-slate-800">{r.title}</div>
                  {r.summary ? <p className="text-sm text-slate-600 mt-1">{r.summary}</p> : null}
                  {r.scope ? <p className="text-xs text-emerald-700 mt-1 uppercase tracking-wide">{r.scope}</p> : null}
                  {r.link ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <Link2 className="w-3 h-3" /> Open
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
    {/* Image Modal */}
    {showImage && (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowImage(false)}>
        <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
          <img src={getCropImage(cropType)} alt={cropType || 'Crop'} className="w-full h-auto rounded-xl shadow-2xl" />
          <div className="mt-3 flex justify-end">
            <button className="px-4 py-2 rounded-md bg-white text-slate-800 border border-slate-200" onClick={() => setShowImage(false)}>Close</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
