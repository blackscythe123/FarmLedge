import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { uploadJSONToIPFS, uploadFileToIPFS } from "@/lib/ipfs";
import seasonalityDataRaw from '@/data/seasonality_database.json';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ImageIcon } from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified";

const PINATA_GATEWAY = "https://lime-negative-turtle-558.mypinata.cloud/ipfs";
const PINATA_TOKEN = "SsBoLdLh4Oa8YZV7IdSIeoANLO_4TG6dX1iL2r1tVe2YS9d6kupnN9QRzjU5d3Uf";

export default function Verifiers() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [batches, setBatches] = useState<any[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifierSecret, setVerifierSecret] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<VerificationStatus | null>(null);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState<
    "id-asc" | "id-desc" | "qty-asc" | "qty-desc" | "crop-asc" | "crop-desc"
  >("id-desc");

  // New state for verification details
  const [verificationNote, setVerificationNote] = useState("");
  const [verificationRating, setVerificationRating] = useState(5);
  const [verifiedQuantity, setVerifiedQuantity] = useState<number>(0);
  const [verificationImage, setVerificationImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [batchMetadata, setBatchMetadata] = useState<Record<string, any>>({});

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
      
      // Fetch metadata for batches that have a CID
      data.batches?.forEach(async (batch: any) => {
        if (batch.metadataCID && !batchMetadata[batch.id]) {
          try {
            const metaRes = await fetch(`${PINATA_GATEWAY}/${batch.metadataCID}?pinataGatewayToken=${PINATA_TOKEN}`);
            if (metaRes.ok) {
              const meta = await metaRes.json();
              setBatchMetadata(prev => ({ ...prev, [batch.id]: meta }));
            }
          } catch (err) {
            console.error(`Failed to fetch metadata for batch ${batch.id}`, err);
          }
        }
      });
    } catch (e: any) {
      setError(e?.message || t('verifier.errors.loadFailed'));
    }
  };
  useEffect(() => { fetchBatches(); }, []);

  const isFastPerishable = (cropType: string) => {
    const cropData = (seasonalityDataRaw as any).crops[cropType];
    return cropData?.perishability_type === 'High';
  };

  const filteredSorted = useMemo(() => {
    // hide verified as per rules
    const visible = (batches || []).filter(
      (b: any) => (b?.verification?.status || "unverified") !== "verified"
    );
    const q = query.trim().toLowerCase();
    const searched = q
      ? visible.filter((b: any) => {
          const idStr = String(b?.id ?? "");
          const crop = String(b?.cropType ?? "").toLowerCase();
          const holder = String(b?.holder ?? "").toLowerCase();
          return (
            idStr.includes(q) || crop.includes(q) || holder.includes(q)
          );
        })
      : visible;
    const sorted = [...searched].sort((a: any, b: any) => {
      const aid = Number(a?.id ?? 0);
      const bid = Number(b?.id ?? 0);
      const aq = Number(a?.quantityKg ?? 0);
      const bq = Number(b?.quantityKg ?? 0);
      const ac = String(a?.cropType ?? "").toLowerCase();
      const bc = String(b?.cropType ?? "").toLowerCase();
      switch (sortOption) {
        case "id-asc":
          return aid - bid;
        case "id-desc":
          return bid - aid;
        case "qty-asc":
          return aq - bq;
        case "qty-desc":
          return bq - aq;
        case "crop-asc":
          return ac.localeCompare(bc);
        case "crop-desc":
          return bc.localeCompare(ac);
        default:
          return 0;
      }
    });
    return sorted;
  }, [batches, query, sortOption]);

  const saveStatus = async (
    id: number | string,
    status: VerificationStatus,
    key?: string,
    metadataCID?: string,
    qty?: number
  ) => {
    try {
      setSaving(String(id));
      setError(null);
      const res = await fetch("/api/verification-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: String(id),
          status,
          by: user?.email || "verifier",
          secret: key || verifierSecret || undefined,
          verificationMetadataCID: metadataCID,
          verifiedQuantity: qty
        }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || t('verifier.errors.saveFailed'));
      await fetchBatches();
    } catch (e: any) {
      setError(e?.message || t('verifier.errors.saveFailed'));
    } finally {
      setSaving(null);
    }
  };

  const setStatus = async (id: number | string, status: VerificationStatus) => {
    // Prevent modifying once verified
    const current = batches.find((x) => String(x.id) === String(id));
    const currStatus: VerificationStatus = current?.verification?.status || 'unverified';
    if (currStatus === 'verified') {
      setError(t('verifier.errors.alreadyVerified'));
      return;
    }

    // Allowed transitions:
    // unverified -> pending | verified
    // pending -> unverified | verified
    const allowed = (currStatus === 'unverified' && (status === 'pending' || status === 'verified')) ||
                    (currStatus === 'pending' && (status === 'unverified' || status === 'verified'));
    if (!allowed) return;

    // Extra confirmation + key for verify action -> open themed dialog
    if (status === 'verified') {
      setPendingId(id);
      setPendingStatus(status);
      
      // Initialize form with current batch data
      setVerifiedQuantity(Number(current?.quantityKg || 0));
      setVerificationNote("");
      setVerificationRating(5);
      setVerificationImage(null);
      
      setConfirmOpen(true);
      return;
    }
    await saveStatus(id, status);
  };

  const handleVerifySubmit = async () => {
    if (!pendingId || pendingStatus !== 'verified') return;
    if (!verifierSecret) { setError(t('verifier.errors.secretRequired')); return; }
    
    setIsUploading(true);
    try {
        // IPFS Uploads
        let metadataCID = "";
        let imageCID = "";
        
        if (verificationImage) {
            imageCID = await uploadFileToIPFS(verificationImage);
        }
        
        const metadata = {
            note: verificationNote,
            rating: verificationRating,
            image: imageCID,
            verifiedAt: new Date().toISOString(),
            verifier: user?.email || "verifier",
            originalQuantity: batches.find(b => String(b.id) === String(pendingId))?.quantityKg,
            verifiedQuantity: verifiedQuantity
        };
        
        metadataCID = await uploadJSONToIPFS(metadata);
        
        setConfirmOpen(false);
        await saveStatus(String(pendingId), 'verified', verifierSecret, metadataCID, verifiedQuantity);
        
        // clear dialog state post-submit
        setPendingId(null);
        setPendingStatus(null);
    } catch (e: any) {
        console.error("Verification failed", e);
        setError("Failed to process verification: " + e.message);
    } finally {
        setIsUploading(false);
    }
  };

  const currentBatch = useMemo(() => 
    batches.find(b => String(b.id) === String(pendingId)), 
    [batches, pendingId]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('verifier.title')}</h1>
        {!!error && <div className="text-sm text-red-600">{error}</div>}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">{t('verifier.reviewTitle')}</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('verifier.searchPlaceholder')}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('verifier.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id-desc">{t('verifier.sort.idDesc')}</SelectItem>
                  <SelectItem value="id-asc">{t('verifier.sort.idAsc')}</SelectItem>
                  <SelectItem value="qty-desc">{t('verifier.sort.qtyDesc')}</SelectItem>
                  <SelectItem value="qty-asc">{t('verifier.sort.qtyAsc')}</SelectItem>
                  <SelectItem value="crop-asc">{t('verifier.sort.cropAsc')}</SelectItem>
                  <SelectItem value="crop-desc">{t('verifier.sort.cropDesc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredSorted.map((b:any) => {
              const isUrgent = isFastPerishable(b.cropType);
              const metadata = batchMetadata[b.id];
              const farmerImageCID = metadata?.imageCID;

              return (
              <div key={b.id} className={`flex flex-col gap-3 border rounded p-3 ${isUrgent ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium break-words">Batch #{b.id} • {b.cropType || '—'} • {b.quantityKg}kg</div>
                      {isUrgent && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Urgent Approval
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{t('verifier.status')}: {b?.verification?.status || 'unverified'}</div>
                    
                    {farmerImageCID && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Farmer's Evidence:
                        </p>
                        <div className="relative w-24 h-24 rounded-md overflow-hidden border border-slate-200 group">
                          <img 
                            src={`${PINATA_GATEWAY}/${farmerImageCID}?pinataGatewayToken=${PINATA_TOKEN}`} 
                            alt="Farmer evidence" 
                            className="w-full h-full object-cover"
                          />
                          <a 
                            href={`${PINATA_GATEWAY}/${farmerImageCID}?pinataGatewayToken=${PINATA_TOKEN}`}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-xs text-white font-medium">View</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 self-start sm:self-center">
                    {((b?.verification?.status || 'unverified') === 'pending') && (
                      <Button variant="outline" size="sm" onClick={() => setStatus(b.id, 'unverified')} disabled={saving===String(b.id)}>{t('verifier.actions.unverified')}</Button>
                    )}
                    {((b?.verification?.status || 'unverified') !== 'verified') && (
                      <Button variant="outline" size="sm" onClick={() => setStatus(b.id, 'pending')} disabled={saving===String(b.id)}>{t('verifier.actions.pending')}</Button>
                    )}
                    {((b?.verification?.status || 'unverified') !== 'verified') && (
                      <Button variant="success" size="sm" onClick={() => setStatus(b.id, 'verified')} disabled={saving===String(b.id)}>{t('verifier.actions.verified')}</Button>
                    )}
                  </div>
                </div>
              </div>
            )})}
            {batches.length === 0 && <div className="text-sm text-muted-foreground">{t('verifier.noBatches')}</div>}
          </div>
        </Card>
      </main>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('verifier.confirmTitle')}</DialogTitle>
            <DialogDescription>{t('verifier.confirmVerify')}</DialogDescription>
          </DialogHeader>
          
          {currentBatch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 text-sm">
                <div className="space-y-1">
                    <Label className="text-muted-foreground">Crop Type</Label>
                    <div className="font-medium">{currentBatch.cropType}</div>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground">Farmer Declared Quantity</Label>
                    <div className="font-medium">{currentBatch.quantityKg} kg</div>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground">Harvest Date</Label>
                    <div className="font-medium">{new Date(Number(currentBatch.harvestDate) * 1000).toLocaleDateString()}</div>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground">Expiry Date</Label>
                    <div className="font-medium">{new Date(Number(currentBatch.expiryDate) * 1000).toLocaleDateString()}</div>
                </div>
            </div>
          )}

          <div className="space-y-4 py-2 border-t">
            <div className="space-y-2">
                <Label>Verified Quantity (kg)</Label>
                <Input 
                    type="number" 
                    value={verifiedQuantity} 
                    onChange={(e) => setVerifiedQuantity(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                    If different from declared quantity, this will update the blockchain record.
                </p>
            </div>

            <div className="space-y-2">
                <Label>Quality Rating (1-5)</Label>
                <Select value={String(verificationRating)} onValueChange={(v) => setVerificationRating(Number(v))}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="1">1 - Bad</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Verification Note</Label>
                <Textarea 
                    placeholder="Describe the quality, condition, etc."
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Upload Verification Image</Label>
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setVerificationImage(e.target.files[0]);
                        }
                    }}
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verifier-key">{t('verifier.secretLabel')}</Label>
              <Input
                id="verifier-key"
                type="password"
                value={verifierSecret}
                onChange={(e) => setVerifierSecret(e.target.value)}
                placeholder={t('verifier.promptSecret')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setPendingId(null);
                setPendingStatus(null);
              }}
              disabled={isUploading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="success"
              disabled={!verifierSecret || saving === String(pendingId) || isUploading}
              onClick={handleVerifySubmit}
            >
              {isUploading ? "Uploading to IPFS..." : t('common.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}