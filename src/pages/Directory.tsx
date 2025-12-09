import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Phone, Mail, Search, Printer } from "lucide-react";
import { useState } from "react";

const Directory = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const contacts = [
        { name: "Principal Secretary", designations: "Principal Secretary to Govt.", office: "0674-2391325", email: "agrsec.or@od.gov.in" },
        { name: "Director of Agriculture", designations: "Director, Agriculture & Food Production", office: "0674-2395532", email: "diragri.or@nic.in" },
        { name: "Director of Horticulture", designations: "Director, Horticulture", office: "0674-2391831", email: "dirhort.or@nic.in" },
        { name: "Director, Soil Conservation", designations: "Director, Soil Conservation & Watershed", office: "0674-2391840", email: "dirsoil.or@nic.in" },
        { name: "Chief Engineer", designations: "Chief Engineer (Agriculture)", office: "0674-2914411", email: "ceagri.or@nic.in" },
        { name: "Dr. S. P. Parida", designations: "Jt. Director (Statistics) & Nodal Officer", office: "0674-2391124", email: "jdagristat@nic.in" },
        { name: "Krushi Samrudhi Helpline", designations: "Farmer Helpline (Toll Free)", office: "155333", email: "helpdesk@krushi.com" },
        { name: "APICOL Head Office", designations: "APICOL", office: "0674-2354125", email: "apicol@nic.in" },
        { name: "OSSC Head Office", designations: "Odisha State Seeds Corp", office: "0674-2340170", email: "mdossc@nic.in" },
        { name: "OAIC Head Office", designations: "Odisha Agro Industries Corp", office: "0674-2311234", email: "oaic@nic.in" },
    ];

    const filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.designations.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                    <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Reach Us</span> <ArrowRight className="w-3 h-3" /> <span>Telephone Directory</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Telephone Directory</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Contact details of key officials and directorates of the Department of Agriculture.</p>
            </div>
        </div>

        <div className="container mx-auto px-4 py-8">
            <Card className="border-t-4 border-t-emerald-600 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search by name or designation..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                            <Printer className="w-4 h-4" /> Print List
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-bold text-gray-900">Name / Designation</TableHead>
                                    <TableHead className="font-bold text-gray-900">Office</TableHead>
                                    <TableHead className="font-bold text-gray-900">Email</TableHead>
                                    <TableHead className="text-right font-bold text-gray-900">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContacts.map((contact, index) => (
                                    <TableRow key={index} className="hover:bg-emerald-50/50">
                                        <TableCell>
                                            <div className="font-bold text-gray-800">{contact.name}</div>
                                            <div className="text-xs text-gray-500 uppercase">{contact.designations}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-emerald-600" /> {contact.office}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {contact.email !== "-" && (
                                                <div className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                                                    <Mail className="w-3 h-3" /> {contact.email}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100">
                                                View Profile
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Directory;
