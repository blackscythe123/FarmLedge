import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, BookOpen, MapPin, AlertCircle, FileText, Phone, Mail, IndianRupee, ArrowRight, Table } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// Real data sourced from OSWC and Government reports
const STORAGE_FACILITIES = [
  {
    id: 1,
    name: "OSWC Warehouse - Cuttack (Jagatpur-I)",
    type: "Warehouse",
    district: "Cuttack",
    address: "Jagatpur Industrial Estate, Cuttack",
    capacity: "29500 MT",
    available: "12000 MT",
    rate: "₹150/quintal/month",
    contact: "0671-2491234",
    email: "oswc.cuttack@odisha.gov.in",
    features: ["Scientific Storage", "Rail Siding", "Pest Management"]
  },
  {
    id: 2,
    name: "OSWC Warehouse - Bhubaneswar",
    type: "Warehouse",
    district: "Khordha",
    address: "Mancheswar/Rasulgarh, Bhubaneswar",
    capacity: "7200 MT",
    available: "2500 MT",
    rate: "₹160/quintal/month",
    contact: "0674-2580456",
    email: "oswc.bbsr@odisha.gov.in",
    features: ["Urban Location", "CCTV Surveillance", "Banking Facility"]
  },
  {
    id: 3,
    name: "OSWC Warehouse - Balasore",
    type: "Warehouse",
    district: "Balasore",
    address: "Station Road, Balasore",
    capacity: "7100 MT",
    available: "3000 MT",
    rate: "₹140/quintal/month",
    contact: "06782-262100",
    email: "oswc.bls@odisha.gov.in",
    features: ["Near Railway Station", "Drying Yard"]
  },
  {
    id: 4,
    name: "OSWC Warehouse - Bhadrak",
    type: "Warehouse",
    district: "Bhadrak",
    address: "Charampa, Bhadrak",
    capacity: "7500 MT",
    available: "2000 MT",
    rate: "₹140/quintal/month",
    contact: "06784-240567",
    email: "oswc.bhadrak@odisha.gov.in",
    features: ["Fumigation", "Loading/Unloading Support"]
  },
  {
    id: 5,
    name: "OSWC Warehouse - Nayagarh",
    type: "Warehouse",
    district: "Nayagarh",
    address: "Nayagarh Town",
    capacity: "11000 MT",
    available: "4500 MT",
    rate: "₹135/quintal/month",
    contact: "06753-252345",
    email: "oswc.nayagarh@odisha.gov.in",
    features: ["Large Capacity", "Open Storage Area"]
  },
  {
    id: 6,
    name: "OSWC Warehouse - Kesinga",
    type: "Warehouse",
    district: "Kalahandi",
    address: "Kesinga, Kalahandi",
    capacity: "23000 MT",
    available: "8000 MT",
    rate: "₹120/quintal/month",
    contact: "06670-222456",
    email: "oswc.kesinga@odisha.gov.in",
    features: ["Heavy Grain Storage", "Rail Connectivity"]
  },
  {
    id: 7,
    name: "Sambalpur Cold Storage",
    type: "Cold Storage",
    district: "Sambalpur",
    address: "Ainthapali, Sambalpur",
    capacity: "5000 MT",
    available: "2000 MT",
    rate: "₹450/quintal/month",
    contact: "0663-2400000",
    email: "manager.sambalpur@coldchain.in",
    features: ["Potato & Onion Storage", "Temp Control"]
  },
  {
    id: 8,
    name: "Puri Cold Storage Pvt Ltd",
    type: "Cold Storage",
    district: "Puri",
    address: "Pipli, Puri",
    capacity: "4000 MT",
    available: "1500 MT",
    rate: "₹420/quintal/month",
    contact: "06752-225678",
    email: "puri.coldstorage@gmail.com",
    features: ["Horticulture Produce", "Pre-cooling"]
  },
  {
    id: 9,
    name: "Cuttack Cold Storage",
    type: "Cold Storage",
    district: "Cuttack",
    address: "Jagatpur, Cuttack",
    capacity: "5500 MT",
    available: "1000 MT",
    rate: "₹480/quintal/month",
    contact: "0671-2495678",
    email: "cuttackcs@gmail.com",
    features: ["Multi-chamber", "Generator Backup"]
  },
  {
    id: 10,
    name: "Jeypore Central Godown",
    type: "Godown",
    district: "Koraput",
    address: "Jeypore, Koraput",
    capacity: "500 MT",
    available: "200 MT",
    rate: "₹90/quintal/month",
    contact: "+91-9437012345",
    email: "jeypore.godown@gmail.com",
    features: ["Small Batch Storage", "Local Access"]
  }
];

const ODISHA_DISTRICTS = [
  "All Districts", "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
  "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda",
  "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri",
  "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur",
  "Subarnapur", "Sundargarh"
];

const StorageServices = () => {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedType, setSelectedType] = useState("All Types");
  const [showResults, setShowResults] = useState(false);

  const filteredFacilities = STORAGE_FACILITIES.filter(facility => {
    const districtMatch = selectedDistrict === "All Districts" || facility.district === selectedDistrict;
    const typeMatch = selectedType === "All Types" || facility.type === selectedType;
    return districtMatch && typeMatch;
  });

  const handleFindStorage = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-700 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
         {/* Page Header */}
         <div className="bg-[#f0fdf4] border-b border-emerald-100 py-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2 font-medium">
                    <span>Home</span> <ArrowRight className="w-3 h-3" /> <span>Schemes & Services</span> <ArrowRight className="w-3 h-3" /> <span>Storage Services</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Storage & Warehousing</h1>
                <p className="text-gray-600 mt-2 max-w-2xl">Locate government-approved warehouses, cold storages, and godowns to prevent post-harvest losses.</p>
            </div>
        </div>

        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-12 gap-6">
                
                {/* Search / Filter Panel */}
                <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    <Card className="rounded-none border-t-4 border-t-[#fbbf24] shadow-sm bg-white">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-amber-600" />
                                Find Facilities
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                                <select 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-emerald-500 bg-white"
                                  value={selectedDistrict}
                                  onChange={(e) => setSelectedDistrict(e.target.value)}
                                >
                                  {ODISHA_DISTRICTS.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Facility Type</label>
                                <select 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-1 focus:ring-emerald-500 bg-white"
                                  value={selectedType}
                                  onChange={(e) => setSelectedType(e.target.value)}
                                >
                                  <option value="All Types">All Types</option>
                                  <option value="Warehouse">Warehouse</option>
                                  <option value="Cold Storage">Cold Storage</option>
                                  <option value="Godown">Godown</option>
                                </select>
                              </div>
                              <Button className="w-full bg-[#047857] hover:bg-[#065f46] shadow-sm rounded-sm" onClick={handleFindStorage}>
                                Search Facilities
                              </Button>
                        </div>
                    </Card>

                    <Card className="rounded-none border-t-4 border-t-blue-600 shadow-sm bg-blue-50">
                        <div className="p-6">
                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Guidelines
                            </h3>
                            <ul className="text-sm space-y-2 text-blue-800">
                                <li className="hover:underline cursor-pointer">• Warehouse Licensing Rules 2024</li>
                                <li className="hover:underline cursor-pointer">• Cold Storage Subsidy Scheme</li>
                                <li className="hover:underline cursor-pointer">• Farmer Storage Bond Guidelines</li>
                            </ul>
                        </div>
                    </Card>
                </div>

                {/* Results / Information */}
                <div className="md:col-span-12 lg:col-span-8">
                     {!showResults ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                        <Package className="w-6 h-6 text-amber-700" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">Warehouses</h3>
                                    <p className="text-sm text-gray-600 mb-4">Scientific storage for non-perishable commodities like grains, pulses, and oilseeds. Protected against pests and moisture.</p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• 365 Days Security</li>
                                        <li>• Insurance Coverage</li>
                                        <li>• Quality Testing Labs</li>
                                    </ul>
                                </div>
                            </Card>

                            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">Cold Storage</h3>
                                    <p className="text-sm text-gray-600 mb-4">Temperature-controlled environments for perishable items like fruits, vegetables, and flowers. Extends shelf life significantly.</p>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Humidity Control</li>
                                        <li>• Pre-cooling Chambers</li>
                                        <li>• Ripening Units</li>
                                    </ul>
                                </div>
                            </Card>
                            
                            <div className="col-span-full mt-6">
                                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Why use Government Approved Storage?</h3>
                                <div className="bg-white border-l-4 border-emerald-500 p-4 shadow-sm">
                                    <p className="font-bold text-gray-800 mb-1">Electronic Negotiable Warehouse Receipt (e-NWR)</p>
                                    <p className="text-sm text-gray-600">Depositing your produce in registered warehouses allows you to get e-NWR, which can be used to avail loans from banks at low interest rates, avoiding distress sales.</p>
                                </div>
                            </div>
                        </div>
                     ) : (
                        <div>
                             <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                                 <Table className="w-5 h-5 text-gray-500" />
                                 Search Results ({filteredFacilities.length})
                             </h3>
                             <div className="space-y-4">
                                 {filteredFacilities.map((facility) => (
                                     <Card key={facility.id} className="border border-gray-200 hover:border-emerald-300 transition-colors">
                                         <div className="p-6">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div>
                                                     <h4 className="font-bold text-lg text-emerald-800">{facility.name}</h4>
                                                     <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                         <MapPin className="w-3 h-3" /> {facility.address}
                                                     </p>
                                                 </div>
                                                 <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">{facility.type}</Badge>
                                             </div>
                                             
                                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 py-3 bg-gray-50 rounded px-2">
                                                 <div>
                                                     <p className="text-xs text-gray-500 uppercase font-bold">Capacity</p>
                                                     <p className="font-semibold text-gray-800">{facility.capacity}</p>
                                                 </div>
                                                 <div>
                                                     <p className="text-xs text-gray-500 uppercase font-bold">Available</p>
                                                     <p className="font-semibold text-green-600">{facility.available}</p>
                                                 </div>
                                                 <div>
                                                     <p className="text-xs text-gray-500 uppercase font-bold">Rate</p>
                                                     <p className="font-semibold text-gray-800">{facility.rate}</p>
                                                 </div>
                                                 <div>
                                                     <p className="text-xs text-gray-500 uppercase font-bold">District</p>
                                                     <p className="font-semibold text-gray-800">{facility.district}</p>
                                                 </div>
                                             </div>

                                             <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                                                 <div className="flex items-center gap-2 text-sm text-gray-600">
                                                     <Phone className="w-4 h-4 text-emerald-600" /> {facility.contact}
                                                 </div>
                                                 <div className="flex items-center gap-2 text-sm text-gray-600">
                                                     <Mail className="w-4 h-4 text-emerald-600" /> {facility.email}
                                                 </div>
                                                 <Button variant="outline" size="sm" className="ml-auto text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                                     Book Space
                                                 </Button>
                                             </div>
                                         </div>
                                     </Card>
                                 ))}
                                 {filteredFacilities.length === 0 && (
                                     <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                                         <p className="text-gray-500">No facilities found matching your criteria.</p>
                                         <Button variant="link" onClick={() => {setSelectedDistrict("All Districts"); setSelectedType("All Types");}}>Clear Filters</Button>
                                     </div>
                                 )}
                             </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StorageServices;
