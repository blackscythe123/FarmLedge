import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Tenders = () => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState("Active");

    const tenders = [
        { id: "T-2024-001", title: "Supply of 5000 MT Urea for Kharif Season", dept: "Directorate of Agriculture", date: "15 Dec 2024", status: "Active" },
        { id: "T-2024-002", title: "Construction of Cold Storage at Balasore", dept: "APICOL", date: "20 Dec 2024", status: "Active" },
        { id: "T-2024-003", title: "Procurement of IoT Sensors for Smart Farming Pilot", dept: "FarmLedge / Govt JV", date: "22 Dec 2024", status: "New" },
        { id: "T-2024-004", title: "Hiring of Vehicles for District Agriculture Officers", dept: "DAO Cuttack", date: "10 Dec 2024", status: "Closed" },
        { id: "T-2023-098", title: "Supply of HDPE Pipes for Irrigation", dept: "OAIC", date: "01 Nov 2024", status: "Closed" },
        { id: "T-2024-005", title: "Empanelment of Agencies for Soil Testing", dept: "Soil Directorate", date: "25 Dec 2024", status: "New" },
    ];

    const filteredTenders = tenders.filter(t => {
        if (filter === "Active") return t.status === "Active" || t.status === "New";
        if (filter === "Archived") return t.status === "Closed";
        if (filter === "New") return t.status === "New";
        return true; // All
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-700 flex flex-col">
            <Navigation />
            
            <main className="flex-grow">
                {/* Page Header */}
                <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                            <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Tenders & Notifications</span>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Tenders & Procurement</h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">Transparency in procurement is our priority. View active tenders, download documents, and check status.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                     <div className="grid md:grid-cols-12 gap-6">
                        {/* Sidebar */}
                        <div className="md:col-span-3">
                            <Card className="rounded-none border-t-4 border-t-[#fbbf24] shadow-sm">
                                <CardContent className="p-0">
                                    <div className="p-4 bg-gray-50 font-bold border-b border-gray-100">Filter By</div>
                                    <ul className="text-sm">
                                        <li 
                                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-emerald-50 ${filter === 'Active' ? 'text-emerald-700 font-medium border-l-4 border-l-emerald-600 bg-emerald-50' : 'text-gray-600'}`}
                                            onClick={() => setFilter("Active")}
                                        >
                                            Active Tenders
                                        </li>
                                        <li 
                                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-emerald-50 ${filter === 'Archived' ? 'text-emerald-700 font-medium border-l-4 border-l-emerald-600 bg-emerald-50' : 'text-gray-600'}`}
                                            onClick={() => setFilter("Archived")}
                                        >
                                            Archived Tenders
                                        </li>
                                        <li className="p-3 border-b border-gray-100 hover:bg-emerald-50 cursor-pointer text-gray-600 opacity-50 cursor-not-allowed">Corrigendum</li>
                                        <li className="p-3 hover:bg-emerald-50 cursor-pointer text-gray-600 opacity-50 cursor-not-allowed">Results</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="mt-6 rounded-none border-t-4 border-t-[#047857] shadow-sm bg-[#f0fdf4]">
                                <CardContent className="p-4">
                                     <h3 className="font-bold text-emerald-800 mb-2">Help Desk</h3>
                                     <p className="text-xs text-gray-600 mb-4">For technical issues related to e-Procurement portal.</p>
                                     <div className="text-sm font-bold text-gray-800">1800-345-6789</div>
                                     <div className="text-xs text-gray-500">support-eproc@odisha.gov.in</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-9">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">{filter} Tenders</h2>
                                <Badge variant="outline">{filteredTenders.length} Found</Badge>
                            </div>

                            <div className="space-y-4">
                                {filteredTenders.length > 0 ? filteredTenders.map((tender, i) => (
                                    <Card key={i} className="hover:shadow-md transition-shadow border-gray-200">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Badge variant="outline" className="border-gray-300 text-gray-600 rounded-none font-mono text-xs">{tender.id}</Badge>
                                                        <Badge className={`${tender.status === 'Active' || tender.status === 'New' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} border-none rounded-sm px-2 py-0.5 text-xs font-bold uppercase`}>
                                                            {tender.status}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 hover:text-emerald-700 cursor-pointer transition-colors">
                                                        {tender.title}
                                                        {tender.status === 'New' && <span className="ml-2 text-xs text-red-500 animate-pulse font-bold">NEW</span>}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {tender.dept}</span>
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Closing Date: <span className="text-gray-900 font-medium">{tender.date}</span></span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0 md:w-32">
                                                    <Button size="sm" className="w-full bg-[#047857] hover:bg-[#065f46]">
                                                        <Download className="w-4 h-4 mr-2" /> PDF
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="w-full">
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="text-center py-10 bg-gray-50 border border-dashed rounded">
                                        <p className="text-gray-500">No tenders found in this category.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Tenders;
