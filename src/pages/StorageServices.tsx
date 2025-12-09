import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, BookOpen, MapPin, AlertCircle, FileText, Phone, Mail, Clock, IndianRupee, Navigation as NavigationIcon, Loader2, Map, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

// Type definition for storage facility
type StorageFacility = {
  id: number;
  name: string;
  type: string;
  district: string;
  address: string;
  capacity: string;
  available: string;
  rate: string;
  contact: string;
  email: string;
  lat: number;
  lon: number;
  features: string[];
  distance?: number; // Optional distance in km
};

// Dummy storage facility data with coordinates (20 facilities across Odisha)
const STORAGE_FACILITIES: StorageFacility[] = [
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
    lat: 20.4625,
    lon: 85.8830,
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
    lat: 20.2961,
    lon: 85.8245,
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
    lat: 21.4934,
    lon: 86.9339,
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
    lat: 21.4669,
    lon: 83.9812,
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
    lat: 19.8135,
    lon: 85.8312,
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
    lat: 22.2604,
    lon: 84.8536,
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
    lat: 19.3150,
    lon: 84.7941,
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
    lat: 21.9347,
    lon: 86.7336,
    features: ["Subsidized rates", "Quick rental", "Local access", "Small farmer friendly"]
  },
  {
    id: 9,
    name: "Angul District Warehouse",
    type: "Warehouse",
    district: "Angul",
    address: "Nalco Area, Angul 759122",
    capacity: "3200 MT",
    available: "1100 MT",
    rate: "₹145/quintal/month",
    contact: "+91-6764-230890",
    email: "angul.warehouse@gmail.com",
    lat: 20.8400,
    lon: 85.1025,
    features: ["Industrial zone", "Good connectivity", "Backup power", "Round the clock access"]
  },
  {
    id: 10,
    name: "Jajpur Cold Storage Facility",
    type: "Cold Storage",
    district: "Jajpur",
    address: "Vyasanagar, Jajpur 755019",
    capacity: "2800 MT",
    available: "950 MT",
    rate: "₹420/quintal/month",
    contact: "+91-6726-220456",
    email: "jajpur.coldstorage@yahoo.in",
    lat: 20.8507,
    lon: 86.3290,
    features: ["Multi-temperature zones", "Quick freezing", "Quality certification", "Transport support"]
  },
  {
    id: 11,
    name: "Kendrapara Farmers Godown",
    type: "Godown",
    district: "Kendrapara",
    address: "Market Complex, Kendrapara 754211",
    capacity: "450 MT",
    available: "180 MT",
    rate: "₹75/quintal/month",
    contact: "+91-6727-232567",
    email: "kendrapara.godown@coop.org",
    lat: 20.5023,
    lon: 86.4245,
    features: ["Coastal access", "Fish storage", "Low rates", "Community owned"]
  },
  {
    id: 12,
    name: "Jharsuguda Industrial Warehouse",
    type: "Warehouse",
    district: "Jharsuguda",
    address: "Belpahar, Jharsuguda 768217",
    capacity: "4500 MT",
    available: "1800 MT",
    rate: "₹165/quintal/month",
    contact: "+91-6645-270123",
    email: "jharsuguda.warehouse@outlook.com",
    lat: 21.8531,
    lon: 84.0363,
    features: ["Near railway", "Loading bay", "Security system", "Proper ventilation"]
  },
  {
    id: 13,
    name: "Koraput Tribal Storage Center",
    type: "Godown",
    district: "Koraput",
    address: "Jeypore Road, Koraput 764020",
    capacity: "350 MT",
    available: "140 MT",
    rate: "₹55/quintal/month",
    contact: "+91-6852-250234",
    email: "koraput.tribal@gmail.com",
    lat: 18.8137,
    lon: 82.7111,
    features: ["Tribal welfare", "Low cost", "Organic certified", "Traditional methods"]
  },
  {
    id: 14,
    name: "Bargarh Agro Warehouse",
    type: "Warehouse",
    district: "Bargarh",
    address: "Ambabhona, Bargarh 768028",
    capacity: "3800 MT",
    available: "1400 MT",
    rate: "₹155/quintal/month",
    contact: "+91-6646-230678",
    email: "bargarh.agro@rediffmail.com",
    lat: 21.3333,
    lon: 83.6189,
    features: ["Rice hub", "Modern facility", "Weighbridge", "Quality check"]
  },
  {
    id: 15,
    name: "Bhadrak Cold Chain Hub",
    type: "Cold Storage",
    district: "Bhadrak",
    address: "Charampa, Bhadrak 756100",
    capacity: "2200 MT",
    available: "700 MT",
    rate: "₹380/quintal/month",
    contact: "+91-6784-251234",
    email: "bhadrak.coldchain@gmail.com",
    lat: 21.0542,
    lon: 86.4956,
    features: ["Vegetable storage", "Pre-cooling", "Sorting facility", "Direct market link"]
  },
  {
    id: 16,
    name: "Dhenkanal Storage Complex",
    type: "Warehouse",
    district: "Dhenkanal",
    address: "Kamakhyanagar, Dhenkanal 759018",
    capacity: "2900 MT",
    available: "1000 MT",
    rate: "₹135/quintal/month",
    contact: "+91-6762-270345",
    email: "dhenkanal.storage@nic.in",
    lat: 20.9507,
    lon: 85.5966,
    features: ["Central location", "Good roads", "Power backup", "Fire safety"]
  },
  {
    id: 17,
    name: "Kalahandi Farmers Cooperative",
    type: "Godown",
    district: "Kalahandi",
    address: "Bhawanipatna, Kalahandi 766001",
    capacity: "400 MT",
    available: "160 MT",
    rate: "₹70/quintal/month",
    contact: "+91-6670-230456",
    email: "kalahandi.coop@yahoo.com",
    lat: 19.9068,
    lon: 83.1689,
    features: ["Farmer friendly", "Flexible terms", "Easy access", "Local management"]
  },
  {
    id: 18,
    name: "Nayagarh District Warehouse",
    type: "Warehouse",
    district: "Nayagarh",
    address: "Odagaon, Nayagarh 752081",
    capacity: "2600 MT",
    available: "850 MT",
    rate: "₹130/quintal/month",
    contact: "+91-6753-262789",
    email: "nayagarh.warehouse@gmail.com",
    lat: 20.1283,
    lon: 85.0963,
    features: ["Grain storage", "Pest control", "Insurance facility", "Good connectivity"]
  },
  {
    id: 19,
    name: "Rayagada Cold Storage",
    type: "Cold Storage",
    district: "Rayagada",
    address: "Gunupur Road, Rayagada 765001",
    capacity: "1800 MT",
    available: "600 MT",
    rate: "₹410/quintal/month",
    contact: "+91-6856-222345",
    email: "rayagada.cold@outlook.com",
    lat: 19.1664,
    lon: 83.4159,
    features: ["Fruit storage", "Temperature control", "Quick processing", "Transport available"]
  },
  {
    id: 20,
    name: "Jagatsinghpur Coastal Storage",
    type: "Warehouse",
    district: "Jagatsinghpur",
    address: "Paradip Port Area, Jagatsinghpur 754142",
    capacity: "5500 MT",
    available: "2200 MT",
    rate: "₹170/quintal/month",
    contact: "+91-6722-220890",
    email: "jagatsinghpur.storage@nic.in",
    lat: 20.3156,
    lon: 86.6890,
    features: ["Port connectivity", "Export facility", "Large capacity", "Modern infrastructure"]
  }
];

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [searchRadius, setSearchRadius] = useState(20); // km - default 20km radius

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
          // Fallback to Bhubaneswar coordinates
          setUserLocation({ lat: 20.2961, lon: 85.8245 });
        }
      );
    } else {
      // Fallback to Bhubaneswar coordinates
      setUserLocation({ lat: 20.2961, lon: 85.8245 });
    }
  }, []);

  // Filter and sort facilities by distance
  const filteredFacilities = STORAGE_FACILITIES.filter(facility => {
    const districtMatch = selectedDistrict === "All Districts" || facility.district === selectedDistrict;
    const typeMatch = selectedType === "All Types" || facility.type === selectedType;
    
    // Filter by distance if user location is available
    if (userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lon, facility.lat, facility.lon);
      return districtMatch && typeMatch && distance <= searchRadius;
    }
    
    return districtMatch && typeMatch;
  }).map(facility => {
    if (userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lon, facility.lat, facility.lon);
      return { ...facility, distance };
    }
    return facility;
  }).sort((a, b) => {
    if (a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return 0;
  });

  const handleFindStorage = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Navigation />
      
      {/* Hero Section with Images */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
                📦 {t('storage.badge')}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Find Storage <br/>
                <span className="text-yellow-300">Near You</span>
              </h1>
              <p className="text-green-50 text-xl mb-8 leading-relaxed">
                Locate nearby warehouses, cold storage, and godowns with real-time availability and competitive rates
              </p>
              
              {/* Location Status */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                {loadingLocation ? (
                  <>
                    <Loader2 className="h-5 w-5 text-yellow-300 animate-spin" />
                    <span className="text-white">Detecting your location...</span>
                  </>
                ) : userLocation ? (
                  <>
                    <NavigationIcon className="h-5 w-5 text-yellow-300" />
                    <span className="text-white">
                      📍 Location detected - Showing facilities within {searchRadius}km
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-yellow-300" />
                    <span className="text-white">Location services unavailable</span>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-transform">
                  <div className="bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-green-700" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Warehouses</h3>
                  <p className="text-green-100 text-sm">Modern storage facilities</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-transform">
                  <div className="bg-blue-400 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">24/7 Access</h3>
                  <p className="text-green-100 text-sm">Round the clock availability</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-transform">
                  <div className="bg-cyan-400 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-blue-700" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Nearby</h3>
                  <p className="text-green-100 text-sm">Find closest facilities</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-transform">
                  <div className="bg-pink-400 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <IndianRupee className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Affordable</h3>
                  <p className="text-green-100 text-sm">Best rates guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Storage Finder */}
          <Card className="p-6 bg-white shadow-xl border-green-200 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-green-600" />
              Find Storage Facilities Near You
            </h3>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select District</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Godown">Godown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius (km)</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                  <option value="30">30 km</option>
                  <option value="50">50 km (Max)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-[46px]" onClick={handleFindStorage}>
                  <NavigationIcon className="h-4 w-4 mr-2" />
                  Find Storage
                </Button>
              </div>
            </div>
          </Card>

          {/* Storage Results */}
          {showResults && (
            <>
              {/* View Toggle & Results Count */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Found {filteredFacilities.length} facilities
                  </h2>
                  {userLocation && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Within {searchRadius}km
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List View
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    className={viewMode === 'map' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                </div>
              </div>

              {/* Map View */}
              {viewMode === 'map' && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Map Container */}
                  <div className="md:col-span-2">
                    <Card className="p-6 bg-white shadow-lg h-[600px]">
                      <div className="relative h-full bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 rounded-lg overflow-hidden border-2 border-gray-300">
                        {/* Map Grid Background */}
                        <div className="absolute inset-0" style={{
                          backgroundImage: `
                            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                          `,
                          backgroundSize: '40px 40px'
                        }}></div>
                        
                        {/* Map Legend */}
                        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 z-30 border-2 border-gray-300">
                          <h4 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Legend</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-6 w-6 text-green-600 fill-green-400" />
                              <span className="text-sm font-medium text-gray-700">Warehouse</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-6 w-6 text-blue-600 fill-blue-400" />
                              <span className="text-sm font-medium text-gray-700">Cold Storage</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-6 w-6 text-orange-600 fill-orange-400" />
                              <span className="text-sm font-medium text-gray-700">Godown</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-6 w-6 text-red-600 fill-red-600" />
                              <span className="text-sm font-medium text-gray-700">Selected</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-blue-600 rounded-full p-1.5">
                                  <NavigationIcon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Your Location</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Center watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center opacity-30">
                            <Map className="h-24 w-24 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold text-xl">Odisha State</p>
                            <p className="text-sm text-gray-400 mt-1">Storage Facilities Distribution Map</p>
                          </div>
                        </div>
                        
                        {/* Facility Markers */}
                        {filteredFacilities.map((facility, index) => {
                          // Calculate position based on actual lat/lon relative to Odisha bounds
                          // Odisha bounds: lat 17.78°N - 22.57°N, lon 81.37°E - 87.53°E
                          const latPercent = ((facility.lat - 17.78) / (22.57 - 17.78)) * 100;
                          const lonPercent = ((facility.lon - 81.37) / (87.53 - 81.37)) * 100;
                          
                          return (
                            <div
                              key={facility.id}
                              className={`absolute cursor-pointer transform hover:scale-150 transition-all duration-200 ${
                                selectedFacility === facility.id ? 'z-20' : 'z-10'
                              }`}
                              style={{
                                left: `${Math.max(5, Math.min(90, lonPercent))}%`,
                                top: `${Math.max(5, Math.min(90, 100 - latPercent))}%`,
                              }}
                              onClick={() => setSelectedFacility(facility.id)}
                              title={`${facility.name} - ${facility.distance ? facility.distance.toFixed(1) + ' km' : ''}`}
                            >
                              <div className={`relative ${
                                selectedFacility === facility.id 
                                  ? 'animate-bounce' 
                                  : ''
                              }`}>
                                <MapPin 
                                  className={`h-12 w-12 drop-shadow-2xl filter ${
                                    selectedFacility === facility.id 
                                      ? 'text-red-600 fill-red-500' 
                                      : facility.type === 'Cold Storage'
                                      ? 'text-blue-600 fill-blue-400'
                                      : facility.type === 'Warehouse'
                                      ? 'text-green-600 fill-green-400'
                                      : 'text-orange-600 fill-orange-400'
                                  }`}
                                  style={{
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
                                  }}
                                />
                                {facility.distance && selectedFacility === facility.id && (
                                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-2xl text-sm font-bold whitespace-nowrap z-30 border-2 border-white">
                                    📍 {facility.distance.toFixed(1)} km
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-3 h-3 bg-gray-900 rotate-45 border-l-2 border-t-2 border-white"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* User Location Marker */}
                        {userLocation && (
                          <div 
                            className="absolute z-30"
                            style={{
                              left: `${Math.max(5, Math.min(90, ((userLocation.lon - 81.37) / (87.53 - 81.37)) * 100))}%`,
                              top: `${Math.max(5, Math.min(90, 100 - ((userLocation.lat - 17.78) / (22.57 - 17.78)) * 100))}%`,
                            }}
                          >
                            <div className="relative transform -translate-x-1/2 -translate-y-1/2">
                              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" style={{ width: '60px', height: '60px' }}></div>
                              <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-50" style={{ width: '60px', height: '60px' }}></div>
                              <div className="relative bg-blue-600 rounded-full p-4 shadow-2xl border-4 border-white" style={{
                                filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.6))'
                              }}>
                                <NavigationIcon className="h-7 w-7 text-white" />
                              </div>
                            </div>
                            <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-5 py-3 rounded-xl text-base font-bold whitespace-nowrap shadow-2xl border-3 border-white" style={{
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                            }}>
                              📍 You are here
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rotate-45 border-l-3 border-t-3 border-white"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Selected Facility Details */}
                  <div className="md:col-span-1">
                    <Card className="p-6 bg-white shadow-lg sticky top-4">
                      {selectedFacility ? (
                        <>
                          {(() => {
                            const facility = filteredFacilities.find(f => f.id === selectedFacility);
                            if (!facility) return null;
                            return (
                              <>
                                <div className="flex items-start justify-between mb-4">
                                  <Badge className={
                                    `text-sm px-3 py-1 ${
                                    facility.type === 'Cold Storage' 
                                      ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                      : facility.type === 'Warehouse'
                                      ? 'bg-green-100 text-green-800 border-green-300'
                                      : 'bg-orange-100 text-orange-800 border-orange-300'
                                    }`
                                  }>
                                    {facility.type}
                                  </Badge>
                                  {facility.distance && (
                                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm px-3 py-1 font-bold">
                                      📍 {facility.distance.toFixed(1)} km
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{facility.name}</h3>
                                <p className="text-base text-gray-600 mb-4 leading-relaxed">{facility.address}</p>
                                
                                <div className="space-y-4 mb-5 bg-gray-50 rounded-lg p-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-base text-gray-600">Capacity:</span>
                                    <span className="font-bold text-lg text-gray-900">{facility.capacity}</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-green-50 -mx-4 px-4 py-2 rounded">
                                    <span className="text-base text-gray-700 font-medium">Available:</span>
                                    <span className="font-bold text-xl text-green-700">{facility.available}</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-blue-50 -mx-4 px-4 py-2 rounded">
                                    <span className="text-base text-gray-700 font-medium">Rate:</span>
                                    <span className="font-bold text-xl text-blue-700">{facility.rate}</span>
                                  </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                  <Button className="w-full bg-green-600 hover:bg-green-700 mb-3 py-3 text-base font-semibold">
                                    <Phone className="h-5 w-5 mr-2" />
                                    Call Now
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="w-full py-3 text-base font-semibold border-2"
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`, '_blank')}
                                  >
                                    <NavigationIcon className="h-5 w-5 mr-2" />
                                    Get Directions
                                  </Button>
                                </div>
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Click on a marker to view facility details</p>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="mb-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFacilities.map(facility => (
                      <Card 
                        key={facility.id} 
                        className={`p-6 hover:shadow-xl transition-all cursor-pointer ${
                          selectedFacility === facility.id ? 'ring-2 ring-green-500 shadow-xl' : ''
                        }`}
                        onClick={() => setSelectedFacility(facility.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xl font-bold text-gray-900 leading-tight pr-2">{facility.name}</h4>
                          <Badge className={`ml-2 flex-shrink-0 text-sm px-3 py-1 ${
                            facility.type === 'Cold Storage' 
                              ? 'bg-blue-100 text-blue-800 border-blue-300' 
                              : facility.type === 'Warehouse'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-orange-100 text-orange-800 border-orange-300'
                          }`}>
                            {facility.type}
                          </Badge>
                        </div>
                        
                        {/* Distance Badge */}
                        {facility.distance && (
                          <div className="mb-4">
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-base px-4 py-2 font-bold">
                              <NavigationIcon className="h-4 w-4 mr-2" />
                              {facility.distance.toFixed(1)} km away
                            </Badge>
                          </div>
                        )}
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-3 text-base">
                            <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{facility.address}</span>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                            <div className="flex items-center gap-3 text-base">
                              <Package className="w-5 h-5 text-amber-600" />
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Capacity:</span>
                                  <span className="font-bold text-gray-900">{facility.capacity}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-gray-600">Available:</span>
                                  <span className="font-bold text-green-700">{facility.available}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-green-600" />
                                <span className="text-base text-gray-600">Rate:</span>
                              </div>
                              <span className="font-bold text-lg text-green-700">{facility.rate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-base">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">{facility.contact}</span>
                          </div>
                          <div className="flex items-start gap-3 text-sm">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <span className="text-gray-600 break-all">{facility.email}</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3 mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {facility.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-3 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${facility.contact}`;
                            }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Now
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex-1 text-sm py-3 font-semibold border-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`, '_blank');
                            }}
                          >
                            <NavigationIcon className="h-4 w-4 mr-2" />
                            Directions
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
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
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => {
                  const element = document.getElementById('alternate-solutions');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
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
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('storage.storageBestPractices')}</h4>
                <p className="text-sm text-gray-700 mb-4">
                  {t('storage.storageDesc')}
                </p>
                
                {/* Storage Guidelines Examples */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
                  <h5 className="font-semibold text-gray-800 mb-3 text-sm">📋 Key Storage Guidelines:</h5>
                  <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-700">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Moisture Control:</strong> Keep humidity below 60% for grains</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Temperature:</strong> Maintain 15-20°C for paddy, wheat</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Ventilation:</strong> Ensure proper air circulation</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Pest Control:</strong> Regular fumigation every 3 months</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Cold Storage:</strong> 2-8°C for vegetables, 0-2°C for fruits</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Stacking:</strong> Leave 60cm space from walls</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Documentation:</strong> Maintain stock register daily</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Insurance:</strong> Get coverage within 7 days of storage</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commodity-Specific Guidelines */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
                  <h5 className="font-semibold text-gray-800 mb-3 text-sm">🌾 Commodity Storage Guide:</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Paddy Rice</span>
                      <span className="text-gray-600">12-14% moisture, 6-8 months safe storage</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Wheat</span>
                      <span className="text-gray-600">12% moisture, 10-12 months safe storage</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Pulses</span>
                      <span className="text-gray-600">9-10% moisture, 8-10 months safe storage</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium text-gray-700">Vegetables</span>
                      <span className="text-gray-600">Cold storage 2-8°C, 1-3 months duration</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-700">Fruits</span>
                      <span className="text-gray-600">Cold storage 0-4°C, 2-6 months duration</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    const guidelines = `STORAGE BEST PRACTICES GUIDE\n\n` +
                      `=== MOISTURE CONTROL ===\n` +
                      `• Keep humidity below 60% for grains\n` +
                      `• Use moisture meters regularly\n` +
                      `• Dry produce before storage\n\n` +
                      `=== TEMPERATURE MANAGEMENT ===\n` +
                      `• Paddy/Wheat: 15-20°C\n` +
                      `• Vegetables: 2-8°C\n` +
                      `• Fruits: 0-4°C\n\n` +
                      `=== PEST CONTROL ===\n` +
                      `• Fumigate every 3 months\n` +
                      `• Keep storage clean\n` +
                      `• Regular inspection\n\n` +
                      `=== COMMODITY STORAGE DURATION ===\n` +
                      `• Paddy: 12-14% moisture, 6-8 months\n` +
                      `• Wheat: 12% moisture, 10-12 months\n` +
                      `• Pulses: 9-10% moisture, 8-10 months\n` +
                      `• Vegetables: 1-3 months (cold storage)\n` +
                      `• Fruits: 2-6 months (cold storage)\n\n` +
                      `=== SAFETY GUIDELINES ===\n` +
                      `• Leave 60cm space from walls\n` +
                      `• Stack height max 4 meters\n` +
                      `• Maintain stock register\n` +
                      `• Get insurance within 7 days\n\n` +
                      `Contact: FarmLedge Support - support@farmledge.com`;
                    
                    const blob = new Blob([guidelines], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Storage_Guidelines_FarmLedge.txt';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t('storage.downloadGuidelines')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Alternate Use Cases Details */}
          <div id="alternate-solutions">
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
