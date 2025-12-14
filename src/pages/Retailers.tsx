import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import TestingAddresses from "@/components/TestingAddresses";
import { DEFAULT_ADDRESSES, isHexAddress } from "@/lib/addresses";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Store, ShoppingBag, RefreshCw, AlertCircle, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const Retailers = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [buyQuantity, setBuyQuantity] = useState<string>("");
  const [completeBatch, setCompleteBatch] = useState(false);
  const [consumerPriceInr, setConsumerPriceInr] = useState<string>("");
  const [buyerAddress, setBuyerAddress] = useState<string>(DEFAULT_ADDRESSES.RETAILER);
  const [addrError, setAddrError] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [paying, setPaying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) { console.error(e); }
  };
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

        toast.info(t('retailers.messages.paymentSuccess'));

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

        await new Promise(r => setTimeout(r, 2500));

        if (isComplete && originalBatchId) {
          window.location.href = `/batch?id=${originalBatchId}`;
          return;
        }

        try {
          const res = await fetch('/api/batches');
          const data = await res.json();
          if (data.batches && Array.isArray(data.batches)) {
            const now = Math.floor(Date.now() / 1000);
            const recentBatches = data.batches.filter((b: any) =>
              b.isSplit &&
              (now - b.createdAt) < 300 &&
              (!originalBatchId || String(b.parentId) === String(originalBatchId))
            );

            if (recentBatches.length > 0) {
              recentBatches.sort((a: any, b: any) => b.id - a.id);
              const newBatch = recentBatches[0];
              window.location.href = `/batch?id=${newBatch.id}`;
              return;
            }
          }
        } catch (e) { console.error("Failed to find new batch", e); }

        toast.success(t('retailers.messages.paymentProcessed'));
        window.history.replaceState({}, '', window.location.pathname);
        fetchBatches();
      } else if (params.get('canceled') === '1') {
        fetchBatches();
      }
    };
    checkPayment();
  }, [user, t]);

  const myInventory = useMemo(() => (batches || []).filter((b:any) => b.currentOwner?.toLowerCase?.() === (b.distributor||"").toLowerCase?.()), [batches]);

  const selectedBatchData = useMemo(() => {
    return myInventory.find((b: any) => String(b.id) === String(selectedBatch))
  }, [myInventory, selectedBatch]);

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
    // Retailer buys from Distributor, so use priceByDistributorINR
    const price = Number(selectedBatchData.priceByDistributorINR || selectedBatchData.minPriceINR || selectedBatchData.basePriceINR || 0);
    return price;
  }, [selectedBatchData]);

  const totalPrice = useMemo(() => {
    if (!selectedBatchData) return 0;
    const qty = Number(buyQuantity);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    return pricePerKg * qty;
  }, [buyQuantity, pricePerKg, selectedBatchData]);

  const validateAddress = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) {
      setAddrError(t('retailers.messages.addrRequired'));
      return false;
    }
    if (!isHexAddress(trimmed)) {
      setAddrError(t('retailers.messages.addrInvalid'));
      return false;
    }
    if (addrError) setAddrError("");
    return true;
  };

  const pay = async () => {
    setMsg("");
    if (!user) { setMsg(t('retailers.messages.login')); return; }
    if (!selectedBatch) { setMsg(t('retailers.messages.select')); return; }
    if (!buyQuantity || Number(buyQuantity) <= 0) { setMsg(t('retailers.messages.enterValidQty')); return; }
    if (!selectedBatchData) { setMsg(t('retailers.messages.selectValid')); return; }
    if (Number(buyQuantity) > selectedBatchData.quantityKg) { setMsg(t('retailers.messages.qtyExceeds')); return; }
    if (!consumerPriceInr || Number(consumerPriceInr) <= 0) { setMsg(t('retailers.messages.setConsumerPrice')); return; }

    const finalBuyer = buyerAddress?.trim() ? buyerAddress : DEFAULT_ADDRESSES.RETAILER;
    if (!validateAddress(finalBuyer)) { return; }

    const priceInr = totalPrice;
    if (priceInr <= 0) { setMsg(t('retailers.messages.calcError')); return; }

    const totalResalePrice = consumerPriceInr ? (Number(consumerPriceInr)).toFixed(0) : '0';

    try {
      setPaying(true);
      const res = await fetch('/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems: [{
            price_data: {
              currency: 'inr',
              product_data: { name: `Batch ${selectedBatch} (${buyQuantity}kg)` },
              unit_amount: Math.round(priceInr * 100)
            },
            quantity: 1
          }],
          successUrl: `${window.location.origin}/retailers?paid=1&batchId=${selectedBatch}&complete=${completeBatch ? '1' : '0'}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin + '/retailers?canceled=1',
          metadata: {
            batchId: String(selectedBatch),
            role: 'retailer',
            payer: user.email || 'retailer',
            toAddress: finalBuyer,
            isSplit: !completeBatch,
            splitQuantity: buyQuantity,
            completeBatch: completeBatch ? 'true' : 'false',
            resalePricePerKg: consumerPriceInr || '0',
            consumerPriceINR: totalResalePrice
          }
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url; else setMsg(t('retailers.messages.startFailed'));
    } catch (e:any) { setMsg(e?.message || t('retailers.messages.failed')); }
    finally { setPaying(false); }
  };

  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">{t('retailers.purchase.processing')}</h2>
        <p className="text-muted-foreground">{t('retailers.purchase.wait')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">{t('retailers.title')}</h1>
            <p className="text-slate-500 mt-1">{t('retailers.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={fetchBatches} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('retailers.refreshInventory')}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Marketplace */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="h-[600px] flex flex-col shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-600" />
                  {t('retailers.marketplace.title')}
                </CardTitle>
                <CardDescription>{t('retailers.marketplace.description')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {myInventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
                      <Store className="w-12 h-12 mb-3 opacity-20" />
                      <p>{t('retailers.marketplace.noBatches')}</p>
                      <p className="text-sm">{t('retailers.marketplace.checkBack')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myInventory.map((b: any) => {
                        const isSelected = String(b.id) === String(selectedBatch);
                        const price = Number(b.priceByDistributorINR || b.minPriceINR || b.basePriceINR || 0);
                        
                        return (
                          <div 
                            key={b.id} 
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4 ${isSelected ? 'bg-amber-50/50 hover:bg-amber-50' : ''}`}
                            onClick={() => setSelectedBatch(String(b.id))}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Tag className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium text-slate-900">#{b.id}</span>
                                  <Badge variant="secondary" className="text-xs font-normal">{b.cropType}</Badge>
                                </div>
                                <div className="text-sm text-slate-500 mt-1 space-y-1">
                                  <div>{b.quantityKg} kg {t('retailers.marketplace.available')} • ₹{price}/kg</div>
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
                                className={isSelected ? "bg-amber-600 hover:bg-amber-700" : ""}
                              >
                                {isSelected ? t('retailers.marketplace.selected') : t('retailers.marketplace.select')}
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
            <Card className="border-t-4 border-t-amber-500 shadow-md sticky top-28">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  {t('retailers.purchase.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedBatch ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                    <ArrowRight className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('retailers.purchase.selectPrompt')}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('retailers.purchase.selectedBatch')}</span>
                        <span className="font-mono font-medium">#{selectedBatch}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('retailers.purchase.availableQty')}</span>
                        <span className="font-medium">{selectedBatchData?.quantityKg} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('retailers.purchase.distributorPrice')}</span>
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
                          {t('retailers.purchase.buyFullBatch')}
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('retailers.purchase.quantity')}</Label>
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
                        <Label>{t('retailers.purchase.consumerPrice')}</Label>
                        <Input
                          type="number"
                          value={consumerPriceInr}
                          onChange={(e) => setConsumerPriceInr(e.target.value)}
                          placeholder={t('retailers.purchase.setPrice')}
                          min={pricePerKg}
                        />
                        <p className="text-[10px] text-slate-400">
                          {t('retailers.purchase.mustBeHigher')} ₹{pricePerKg.toFixed(2)}
                        </p>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-slate-700">{t('retailers.purchase.totalCost')}</span>
                        <span className="text-2xl font-bold text-slate-900">₹{totalPrice.toLocaleString()}</span>
                      </div>

                      {!!msg && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4" />
                          {msg}
                        </div>
                      )}

                      <Button 
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={pay}
                        disabled={paying || !buyQuantity || !consumerPriceInr || Number(consumerPriceInr) <= 0}
                      >
                        {paying ? (
                          <>{t('retailers.purchase.processing')}</>
                        ) : (
                          <>
                            {t('retailers.purchase.payAndAdd')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">{t('retailers.purchase.buyerWallet')}</Label>
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
              <h4 className="font-semibold text-sm mb-2 text-slate-700">{t('retailers.purchase.devTools')}</h4>
              <TestingAddresses />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Retailers;
