import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, BookOpen, MapPin, AlertCircle, FileText, Phone, Mail, Clock, IndianRupee } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// Dummy storage facility data
const STORAGE_FACILITIES = [
  {
    id: 1,
    name: "Odisha State Warehousing Corporation - Cuttack",
    type: "Warehouse",
    district: "Cuttack",
    address: "Badambadi, Cuttack, Odisha 753012",
    capacity: "5000 MT",
    available: "2000 MT",
    rate: "₹150/quintal/month",
    contact: "+91-671-2301234",
    email: "oswc.cuttack@gmail.com",
    features: ["Temperature controlled", "Pest management", "24/7 security", "Insurance available"]
  },
  {
    id: 2,
    name: "Central Warehousing Corporation - Bhubaneswar",
    type: "Warehouse",
    district: "Khordha",
    address: "Rasulgarh Industrial Estate, Bhubaneswar 751010",
    capacity: "8000 MT",
    available: "3500 MT",
    rate: "₹180/quintal/month",
    contact: "+91-674-2580123",
    email: "cwc.bbsr@nic.in",
    features: ["Scientific storage", "Quality testing", "Fumigation services", "Rail connectivity"]
  },
  {
    id: 3,
    name: "Krishna Cold Storage - Balasore",
    type: "Cold Storage",
    district: "Balasore",
    address: "Industrial Area, Balasore 756001",
    capacity: "3000 MT",
    available: "800 MT",
    rate: "₹400/quintal/month",
    contact: "+91-6782-262345",
    email: "krishnacold@yahoo.com",
    features: ["Temperature: -5°C to 15°C", "Humidity control", "Separate chambers", "Quality monitoring"]
  },
  {
    id: 4,
    name: "Sambalpur Agro Cold Chain",
    type: "Cold Storage",
    district: "Sambalpur",
    address: "Ainthapali, Sambalpur 768004",
    capacity: "2500 MT",
    available: "1200 MT",
    rate: "₹450/quintal/month",
    contact: "+91-663-2402567",
    email: "sambalpurcoldchain@gmail.com",
    features: ["Multi-commodity storage", "Pre-cooling facility", "Grading & sorting", "Transport facility"]
  },
  {
    id: 5,
    name: "Farmers Godown Cooperative - Puri",
    type: "Godown",
    district: "Puri",
    address: "Near Mandi, Puri 752001",
    capacity: "500 MT",
    available: "200 MT",
    rate: "₹80/quintal/month",
    contact: "+91-6752-223456",
    email: "purigodown@coop.org",
    features: ["Affordable rates", "Flexible terms", "Easy access", "Community managed"]
  },
  {
    id: 6,
    name: "Rourkela Storage Hub",
    type: "Warehouse",
    district: "Sundargarh",
    address: "Industrial Area, Rourkela 769042",
    capacity: "4000 MT",
    available: "1500 MT",
    rate: "₹160/quintal/month",
    contact: "+91-661-2401890",
    email: "rkl.storage@outlook.com",
    features: ["Modern infrastructure", "Digital monitoring", "Loan facility", "Direct market access"]
  },
  {
    id: 7,
    name: "Berhampur Agricultural Warehouse",
    type: "Warehouse",
    district: "Ganjam",
    address: "Gopalpur Road, Berhampur 760002",
    capacity: "3500 MT",
    available: "900 MT",
    rate: "₹140/quintal/month",
    contact: "+91-680-2221234",
    email: "berhampur.warehouse@rediffmail.com",
    features: ["Ventilation system", "Fire safety", "Weighing facility", "Loading dock"]
  },
  {
    id: 8,
    name: "Mayurbhanj Tribal Godown",
    type: "Godown",
    district: "Mayurbhanj",
    address: "Baripada Town, Mayurbhanj 757001",
    capacity: "300 MT",
    available: "150 MT",
    rate: "₹60/quintal/month",
    contact: "+91-6792-252345",
    email: "mayurbhanj.tribal@gmail.com",
    features: ["Subsidized rates", "Quick rental", "Local access", "Small farmer friendly"]
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/90 rounded-xl shadow-lg">
              <Package className="h-12 w-12 text-amber-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                {t('storage.badge')}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('storage.title')}
              </h1>
              <p className="text-amber-50 text-lg">
                {t('storage.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Storage Finder */}
          <Card className="p-6 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 border-amber-300 mb-8">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">Find Storage Facilities in Odisha</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select District</label>
                <select 
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {ODISHA_DISTRICTS.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Type</label>
                <select 
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Godown">Godown</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleFindStorage}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('storage.findStorageNear')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Storage Results */}
          {showResults && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Found {filteredFacilities.length} Storage Facilities
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFacilities.map(facility => (
                  <Card key={facility.id} className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 leading-tight">{facility.name}</h4>
                      <Badge className="ml-2 flex-shrink-0">{facility.type}</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span>Capacity: {facility.capacity} | Available: {facility.available}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-700">{facility.rate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>{facility.contact}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span className="break-all">{facility.email}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {facility.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">{t('storage.storageFacilities')}</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>{t('storage.storageFacilitiesDesc')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>{t('storage.coldStorage')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>{t('storage.realtimeAvail')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>{t('storage.qualityPreserve')}</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900">{t('storage.alternateUseCases')}</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t('storage.alternateDesc')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t('storage.organicFertilizer')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t('storage.animalFeed')}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t('storage.bioEnergy')}</span>
                </li>
              </ul>
              <Button className="w-full" variant="default">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('storage.exploreOptions')}
              </Button>
            </Card>
          </div>

          {/* Storage Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('storage.availableStorageTypes')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('storage.warehouses')}</h4>
                <p className="text-sm text-gray-600 mb-4">{t('storage.warehousesDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.temperatureControlled')}</li>
                  <li>• {t('storage.pestManagement')}</li>
                  <li>• {t('storage.insuranceCoverage')}</li>
                  <li>• {t('storage.security247')}</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('storage.coldStorageTitle')}</h4>
                <p className="text-sm text-gray-600 mb-4">{t('storage.coldStorageDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.controlledTemp')}</li>
                  <li>• {t('storage.humidityControl')}</li>
                  <li>• {t('storage.extendedShelf')}</li>
                  <li>• {t('storage.qualityPreservation')}</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('storage.godowns')}</h4>
                <p className="text-sm text-gray-600 mb-4">{t('storage.godownsDesc')}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.affordableRates')}</li>
                  <li>• {t('storage.flexibleDurations')}</li>
                  <li>• {t('storage.easyAccess')}</li>
                  <li>• {t('storage.communityBased')}</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Best Practices */}
          <Card className="p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-200 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('storage.storageBestPractices')}</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {t('storage.storageDesc')}
                </p>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('storage.downloadGuidelines')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Alternate Use Cases Details */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('storage.surplusProduceSolutions')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">{t('storage.valueAddition')}</h4>
                <p className="text-sm text-gray-700 mb-4">
                  {t('storage.valueAdditionDesc')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.fruitPulping')}</li>
                  <li>• {t('storage.vegPickling')}</li>
                  <li>• {t('storage.grainFlour')}</li>
                  <li>• {t('storage.dryFruit')}</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <h4 className="text-lg font-semibold text-green-900 mb-3">{t('storage.organicSolutions')}</h4>
                <p className="text-sm text-gray-700 mb-4">
                  {t('storage.organicSolutionsDesc')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.compostingServices')}</li>
                  <li>• {t('storage.vermicompostProd')}</li>
                  <li>• {t('storage.bioFertilizer')}</li>
                  <li>• {t('storage.greenManure')}</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">{t('storage.industrialUse')}</h4>
                <p className="text-sm text-gray-700 mb-4">
                  {t('storage.industrialUseDesc')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.bioFuelEthanol')}</li>
                  <li>• {t('storage.paperPulp')}</li>
                  <li>• {t('storage.pharmaApplications')}</li>
                  <li>• {t('storage.textileFiber')}</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <h4 className="text-lg font-semibold text-orange-900 mb-3">{t('storage.animalFeedTitle')}</h4>
                <p className="text-sm text-gray-700 mb-4">
                  {t('storage.animalFeedDesc')}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('storage.cattleFeed')}</li>
                  <li>• {t('storage.poultryFeed')}</li>
                  <li>• {t('storage.silagePrepare')}</li>
                  <li>• {t('storage.petFoodInd')}</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StorageServices;
