import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, User, Building2, MapPin, Mail, Phone } from "lucide-react";

import odishaLogo from "@/assets/odisha-logo.jpg";

const About = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-700 flex flex-col">
            <Navigation />
            
            <main className="flex-grow">
                 {/* Page Header */}
                 <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                            <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>About Us</span>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-[#064e3b]">About The Department</h1>
                        <p className="text-gray-600 mt-2 max-w-3xl">Serving the farmers of Odisha with dedication, transparency, and innovation.</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                     <div className="grid md:grid-cols-12 gap-10">
                         {/* Sidebar */}
                         <div className="md:col-span-3 space-y-6">
                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-sm">
                                <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">About Us</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="font-bold text-emerald-700">About Department</li>
                                    <li className="text-gray-600 hover:text-emerald-700 cursor-pointer" onClick={() => document.getElementById('vision-mission')?.scrollIntoView({ behavior: 'smooth' })}>Vision & Mission</li>
                                    <li><Link to="/structure" className="text-gray-600 hover:text-emerald-700 block">Organizational Chart</Link></li>
                                    <li><Link to="/directory" className="text-gray-600 hover:text-emerald-700 block">Who's Who</Link></li>
                                    <li className="text-gray-600 hover:text-emerald-700 cursor-pointer" onClick={() => document.getElementById('awards')?.scrollIntoView({ behavior: 'smooth' })}>Awards & Achievements</li>
                                </ul>
                            </div>
                         </div>

                         {/* Content */}
                         <div className="md:col-span-9">
                             <div className="prose max-w-none text-gray-700">
                                 <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Department Profile</h2>
                                 <p className="mb-4 text-justify">
                                     Agriculture plays a vital role in Odisha's economy. The Department of Agriculture and Farmers' Empowerment, Government of Odisha, acts as the nodal agency for the development of agriculture in the state. Our primary objective is to increase agricultural production and productivity through the transfer of improved technology, availability of quality inputs, and efficient extension services.
                                 </p>
                                 
                                 <div id="vision-mission" className="grid md:grid-cols-2 gap-8 my-8 scroll-mt-24">
                                     <Card className="rounded-none border-t-4 border-t-blue-600 shadow-sm bg-blue-50">
                                         <CardContent className="p-6">
                                             <h3 className="text-xl font-bold text-blue-800 mb-2">Our Vision</h3>
                                             <p className="text-sm">To make agriculture sustainable and profitable, ensuring food security and improving the socio-economic status of farmers.</p>
                                         </CardContent>
                                     </Card>
                                     <Card className="rounded-none border-t-4 border-t-green-600 shadow-sm bg-green-50">
                                         <CardContent className="p-6">
                                             <h3 className="text-xl font-bold text-green-800 mb-2">Our Mission</h3>
                                             <p className="text-sm">Empowering farmers through technology, innovation, and direct benefit transfers, while ensuring soil health and environmental sustainability.</p>
                                         </CardContent>
                                     </Card>
                                 </div>

                                 <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 mt-8">Key Functions</h3>
                                 <ul className="list-disc pl-5 space-y-2 mb-8">
                                     <li>Formulation and implementation of agricultural policies and programs.</li>
                                     <li>Distribution of quality seeds, fertilizers, and pesticides.</li>
                                     <li>Promotion of farm mechanization and modern farming techniques.</li>
                                     <li>Implementation of welfare schemes like KALIA and PM-KISAN.</li>
                                     <li>Marketing support and price stabilization for agricultural produce (e.g. FarmLedge initiative).</li>
                                 </ul>

                                 <Separator className="my-8" />

                                 <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Administrative Setup</h3>
                                 <div className="flex flex-col md:flex-row gap-6 items-start">
                                      <img src={odishaLogo} alt="Odisha Logo" className="w-24 opacity-80" />
                                      <div>
                                          <p className="mb-2">The Department is headed by the Principal Secretary, assisted by the Director of Agriculture & Food Production, Director of Horticulture, and Director of Soil Conservation & Watershed Development.</p>
                                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mt-4">
                                               <h4 className="font-bold text-yellow-800 mb-2 text-sm uppercase">Contact Secretariat</h4>
                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                   <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-yellow-600" /> Krushi Bhavan, Bhubaneswar</div>
                                                   <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-yellow-600" /> 0674-2395532</div>
                                                   <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-yellow-600" /> agrsec.or@nic.in</div>
                                               </div>
                                          </div>
                                      </div>
                                 </div>

                                 <Separator className="my-8" />

                                 <div id="awards" className="scroll-mt-24">
                                     <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Awards & Recognitions</h3>
                                     <div className="space-y-4">
                                        <div className="flex gap-4 items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="bg-yellow-500 text-white p-2 rounded-full font-bold text-xs shrink-0">2025</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Agriculture Leadership Award</h4>
                                                <p className="text-sm text-gray-700 mt-1">Conferred at the 16th Agriculture Leadership Conclave for excellence in agricultural innovation and farmer empowerment.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <div className="bg-emerald-600 text-white p-2 rounded-full font-bold text-xs shrink-0">2023</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Poshak Anaj Award</h4>
                                                <p className="text-sm text-gray-700 mt-1">Recognized as the "Best Millet Promoting State" by ICAR and FAO for outstanding efforts in the Odisha Millet Mission.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="bg-blue-500 text-white p-2 rounded-full font-bold text-xs shrink-0">2022</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">Top Production Rankings</h4>
                                                <p className="text-sm text-gray-700 mt-1">Ranked 1st in Sweet Potato & Mushroom production, and 2nd in Brinjal & Cabbage production nationally.</p>
                                            </div>
                                        </div>
                                     </div>
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

export default About;
