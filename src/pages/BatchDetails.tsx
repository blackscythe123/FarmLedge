import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, Calendar as CalendarIcon, Image as ImageIcon, Maximize2 } from "lucide-react";
import { ZeroLossPanel } from "@/components/ZeroLossPanel";



import {
  Sprout,
  Truck,
  Store,
  User,
  CheckCircle2,
  Circle,
  Calendar,
  DollarSign,
  Package,
  ArrowRight,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BatchDetails() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const { t } = useTranslation();
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) { setError("missing id"); setLoading(false); return; }
      try {
        setLoading(true)
        const paid = new URLSearchParams(window.location.search).get('paid')
        const sessionId = new URLSearchParams(window.location.search).get('session_id')
        if (paid === '1' && sessionId) {
          try {
            await fetch('/api/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, batchId: id })
            })
          } catch { }
        }
        const res = await fetch(`/api/batch/${encodeURIComponent(id)}`)
        const text = await res.text()
        let json: any = null
        try { json = JSON.parse(text) } catch {
          throw new Error('Non-JSON response (server offline or proxy misconfig)')
        }
        if (!res.ok) throw new Error(json?.error || 'failed')
        setData(json)
      } catch (e: any) {
        setError(e.message || 'failed')
      } finally { setLoading(false) }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navigation />
        <main className="container mx-auto px-4 py-24 sm:py-28 max-w-3xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-12 pl-4 border-l-2 border-slate-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative pl-8">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navigation />
        <main className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('batchDetails.notFound')}</h1>
          <p className="text-slate-600 mb-8">{error || t('batchDetails.notFoundDesc')}</p>
          <Link to="/" className="text-emerald-600 hover:underline font-medium">{t('batchDetails.returnHome')}</Link>
        </main>
      </div>
    );
  }

  // Timeline Steps Configuration
  const batch = data.batch;

  const getCropImage = (cropType?: string) => {
    const key = (cropType || "").trim().toLowerCase();
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
    return map[key] || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop";
  };

  // Timeline Steps Configuration
  const steps = [
    {
      key: 'farmer',
      role: t('batchDetails.labels.farmer'),
      icon: Sprout,
      date: batch.harvestDate || batch.createdAt,
      dateLabel: 'Harvest',
      expiryDate: batch.expiryDate,
      price: batch.minPriceINR || batch.basePriceINR,
      actor: batch.farmer,
      isCompleted: true,
      description: t('batchDetails.steps.farmerDesc'),
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-200"
    },
    {
      key: 'distributor',
      role: t('batchDetails.roles.distributor'),
      icon: Truck,
      date: batch.dates?.boughtByDistributor,
      dateLabel: 'Bought',
      expiryDate: batch.expiryDate,
      price: batch.priceByDistributorINR,
      isCompleted: !!batch.dates?.boughtByDistributor,
      actor: batch.distributor,
      description: t('batchDetails.steps.distributorDesc'),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      key: 'retailer',
      role: t('batchDetails.roles.retailer'),
      icon: Store,
      date: batch.dates?.boughtByRetailer,
      dateLabel: 'Bought',
      expiryDate: batch.expiryDate,
      price: batch.priceByRetailerINR,
      isCompleted: !!batch.dates?.boughtByRetailer,
      actor: batch.retailer,
      description: t('batchDetails.steps.retailerDesc'),
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-200"
    },
    {
      key: 'consumer',
      role: t('batchDetails.roles.consumer'),
      icon: User,
      date: batch.dates?.boughtByConsumer,
      dateLabel: 'Bought',
      expiryDate: batch.expiryDate,
      price: null, // Consumer doesn't set a price
      actor: null,
      isCompleted: !!batch.dates?.boughtByConsumer,
      description: t('batchDetails.steps.consumerDesc'),
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Navigation />

      <main className="container mx-auto px-4 py-24 sm:py-28 max-w-4xl">
        {/* Zero-loss action panel */}
        {id ? <ZeroLossPanel batchId={id} cropType={batch?.cropType} /> : null}

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2">
            <Package className="w-4 h-4" />
            <span>{t('batchDetails.labels.batch')} #{batch.id}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">
            {batch.cropType} {t('batchDetails.journey')}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="font-semibold text-slate-900">{batch.quantityKg} kg</span>
              <span>{t('batchDetails.quantity')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="font-semibold text-slate-900">{batch.currentOwner.slice(0, 6)}...{batch.currentOwner.slice(-4)}</span>
              <span>{t('batchDetails.currentOwner')}</span>
            </div>
            <Badge variant="outline" className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-wider font-semibold",
              batch.currentHolderRole === 'CONSUMER' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700"
            )}>
              {batch.currentHolderRole || 'IN TRANSIT'}
            </Badge>
          </div>
        </div>

        {/* Crop Image + Summary Card */}
        <Card className="mb-12 overflow-hidden border border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-56 md:h-full">
                <img
                  src={getCropImage(batch?.cropType)}
                  alt={batch?.cropType || 'Crop'}
                  className="h-full w-full object-cover"
                  onClick={() => setShowImage(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <Badge className="bg-white/90 text-slate-800 border-slate-200">{batch.cropType}</Badge>
                  <Button size="sm" variant="secondary" className="bg-white/90 text-slate-800 border-slate-200 hover:bg-white" onClick={() => setShowImage(true)}>
                    <Maximize2 className="w-4 h-4 mr-1" /> {t('batchDetails.view') || 'View'}
                  </Button>
                </div>
              </div>
              <div className="p-6 md:p-7 space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  {batch.cropType} {t('batchDetails.summary') || 'Summary'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{t('batchDetails.basePrice') || 'Base Price'}</p>
                    <p className="text-lg font-semibold text-emerald-700 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />{(batch.basePriceINR ?? batch.minPriceINR ?? 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{t('batchDetails.quantity') || 'Quantity'}</p>
                    <p className="text-lg font-semibold text-slate-800">{batch.quantityKg} kg</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{t('batchDetails.harvest') || 'Harvest'}</p>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />{batch.harvestDate ? new Date(batch.harvestDate * 1000).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{t('batchDetails.expires') || 'Expires'}</p>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />{batch.expiryDate ? new Date(batch.expiryDate * 1000).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Batch Link */}
        {batch.parentId !== 0 && (
          <Card className="mb-12 border-l-4 border-l-blue-500 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  {t('batchDetails.originBatch')}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {t('batchDetails.splitFrom', { id: batch.parentId })}
                </p>
              </div>
              <Link
                to={`/batch?id=${batch.parentId}`}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                {t('batchDetails.viewParent')} <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Vertical Timeline */}
        <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 space-y-12 pb-12">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isActive = step.isCompleted;

            return (
              <div key={step.key} className={cn("relative pl-8 sm:pl-12 transition-all duration-500", isActive ? "opacity-100" : "opacity-50 grayscale")}>
                {/* Timeline Node */}
                <div className={cn(
                  "absolute -left-[21px] sm:-left-[25px] top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
                  isActive ? step.bgColor : "bg-slate-100"
                )}>
                  <step.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive ? step.color : "text-slate-400")} />
                </div>

                {/* Content Card */}
                <Card className={cn("border-none shadow-md overflow-hidden transition-shadow hover:shadow-lg", isActive ? "ring-1 ring-slate-200" : "")}>
                  <div className={cn("h-1.5 w-full", isActive ? step.bgColor.replace('bg-', 'bg-') : "bg-slate-100")} /> {/* Colored top bar */}
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className={cn("text-lg font-bold flex items-center gap-2", isActive ? "text-slate-900" : "text-slate-500")}>
                          {step.role}
                          {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                      </div>
                      {isActive && step.date && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="w-fit flex items-center gap-1.5 font-mono text-xs">
                            <Calendar className="w-3 h-3" />
                            {step.dateLabel || 'Date'}: {new Date(step.date * 1000).toLocaleDateString()}
                          </Badge>
                          {/* @ts-ignore */}
                          {step.expiryDate && (
                            <Badge variant="outline" className="w-fit flex items-center gap-1.5 font-mono text-xs text-red-600 border-red-200 bg-red-50">
                              <Calendar className="w-3 h-3" />
                              Expires: {new Date(step.expiryDate * 1000).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        {step.actor && (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('batchDetails.identity')}</span>
                            <div className="font-mono text-sm text-slate-700 break-all">{step.actor}</div>
                          </div>
                        )}

                        {step.price && (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('batchDetails.transactionPrice')}</span>
                            <div className="flex items-center gap-1 text-emerald-700 font-medium">
                              <IndianRupee className="w-4 h-4" />
                              {step.price}
                            </div>

                          </div>
                        )}

                        {!step.price && !step.actor && (
                          <div className="text-sm text-slate-400 italic">
                            {t('batchDetails.verifiedOnChain')}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Parent Batch Info (Hidden logic for data fetching, kept for compatibility if needed, but UI is moved up) */}
        {/* We already handled the parent link above. The original code had a separate component fetching it. 
            We can keep the component definition if we want to be safe, but I inlined the link logic. 
            Actually, let's keep the fetch logic if we want to show details, but a link is cleaner. 
            I'll stick to the link for now as it's cleaner. */}
      </main>

      {/* Simple Image Modal */}
      {showImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowImage(false)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={getCropImage(batch?.cropType)} alt={batch?.cropType || 'Crop'} className="w-full h-auto rounded-lg shadow-2xl" />
            <div className="mt-3 flex justify-end">
              <Button variant="secondary" onClick={() => setShowImage(false)}>{t('common.close') || 'Close'}</Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

