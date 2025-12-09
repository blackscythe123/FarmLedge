import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const Status = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [appId, setAppId] = useState("");

  const handleSearch = () => {
    if (!appId) return;
    setLoading(true);
    setResult(null);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Dummy logic for demo
      if (appId === "123") {
         setResult({ status: "Approved", date: "09 Dec 2024", msg: "Your farmer registration has been approved. You can now download your card." });
      } else if (appId === "456") {
         setResult({ status: "Pending", date: "05 Dec 2024", msg: "Your application is currently under verification by the District Agriculture Officer." });
      } else {
         setResult({ status: "Not Found", msg: "No application found with this ID. Please check and try again." });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-700 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
         {/* Page Header */}
         <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                    <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Services</span> <ArrowRight className="w-3 h-3" /> <span>Track Status</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Track Application Status</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Check the status of your Farmer Registration, KALIA Scheme application, or other service requests.</p>
            </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Card className="border-t-4 border-t-[#fbbf24] shadow-md">
                <CardContent className="p-8">
                     <div className="flex flex-col gap-4">
                         <label className="text-sm font-bold text-gray-700">Application Reference Number / Aadhaar Number</label>
                         <div className="flex gap-4">
                             <Input 
                               placeholder="Enter Reference No (e.g. 123)" 
                               className="h-12 text-lg"
                               value={appId}
                               onChange={(e) => setAppId(e.target.value)}
                             />
                             <Button className="h-12 w-32 bg-[#047857] hover:bg-[#065f46]" onClick={handleSearch} disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Search</>}
                             </Button>
                         </div>
                         <p className="text-xs text-gray-500">Note: Please enter the 12-digit Reference Number received during registration.</p>
                     </div>

                     {result && (
                         <div className={`mt-8 p-6 rounded border ${result.status === 'Approved' ? 'bg-green-50 border-green-200' : result.status === 'Not Found' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} animation-fade-in`}>
                             <div className="flex items-start gap-4">
                                 {result.status === 'Approved' && <CheckCircle2 className="w-8 h-8 text-green-600" />}
                                 {result.status === 'Pending' && <Loader2 className="w-8 h-8 text-yellow-600" />}
                                 {result.status === 'Not Found' && <XCircle className="w-8 h-8 text-red-600" />}
                                 
                                 <div>
                                     <h3 className={`text-lg font-bold ${result.status === 'Approved' ? 'text-green-800' : result.status === 'Not Found' ? 'text-red-800' : 'text-yellow-800'}`}>
                                         {result.status === 'Not Found' ? 'Record Not Found' : `Application ${result.status}`}
                                     </h3>
                                     <p className="text-sm text-gray-700 mt-1">{result.msg}</p>
                                     {result.date && <p className="text-xs text-gray-500 mt-2 font-medium">Last Updated: {result.date}</p>}
                                 </div>
                             </div>
                         </div>
                     )}
                </CardContent>
            </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Status;
