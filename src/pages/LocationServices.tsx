import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Users, FileText, Navigation as NavIcon, Search, Phone, Mail, Building, Loader2, X, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Location {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
}

interface Service {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email?: string;
  distance?: string;
  rating: number;
  services: string[];
  coordinates?: { lat: number; lng: number };
}

interface NetworkMember {
  id: string;
  name: string;
  role: string;
  location: string;
  crops?: string[];
  contact: string;
  verified: boolean;
  joinedDate: string;
}

const LocationServices = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [nearbyServices, setNearbyServices] = useState<Service[]>([]);
  const [showMapView, setShowMapView] = useState(false);
  const [showNetworkView, setShowNetworkView] = useState(false);
  const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>([]);

  // Mock network members data
  const mockNetworkMembers: NetworkMember[] = [
    {
      id: "1",
      name: "Rajesh Kumar",
      role: "Farmer",
      location: "Bhubaneswar, Odisha",
      crops: ["Rice", "Vegetables"],
      contact: "+91-9437012345",
      verified: true,
      joinedDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Sunita Patel",
      role: "Distributor",
      location: "Cuttack, Odisha",
      contact: "+91-9437098765",
      verified: true,
      joinedDate: "2024-03-20"
    },
    {
      id: "3",
      name: "Mahesh Sahoo",
      role: "Retailer",
      location: "Puri, Odisha",
      contact: "+91-9437067890",
      verified: true,
      joinedDate: "2024-02-10"
    },
    {
      id: "4",
      name: "Priya Mishra",
      role: "Farmer",
      location: "Berhampur, Odisha",
      crops: ["Turmeric", "Cashew"],
      contact: "+91-9437054321",
      verified: true,
      joinedDate: "2024-04-05"
    },
    {
      id: "5",
      name: "Anil Jena",
      role: "Cooperative",
      location: "Sambalpur, Odisha",
      contact: "+91-9437011111",
      verified: true,
      joinedDate: "2024-01-30"
    },
    {
      id: "6",
      name: "Kavita Nayak",
      role: "Verifier",
      location: "Bhubaneswar, Odisha",
      contact: "+91-9437022222",
      verified: true,
      joinedDate: "2024-05-12"
    }
  ];

  // Mock services data for Odisha
  const mockServices: Service[] = [
    {
      id: "1",
      name: "Krishi Vigyan Kendra, Bhubaneswar",
      type: "kvk",
      address: "OUAT Campus, Bhubaneswar, Odisha 751003",
      phone: "+91-674-2397780",
      email: "kvk.bbsr@ouat.ac.in",
      distance: "2.5 km",
      rating: 4.5,
      services: ["Soil Testing", "Training Programs", "Farm Advisory", "Demonstrations"],
      coordinates: { lat: 20.2961, lng: 85.8245 }
    },
    {
      id: "2",
      name: "State Soil Testing Laboratory",
      type: "lab",
      address: "Directorate of Agriculture, Bhubaneswar, Odisha",
      phone: "+91-674-2536071",
      email: "soillab.odisha@gov.in",
      distance: "3.8 km",
      rating: 4.2,
      services: ["Soil Analysis", "Water Testing", "Fertilizer Recommendation", "Soil Health Card"],
      coordinates: { lat: 20.2700, lng: 85.8400 }
    },
    {
      id: "3",
      name: "Farm Equipment Rental - AgriMech",
      type: "equipment",
      address: "Patia, Bhubaneswar, Odisha 751024",
      phone: "+91-9437012345",
      distance: "5.2 km",
      rating: 4.7,
      services: ["Tractor Rental", "Harvester", "Sprayer", "Seeder"],
      coordinates: { lat: 20.3500, lng: 85.8200 }
    },
    {
      id: "4",
      name: "Veterinary Dispensary, Unit-6",
      type: "veterinary",
      address: "Unit-6, Bhubaneswar, Odisha 751001",
      phone: "+91-674-2301234",
      distance: "1.8 km",
      rating: 4.3,
      services: ["Vaccination", "Treatment", "Emergency Care", "Consultation"],
      coordinates: { lat: 20.2800, lng: 85.8300 }
    },
    {
      id: "5",
      name: "Saheed Nagar APMC Yard",
      type: "market",
      address: "Saheed Nagar, Bhubaneswar, Odisha",
      phone: "+91-674-2543210",
      distance: "4.1 km",
      rating: 4.0,
      services: ["Vegetable Market", "Grain Market", "Wholesale", "Auction"],
      coordinates: { lat: 20.2950, lng: 85.8400 }
    },
    {
      id: "6",
      name: "Organic Farmers Market",
      type: "market",
      address: "Forest Park, Bhubaneswar, Odisha",
      phone: "+91-9437098765",
      distance: "6.5 km",
      rating: 4.6,
      services: ["Organic Produce", "Direct Selling", "Weekly Market", "Fresh Vegetables"],
      coordinates: { lat: 20.2600, lng: 85.8100 }
    }
  ];

  useEffect(() => {
    setNearbyServices(mockServices);
    setNetworkMembers(mockNetworkMembers);
  }, []);

  const getLocation = () => {
    setLoading(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get location details
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            setLocation({
              latitude,
              longitude,
              city: data.address.city || data.address.town || data.address.village || "Bhubaneswar",
              state: data.address.state || "Odisha"
            });
            
            toast.success("Location Detected", {
              description: `${data.address.city || "Bhubaneswar"}, ${data.address.state || "Odisha"}`
            });
            
            // Filter services based on location
            setNearbyServices(mockServices);
          } catch (error) {
            toast.error("Error fetching location details");
            setLocation({
              latitude,
              longitude,
              city: "Bhubaneswar",
              state: "Odisha"
            });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          toast.error("Location Access Denied", {
            description: "Please enable location services to find nearby facilities"
          });
        }
      );
    } else {
      setLoading(false);
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support geolocation"
      });
    }
  };

  const filterServices = () => {
    let filtered = mockServices;
    
    if (selectedService !== "all") {
      filtered = filtered.filter(s => s.type === selectedService);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const getDirections = (service: Service) => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${encodeURIComponent(service.address)}`;
      window.open(url, '_blank');
    } else {
      toast.error("Enable location first", {
        description: "Please enable location to get directions"
      });
    }
  };

  const callService = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'kvk': return '🎓';
      case 'lab': return '🔬';
      case 'equipment': return '🚜';
      case 'veterinary': return '🏥';
      case 'market': return '🏪';
      default: return '📍';
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'kvk': return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'lab': return 'from-purple-50 to-pink-50 border-purple-200';
      case 'equipment': return 'from-green-50 to-emerald-50 border-green-200';
      case 'veterinary': return 'from-orange-50 to-red-50 border-orange-200';
      case 'market': return 'from-amber-50 to-yellow-50 border-amber-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const openMapView = () => {
    if (!location) {
      toast.error("Enable location first", {
        description: "Please enable location to view map"
      });
      return;
    }
    setShowMapView(true);
  };

  const openNetworkView = () => {
    setShowNetworkView(true);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'farmer': return 'bg-green-100 text-green-700';
      case 'distributor': return 'bg-blue-100 text-blue-700';
      case 'retailer': return 'bg-purple-100 text-purple-700';
      case 'verifier': return 'bg-orange-100 text-orange-700';
      case 'cooperative': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-rose-700 via-pink-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/90 rounded-xl shadow-lg">
              <MapPin className="h-12 w-12 text-rose-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                Location-Based Services
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Connect with Local Agricultural Network
              </h1>
              <p className="text-rose-50 text-lg">
                Find and connect with nearby farmers, distributors, retailers, and service providers
              </p>
            </div>
          </div>

          {/* Location Status */}
          {location ? (
            <Card className="p-4 bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Location Detected</p>
                    <p className="text-sm text-gray-600">{location.city}, {location.state}</p>
                  </div>
                </div>
                <Button onClick={getLocation} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-white/95 backdrop-blur text-center">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-rose-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Location Access</h3>
              <p className="text-sm text-gray-600 mb-4">
                Allow location access to discover nearby services
              </p>
              <Button onClick={getLocation} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Enable Location
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search Services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search for services, facilities, or markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedService === "all" ? "default" : "outline"}
                onClick={() => setSelectedService("all")}
                size="sm"
              >
                All Services
              </Button>
              <Button
                variant={selectedService === "kvk" ? "default" : "outline"}
                onClick={() => setSelectedService("kvk")}
                size="sm"
              >
                KVKs
              </Button>
              <Button
                variant={selectedService === "lab" ? "default" : "outline"}
                onClick={() => setSelectedService("lab")}
                size="sm"
              >
                Labs
              </Button>
              <Button
                variant={selectedService === "equipment" ? "default" : "outline"}
                onClick={() => setSelectedService("equipment")}
                size="sm"
              >
                Equipment
              </Button>
              <Button
                variant={selectedService === "veterinary" ? "default" : "outline"}
                onClick={() => setSelectedService("veterinary")}
                size="sm"
              >
                Veterinary
              </Button>
              <Button
                variant={selectedService === "market" ? "default" : "outline"}
                onClick={() => setSelectedService("market")}
                size="sm"
              >
                Markets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Info Alert */}
          {!location && (
            <Alert className="mb-6 border-rose-200 bg-rose-50">
              <Info className="h-4 w-4 text-rose-600" />
              <AlertDescription className="text-rose-900">
                Enable location access to see accurate distances and get directions to nearby agricultural services.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nearby Services {location && `in ${location.city}`}
            </h2>
            <p className="text-gray-600">
              Found {filterServices().length} services near you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterServices().map((service) => (
              <Card
                key={service.id}
                className={`p-6 border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${getServiceColor(service.type)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getServiceIcon(service.type)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {service.distance}
                        </Badge>
                        <span className="text-sm text-amber-600">
                          ⭐ {service.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{service.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{service.phone}</span>
                  </div>
                  {service.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{service.email}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Services Offered:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.services.map((s, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => getDirections(service)}
                    className="flex-1"
                    size="sm"
                  >
                    <NavIcon className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                  <Button
                    onClick={() => callService(service.phone)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filterServices().length === 0 && (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-gradient-to-br from-rose-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Access Services
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 mx-auto mb-4 text-rose-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Network</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with 500+ farmers and stakeholders in Odisha
              </p>
              <Button variant="outline" className="w-full" onClick={openNetworkView}>
                View Network
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Map View</h3>
              <p className="text-sm text-gray-600 mb-4">
                View all services on interactive map
              </p>
              <Button variant="outline" className="w-full" onClick={openMapView}>
                Open Map
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <FileText className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access service reports and recommendations
              </p>
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Network View Dialog */}
      <Dialog open={showNetworkView} onOpenChange={setShowNetworkView}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-rose-600" />
              Agricultural Network in Odisha
            </DialogTitle>
            <DialogDescription>
              Connect with farmers, distributors, retailers, and other stakeholders in your region
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {networkMembers.map((member) => (
              <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{member.name}</h4>
                          {member.verified && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                            {member.role}
                          </Badge>
                          <span className="text-sm text-gray-600">{member.location}</span>
                        </div>
                      </div>
                    </div>

                    {member.crops && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Specialization:</p>
                        <div className="flex gap-1 flex-wrap">
                          {member.crops.map((crop, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.contact}
                      </div>
                      <div className="text-xs">
                        Joined: {new Date(member.joinedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={() => callService(member.contact)}>
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Join the Network</h4>
            <p className="text-sm text-gray-600 mb-3">
              Become part of Odisha's largest agricultural network and connect with stakeholders
            </p>
            <Button className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Request to Join Network
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map View Dialog */}
      <Dialog open={showMapView} onOpenChange={setShowMapView}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              Services Map View
            </DialogTitle>
            <DialogDescription>
              Interactive map showing all nearby agricultural services
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Embedded Map */}
            <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
              {location ? (
                <div className="w-full h-full">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.05},${location.latitude - 0.05},${location.longitude + 0.05},${location.latitude + 0.05}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                    allowFullScreen
                    title="Services Map"
                    loading="lazy"
                  ></iframe>
                  <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
                    <p className="text-sm font-medium text-gray-900">{location.city}, {location.state}</p>
                    <p className="text-xs text-gray-600">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Enable location to view map</p>
                    <Button onClick={getLocation} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Get My Location
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filterServices().slice(0, 6).map((service) => (
                <Card key={service.id} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl">{getServiceIcon(service.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-600">{service.distance}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setShowMapView(false);
                      getDirections(service);
                    }}
                  >
                    <NavIcon className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                </Card>
              ))}
            </div>

            {/* View Full Map Button */}
            <Button
              className="w-full"
              onClick={() => {
                if (location) {
                  window.open(
                    `https://www.google.com/maps/@${location.latitude},${location.longitude},13z`,
                    '_blank'
                  );
                }
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View Full Screen Map
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default LocationServices;
