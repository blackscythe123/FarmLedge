import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CheckCircle2, Sprout, Truck, Store, User, ShieldCheck, Banknote } from "lucide-react";

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
  createdAt?: number | string;
};

const stages = ["Farmer", "Distributor", "Retailer", "Consumer"] as const;

function ownerRole(b: Batch) {
  const owner = (b.currentOwner || "").toLowerCase();
  if (!owner) return "Unknown";
  if (owner === (b.consumer || "").toLowerCase()) return "Consumer";
  if (owner === (b.retailer || "").toLowerCase()) return "Retailer";
  if (owner === (b.distributor || "").toLowerCase()) return "Distributor";
  if (owner === (b.farmer || "").toLowerCase()) return "Farmer";
  return "Holder";
}

const HowItWorks = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch('/api/batches');
        const d = await r.json();
        setBatches(d?.batches || []);
      } catch { }
      finally { setLoading(false); }
    })();
  }, []);

  const latest = useMemo(() => (batches || []).slice().sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))[0], [batches]);

  const steps = [
    {
      icon: Sprout,
      title: "Farmer Registers Produce",
      desc: "Farmers log their harvest on the blockchain, setting the base price and quantity. This creates a digital twin of the batch.",
      color: "bg-green-100 text-green-600",
      role: "Farmer"
    },
    {
      icon: Truck,
      title: "Distributor Procurement",
      desc: "Distributors purchase produce directly from farmers using secure payments. Ownership transfers automatically upon verification.",
      color: "bg-blue-100 text-blue-600",
      role: "Distributor"
    },
    {
      icon: Store,
      title: "Retailer Stocking",
      desc: "Retailers buy from distributors. The transparent price history ensures fair margins are maintained.",
      color: "bg-orange-100 text-orange-600",
      role: "Retailer"
    },
    {
      icon: User,
      title: "Consumer Purchase",
      desc: "Consumers buy the final product, scanning the QR code to see the entire journey and price breakdown.",
      color: "bg-purple-100 text-purple-600",
      role: "Consumer"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-700 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
         {/* Page Header */}
         <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                    <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Process</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#064e3b]">How It Works</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Transparency from Farm to Fork. Understand the lifecycle of a verified batch.</p>
            </div>
        </div>

        <div className="container mx-auto px-4 py-12">
            
            {/* Steps Visualization */}
            <div className="max-w-5xl mx-auto mb-20">
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-[10%] right-[10%] top-8 h-1 bg-gray-200 -z-10"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white ${step.color} group-hover:scale-110 transition-transform`}>
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Left: Technical Details */}
                <div className="md:col-span-7">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        Secure & Transparent Protocol
                    </h2>
                    <div className="space-y-4">
                         <Card className="hover:shadow-md transition-shadow">
                             <CardContent className="p-4 flex gap-4">
                                 <div className="bg-yellow-100 p-3 h-fit rounded text-yellow-700">
                                     <Banknote className="w-6 h-6" />
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-gray-800">INR Payments via Stripe</h3>
                                     <p className="text-sm text-gray-600 mt-1">
                                         All transactions are processed in INR. While the ownership record is on the blockchain, the payment layer uses standard banking gateways for ease of use.
                                     </p>
                                 </div>
                             </CardContent>
                         </Card>
                         
                         <Card className="hover:shadow-md transition-shadow">
                             <CardContent className="p-4 flex gap-4">
                                 <div className="bg-blue-100 p-3 h-fit rounded text-blue-700">
                                     <ShieldCheck className="w-6 h-6" />
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-gray-800">Verified Ownership Transfer</h3>
                                     <p className="text-sm text-gray-600 mt-1">
                                        A centralized "Verifier" listens for successful payments and executes the smart contract transaction to transfer digital ownership.
                                     </p>
                                 </div>
                             </CardContent>
                         </Card>
                    </div>
                </div>

                {/* Right: Live Data Snapshot */}
                <div className="md:col-span-5">
                    <div className="bg-slate-900 text-white rounded-lg p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sprout className="w-32 h-32" />
                        </div>
                        
                        <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-6">
                                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                 <h3 className="font-mono text-sm tracking-widest text-emerald-400 uppercase">Live Network Snapshot</h3>
                             </div>

                             {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-4 w-1/2 bg-slate-700" />
                                    <Skeleton className="h-20 w-full bg-slate-700" />
                                </div>
                             ) : latest ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase mb-1">Latest Batch</p>
                                        <div className="text-2xl font-bold flex items-center gap-2">
                                            #{String(latest.id)} <span className="text-lg font-normal text-slate-300">({latest.cropType})</span>
                                        </div>
                                        <p className="text-sm text-emerald-400 mt-1">{latest.quantityKg} KG</p>
                                    </div>

                                    <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
                                        <p className="text-xs text-slate-400 mb-3 uppercase">Price Discovery (INR)</p>
                                        <div className="flex justify-between text-sm">
                                            <div className="text-center">
                                                <div className="text-slate-300">₹{latest.minPriceINR || latest.basePriceINR || 0}</div>
                                                <div className="text-[10px] text-slate-500 mt-1">Base</div>
                                            </div>
                                            <div className="text-slate-600">→</div>
                                            <div className="text-center">
                                                <div className="text-slate-300">₹{latest.priceByDistributorINR || 0}</div>
                                                <div className="text-[10px] text-slate-500 mt-1">Wholesale</div>
                                            </div>
                                            <div className="text-slate-600">→</div>
                                            <div className="text-center">
                                                <div className="text-emerald-400 font-bold">₹{latest.priceByRetailerINR || 0}</div>
                                                <div className="text-[10px] text-emerald-600 mt-1">Retail</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 mb-2 uppercase">Current Stage</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-600 hover:bg-blue-700 border-none">
                                                {ownerRole(latest)}
                                            </Badge>
                                            <span className="text-xs text-slate-500">
                                                Holder Address: {latest.currentOwner?.slice(0, 6)}...{latest.currentOwner?.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                             ) : (
                                <p className="text-slate-400">No batch data available right now.</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
