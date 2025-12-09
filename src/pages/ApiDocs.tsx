import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Database, Key, Copy, Check } from "lucide-react";
import { useState } from "react";

const ApiDocs = () => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText("https://api.farmledge.gov.in/v1");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-700 flex flex-col">
            <Navigation />
            
            <main className="flex-grow">
                {/* Page Header */}
                <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                            <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Developers</span> <ArrowRight className="w-3 h-3" /> <span>API Documentation</span>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-[#064e3b]">API Reference</h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">Integrate FarmLedge services into your applications seamlessly with our REST APIs.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-12 gap-10">
                        {/* Sidebar */}
                        <div className="md:col-span-3">
                            <div className="sticky top-4 space-y-2">
                                <h3 className="font-bold text-gray-900 mb-4 px-2">Guides</h3>
                                <Button variant="ghost" className="w-full justify-start text-emerald-700 bg-emerald-50">Introduction</Button>
                                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-emerald-700 hover:bg-emerald-50">Authentication</Button>
                                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-emerald-700 hover:bg-emerald-50">Errors</Button>
                                <h3 className="font-bold text-gray-900 mt-6 mb-4 px-2">Resources</h3>
                                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-emerald-700 hover:bg-emerald-50">Batches</Button>
                                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-emerald-700 hover:bg-emerald-50">Storage</Button>
                                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-emerald-700 hover:bg-emerald-50">Pricing</Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="md:col-span-9 space-y-12">
                            
                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    The FarmLedge API provides a unified interface to access agricultural data, including crop pricing, storage availability, and batch traceability. All API endpoints are rooted at:
                                </p>
                                <div className="bg-[#1e293b] rounded-lg p-4 flex items-center justify-between text-white font-mono text-sm">
                                    <span>https://api.farmledge.gov.in/v1</span>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={copyToClipboard}>
                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </section>

                            {/* Authentication */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Authenticate your requests by including your API key in the header of every request. You can manage your API keys in the developer dashboard.
                                </p>
                                <Card className="bg-slate-50 border-slate-200">
                                    <CardContent className="p-4 font-mono text-sm text-slate-700">
                                        Authorization: Bearer YOUR_API_KEY
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Endpoints */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Core Endpoints</h2>
                                
                                <div className="space-y-6">
                                    {/* Get Batch */}
                                    <Card className="border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                                            <Badge className="bg-blue-600 hover:bg-blue-700">GET</Badge>
                                            <span className="font-mono text-sm font-medium text-gray-700">/batches/{`{id}`}</span>
                                        </div>
                                        <CardContent className="p-6">
                                            <p className="text-gray-600 mb-4">Retrieves detailed information about a specific produce batch, including its entire blockchain history.</p>
                                            <div className="bg-[#1e293b] rounded p-4 overflow-x-auto">
                                                <pre className="text-green-400 text-xs font-mono">
{`{
  "id": "BATCH-123",
  "crop": "Rice",
  "farmer": "Ramesh Kumar",
  "status": "Verified",
  "journey": [...]
}`}
                                                </pre>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Get Storage */}
                                    <Card className="border-gray-200 overflow-hidden">
                                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-3">
                                            <Badge className="bg-blue-600 hover:bg-blue-700">GET</Badge>
                                            <span className="font-mono text-sm font-medium text-gray-700">/storage/search</span>
                                        </div>
                                        <CardContent className="p-6">
                                            <p className="text-gray-600 mb-4">Search for available storage facilities based on district and type.</p>
                                            <div className="text-sm text-gray-500 mb-2">Query Parameters:</div>
                                            <div className="flex gap-2 mb-4">
                                                <Badge variant="outline">district</Badge>
                                                <Badge variant="outline">type</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ApiDocs;
