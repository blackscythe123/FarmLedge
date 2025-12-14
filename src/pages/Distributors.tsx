import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_ADDRESSES, isHexAddress } from "@/lib/addresses";
import TestingAddresses from "@/components/TestingAddresses";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Package, ShoppingCart, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import DistributorMap from "@/components/DistributorMap";


const Distributors = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [buyQuantity, setBuyQuantity] = useState<string>("");
  const [completeBatch, setCompleteBatch] = useState(false);
  const [resalePrice, setResalePrice] = useState<string>("");
  const [buyerAddress, setBuyerAddress] = useState<string>(DEFAULT_ADDRESSES.DISTRIBUTOR);
  const [addrError, setAddrError] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [batches, setBatches] = useState<any[]>([]);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { fetchBatches(); }, []);
  // Handle successful payment redirect
  useEffect(() => {
    const checkPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('paid') === '1' && user?.email) {
        setIsProcessingPayment(true);
        const originalBatchId = params.get('batchId');
        const isComplete = params.get('complete') === '1';
        const sessionId = params.get('session_id');

        toast.info(t('distributors.messages.paymentSuccess'));

        // Manually confirm payment to handle localhost webhook issues
        if (sessionId) {
          try {
            await fetch('/api/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });
          } catch (e) {
            console.error("Manual confirmation failed", e);
          }
        }

        // Wait a moment for chain update
        await new Promise(r => setTimeout(r, 2500));

        if (isComplete && originalBatchId) {
          window.location.href = `/batch?id=${originalBatchId}`;
          return;
        }

        try {
          // Fetch all batches to find the new one
          const res = await fetch('/api/batches');
          const data = await res.json();

          if (data.batches && Array.isArray(data.batches)) {
            // Find batches created in the last 5 minutes that are split batches
            const now = Math.floor(Date.now() / 1000);
            const recentBatches = data.batches.filter((b: any) =>
              b.isSplit &&
              (now - b.createdAt) < 300 && // Created in last 5 mins
              (!originalBatchId || String(b.parentId) === String(originalBatchId))
            );

            if (recentBatches.length > 0) {
              // Sort by ID descending to get the newest
              recentBatches.sort((a: any, b: any) => b.id - a.id);
              const newBatch = recentBatches[0];
              window.location.href = `/batch?id=${newBatch.id}`;
              return;
            }
          }
        } catch (e) {
          console.error("Failed to find new batch", e);
        }

        // Fallback if not found
        toast.success(t('distributors.messages.paymentProcessed'));
        // Clear param
        window.history.replaceState({}, '', window.location.pathname);
        fetchBatches();
      } else if (params.get('canceled') === '1') {
        fetchBatches();
      }
    };

    checkPayment();
  }, [user, t]);

  const available = useMemo(() => {
    // Available = currently held by farmer (owner == farmer) and VERIFIED
    return (batches || []).filter((b: any) => {
      const heldByFarmer = b.currentOwner && b.farmer && b.currentOwner.toLowerCase?.() === b.farmer.toLowerCase?.()
      const isVerified = (b?.verification?.status || 'unverified') === 'verified'
      return heldByFarmer && isVerified
    })
  }, [batches]);

  const selectedBatchData = useMemo(() => {
    return available.find((b: any) => String(b.id) === String(selectedBatch))
  }, [available, selectedBatch]);

  // Auto-fill quantity when complete batch is checked
  useEffect(() => {
    if (completeBatch && selectedBatchData?.quantityKg) {
      setBuyQuantity(String(selectedBatchData.quantityKg));
    }
  }, [completeBatch, selectedBatchData?.quantityKg]);

  const pricePerKg = useMemo(() => {
    if (!selectedBatchData) return 0;
    const qty = selectedBatchData.quantityKg;
    if (qty === 0) return 0;
    const basePrice = Number(selectedBatchData.minPriceINR || selectedBatchData.basePriceINR || 0);
    return basePrice;
  }, [selectedBatchData]);

  const totalPrice = useMemo(() => {
    if (!selectedBatchData) return 0;
    const qty = Number(buyQuantity);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    return pricePerKg * qty;
  }, [buyQuantity, pricePerKg, selectedBatchData]);

  useEffect(() => {
    if (!user) { setActionMsg(t('distributors.messages.login')); return; }
    if (!selectedBatch) { setActionMsg(t('distributors.messages.select')); return; }
    if (!buyQuantity || Number(buyQuantity) <= 0) { setActionMsg(t('distributors.messages.enterValidQty')); return; }
    if (Number(buyQuantity) > selectedBatchData?.quantityKg) { setActionMsg(t('distributors.messages.qtyExceeds')); return; }
    if (!resalePrice) { setActionMsg(t('distributors.messages.setResale')); return; }
    setActionMsg("");
  }, [buyQuantity, completeBatch, resalePrice, selectedBatch, selectedBatchData?.quantityKg, t, user]);

  const validateAddress = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) {
      setAddrError(t('distributors.messages.addrRequired'));
      return false;
    }
    if (!isHexAddress(trimmed)) {
      setAddrError(t('distributors.messages.addrInvalid'));
      return false;
    }
    if (addrError) setAddrError("");
    return true;
  };

  const pay = async () => {
    if (!user) { setActionMsg(t('distributors.messages.login')); toast.error(t('distributors.messages.login')); return; }
    if (!selectedBatch) { setActionMsg(t('distributors.messages.select')); return; }
    if (!buyQuantity || Number(buyQuantity) <= 0) { setActionMsg(t('distributors.messages.enterValidQty')); return; }
    if (!selectedBatchData) { setActionMsg(t('distributors.messages.selectValid')); return; }
    if (Number(buyQuantity) > selectedBatchData.quantityKg) { setActionMsg(t('distributors.messages.qtyExceeds')); return; }
    if (!resalePrice || Number(resalePrice) <= 0) { setActionMsg(t('distributors.messages.setResale')); return; }

    const finalBuyer = buyerAddress?.trim() ? buyerAddress : DEFAULT_ADDRESSES.DISTRIBUTOR;
    if (!validateAddress(finalBuyer)) { return; }

    const priceInr = totalPrice;
    if (priceInr <= 0) { setActionMsg(t('distributors.messages.calcError')); return; }

    // Calculate total resale price for complete batch logic
    const totalResalePrice = resalePrice ? (Number(resalePrice)).toFixed(0) : '0';

    try {
      setPaying(true);
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: [{
            price_data: {
              currency: "inr",
              product_data: { name: `Batch ${selectedBatch} (${buyQuantity}kg)` },
              unit_amount: Math.round(priceInr * 100)
            },
            quantity: 1
          }],
          successUrl: `${window.location.origin}/distributors?paid=1&batchId=${selectedBatch}&complete=${completeBatch ? '1' : '0'}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/distributors?canceled=1`,
          metadata: {
            batchId: String(selectedBatch),
            role: "distributor",
            payer: user.email || 'distributor',
            payee: selectedBatchData?.farmer || '',
            toAddress: finalBuyer,
            isSplit: !completeBatch,
            splitQuantity: buyQuantity,
            completeBatch: completeBatch ? 'true' : 'false',
            resalePricePerKg: resalePrice || '0',
            distributorPriceINR: totalResalePrice
          }
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setActionMsg(t('distributors.messages.startFailed'));
    } catch (e) {
      console.error(e);
      toast.error(t('distributors.messages.paymentFailed'));
    } finally {
      setPaying(false);
    }
  };

  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">{t('distributors.purchase.processing')}</h2>
        <p className="text-muted-foreground">{t('distributors.purchase.wait')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">{t('distributors.title')}</h1>
            <p className="text-slate-500 mt-1">{t('distributors.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={fetchBatches} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('distributors.refreshMarket')}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Marketplace */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="h-[600px] flex flex-col shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  {t('distributors.marketplace.title')}
                </CardTitle>
                <CardDescription>{t('distributors.marketplace.description')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {available.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
                      <Package className="w-12 h-12 mb-3 opacity-20" />
                      <p>{t('distributors.marketplace.noBatches')}</p>
                      <p className="text-sm">{t('distributors.marketplace.checkBack')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {available.map((b: any) => {
                        const isSelected = String(b.id) === String(selectedBatch);
                        const price = Number(b.minPriceINR || b.basePriceINR || 0);
                        
                        return (
                          <div 
                            key={b.id} 
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4 ${isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : ''}`}
                            onClick={() => setSelectedBatch(String(b.id))}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium text-slate-900">#{b.id}</span>
                                  <Badge variant="secondary" className="text-xs font-normal">{b.cropType}</Badge>
                                  {b?.verification?.status === 'verified' && (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  )}
                                </div>
                                <div className="text-sm text-slate-500 mt-1 space-y-1">
                                  <div>{b.quantityKg} kg {t('distributors.marketplace.available')} • ₹{price}/kg</div>
                                  <div className="text-xs flex gap-3">
                                    <span>Harvest: {b.harvestDate ? new Date(Number(b.harvestDate) * 1000).toLocaleDateString() : '-'}</span>
                                    <span className="text-red-600">Expires: {b.expiryDate ? new Date(Number(b.expiryDate) * 1000).toLocaleDateString() : '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                variant={isSelected ? "default" : "ghost"}
                                className={isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
                              >
                                {isSelected ? t('distributors.marketplace.selected') : t('distributors.marketplace.select')}
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/batch?id=${b.id}`} target="_blank" rel="noreferrer">
                                  View
                                </a>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Purchase Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-t-4 border-t-blue-500 shadow-md sticky top-28">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  {t('distributors.purchase.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedBatch ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                    <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('distributors.purchase.selectPrompt')}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('distributors.purchase.selectedBatch')}</span>
                        <span className="font-mono font-medium">#{selectedBatch}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('distributors.purchase.availableQty')}</span>
                        <span className="font-medium">{selectedBatchData?.quantityKg} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('distributors.purchase.basePrice')}</span>
                        <span className="font-medium">₹{pricePerKg.toFixed(2)}/kg</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="completeBatch"
                          checked={completeBatch}
                          onCheckedChange={(checked) => setCompleteBatch(checked as boolean)}
                        />
                        <Label htmlFor="completeBatch" className="cursor-pointer text-sm font-medium">
                          {t('distributors.purchase.buyFullBatch')}
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('distributors.purchase.quantity')}</Label>
                        <Input
                          type="number"
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(e.target.value)}
                          placeholder="0"
                          max={selectedBatchData?.quantityKg}
                          min={1}
                          disabled={completeBatch}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('distributors.purchase.resalePrice')}</Label>
                        <Input
                          type="number"
                          value={resalePrice}
                          onChange={(e) => setResalePrice(e.target.value)}
                          placeholder={t('distributors.purchase.setMargin')}
                          min={pricePerKg}
                        />
                        <p className="text-[10px] text-slate-400">
                          {t('distributors.purchase.mustBeHigher')} ₹{pricePerKg.toFixed(2)}
                        </p>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-slate-700">{t('distributors.purchase.totalCost')}</span>
                        <span className="text-2xl font-bold text-slate-900">₹{totalPrice.toLocaleString()}</span>
                      </div>

                      {!!actionMsg && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4" />
                          {actionMsg}
                        </div>
                      )}

                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={pay}
                        disabled={paying || !buyQuantity || !resalePrice || Number(resalePrice) <= 0}
                      >
                        {paying ? (
                          <>{t('distributors.purchase.processing')}</>
                        ) : (
                          <>
                            {t('distributors.purchase.payAndTransfer')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">{t('distributors.purchase.buyerWallet')}</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          placeholder="0x..."
                          value={buyerAddress}
                          onChange={(e) => {
                            setBuyerAddress(e.target.value);
                            if (addrError) validateAddress(e.target.value);
                          }}
                        />
                        {!!addrError && <div className="text-xs text-red-600">{addrError}</div>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-sm mb-2 text-slate-700">{t('distributors.purchase.devTools')}</h4>
              <TestingAddresses />
            </div>
          </div>
        </div>

        {/* Collection Route Planner Section */}
        <div className="mt-12">
          <DistributorMap />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Distributors;
