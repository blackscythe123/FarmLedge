import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, User, Users, Network } from "lucide-react";

const Structure = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                    <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>About Department</span> <ArrowRight className="w-3 h-3" /> <span>Organizational Structure</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Organizational Structure</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Hierarchy of the Department of Agriculture & Farmers' Empowerment, Government of Odisha.</p>
            </div>
        </div>

        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                    {/* Level 1 */}
                    <Card className="w-80 border-t-4 border-t-emerald-600 shadow-md mb-8">
                        <CardContent className="p-6 text-center">
                            <h3 className="font-bold text-lg text-emerald-900">Hon'ble Minister</h3>
                            <p className="text-sm text-emerald-700 font-medium">Agriculture & Farmers' Empowerment</p>
                            <p className="text-xs text-gray-500 mt-1">Shri Kanak Vardhan Singh Deo</p>
                        </CardContent>
                    </Card>

                    <div className="h-8 w-0.5 bg-gray-300"></div>

                    {/* Level 2 */}
                    <Card className="w-80 border-t-4 border-t-emerald-500 shadow-md mb-8">
                        <CardContent className="p-6 text-center">
                            <h3 className="font-bold text-lg text-emerald-900">Principal Secretary</h3>
                            <p className="text-sm text-emerald-700 font-medium">Agri & FE Department</p>
                            <p className="text-xs text-gray-500 mt-1">I.A.S</p>
                        </CardContent>
                    </Card>

                    <div className="h-8 w-0.5 bg-gray-300"></div>
                    <div className="w-[80%] h-0.5 bg-gray-300 mb-8 relative">
                        <div className="absolute left-0 top-0 h-4 w-0.5 bg-gray-300"></div>
                        <div className="absolute right-0 top-0 h-4 w-0.5 bg-gray-300"></div>
                        <div className="absolute left-1/2 top-0 h-4 w-0.5 bg-gray-300 -ml-[1px]"></div>
                    </div>

                    {/* Level 3 - Directorates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {/* Directorate 1 */}
                        <div className="flex flex-col items-center">
                            <Card className="w-full border-t-4 border-t-amber-500 shadow-sm h-full">
                                <CardHeader className="bg-amber-50 pb-2">
                                    <CardTitle className="text-base text-amber-900 text-center">Directorate of Agriculture</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm font-bold text-gray-700">Director</p>
                                    <Separator className="my-2" />
                                    <ul className="text-xs text-left space-y-2 text-gray-600">
                                        <li>• Addl. Director (Extension)</li>
                                        <li>• Addl. Director (Engineering)</li>
                                        <li>• Joint Director (Admin)</li>
                                        <li>• Chief District Agri Officers (CDAO)</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                         {/* Directorate 2 */}
                         <div className="flex flex-col items-center">
                            <Card className="w-full border-t-4 border-t-blue-500 shadow-sm h-full">
                                <CardHeader className="bg-blue-50 pb-2">
                                    <CardTitle className="text-base text-blue-900 text-center">Directorate of Horticulture</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm font-bold text-gray-700">Director</p>
                                    <Separator className="my-2" />
                                    <ul className="text-xs text-left space-y-2 text-gray-600">
                                        <li>• Addl. Director (Hort)</li>
                                        <li>• Joint Director (Farms)</li>
                                        <li>• Deputy Director (Planning)</li>
                                        <li>• DDH (Districts)</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                         {/* Directorate 3 */}
                         <div className="flex flex-col items-center">
                            <Card className="w-full border-t-4 border-t-green-500 shadow-sm h-full">
                                <CardHeader className="bg-green-50 pb-2">
                                    <CardTitle className="text-base text-green-900 text-center">Soil Conservation</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-center">
                                    <p className="text-sm font-bold text-gray-700">Director (Watershed Mission)</p>
                                    <Separator className="my-2" />
                                    <ul className="text-xs text-left space-y-2 text-gray-600">
                                        <li>• Addl. Director (Soil)</li>
                                        <li>• Joint Director (Engineering)</li>
                                        <li>• Project Directors (Watersheds)</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-emerald-500 pl-4">Autonomous Bodies & corporations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            "Odisha State Seeds Corp. (OSSC)",
                            "Odisha Agro Industries Corp. (OAIC)",
                            "APICOL",
                            "State Seed Certification Agency",
                            "IMAGE",
                            "Odisha Cashew Dev. Corp."
                        ].map((body, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-200 p-4 rounded flex items-center gap-3 hover:shadow-md transition-shadow">
                                <Network className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium text-gray-700 text-sm">{body}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Structure;
