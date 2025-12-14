import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  TrendingUp, 
  FileText, 
  Bell, 
  MapPin, 
  AlertCircle,
  BookOpen,
  CloudRain,
  Calendar,
  Package,
  Users,
  Award
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Services = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <CloudRain className="h-6 w-6" />,
      title: "Weather Alerts",
      description: "Get timely weather updates for irrigation and harvest planning",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Scheme Expiry Alerts",
      description: "Never miss government scheme deadlines",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Awareness Resources",
      description: "Access CSIR-CFTRI research and agricultural best practices",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Storage Solutions",
      description: "Find nearby storage facilities and alternate use cases",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location-Based Services",
      description: "Connect with closest distributors, farmers, and retailers",
      color: "bg-rose-100 text-rose-600"
    }
  ];

  const govSchemes = [
    {
      name: "Soil Health Card Scheme",
      description: "Free soil testing and health cards with nutrient recommendations",
      status: "Active",
      deadline: "Ongoing"
    },
    {
      name: "Pradhan Mantri Fasal Bima Yojana",
      description: "Crop insurance scheme for farmers",
      status: "Active",
      deadline: "Apply before sowing season"
    },
    {
      name: "Krishi Vigyan Kendra Services",
      description: "Agricultural extension and training services",
      status: "Active",
      deadline: "Walk-in services"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Navigation />
      
      {/* Hero Section - Government Style */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/90 rounded-xl shadow-lg">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                Agricultural Services
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Comprehensive Agricultural Services
              </h1>
              <p className="text-emerald-50 text-lg">
                All-in-one platform for soil analysis, weather alerts, government schemes, and more
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">10,000+</p>
                  <p className="text-sm text-gray-600">Registered Farmers</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">50,000+</p>
                  <p className="text-sm text-gray-600">Soil Tests Done</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">15+</p>
                  <p className="text-sm text-gray-600">Active Schemes</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                  <p className="text-sm text-gray-600">Satisfaction Rate</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          
          {/* Weather Alerts Section */}
          <div id="weather-alerts" className="mt-24 scroll-mt-20">
            <div className="mb-8">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                <CloudRain className="h-3 w-3 mr-1" />
                Weather & Smart Alerts
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Real-Time Weather & Agricultural Alerts
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Stay informed with timely alerts for weather conditions, irrigation schedules, seeding times, and harvest planning.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <CloudRain className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900">Weather Monitoring</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>7-day weather forecast with rainfall predictions</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Temperature and humidity tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Storm and extreme weather warnings</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Best time recommendations for sowing and harvesting</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <CloudRain className="h-4 w-4 mr-2" />
                  View Weather Dashboard
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-orange-900">Smart Notifications</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Irrigation reminders based on soil moisture</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Pest and disease outbreak alerts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>Fertilizer application timing notifications</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-600 mt-0.5">✓</span>
                    <span>WhatsApp and SMS alerts integration</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Alerts
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-purple-900">Agricultural Calendar</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Crop-specific sowing and harvesting schedules</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Seasonal crop rotation planning</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Market price trends and selling windows</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 mt-0.5">✓</span>
                    <span>Government scheme deadlines tracking</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-red-900">Scheme Expiry Alerts</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-600 mt-0.5">✓</span>
                    <span>Government subsidy application deadlines</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-600 mt-0.5">✓</span>
                    <span>Insurance policy renewal reminders</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-600 mt-0.5">✓</span>
                    <span>Loan repayment schedule notifications</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-600 mt-0.5">✓</span>
                    <span>New scheme announcements and eligibility checks</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Manage Alerts
                </Button>
              </Card>
            </div>
          </div>

          {/* Government Schemes Section */}
          <div id="government-schemes" className="mt-24 scroll-mt-20">
            <div className="mb-8">
              <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
                <FileText className="h-3 w-3 mr-1" />
                Government Schemes
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Government Schemes & Agricultural Services
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Access comprehensive information about government initiatives, subsidies, and support programs for farmers.
              </p>
            </div>
            
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {govSchemes.map((scheme, idx) => (
                  <Card key={idx} className="p-4 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={scheme.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {scheme.status}
                      </Badge>
                      <Bell className="h-4 w-4 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{scheme.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{scheme.deadline}</span>
                      <Button size="sm" variant="outline">Learn More</Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Important Government Portals</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <a href="https://soilhealth.dac.gov.in/" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Soil Health Card Portal</span>
                  </a>
                  <a href="https://pmfby.gov.in/" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">PM Fasal Bima Yojana</span>
                  </a>
                  <a href="https://kvk.icar.gov.in/" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Krishi Vigyan Kendra</span>
                  </a>
                  <a href="https://cftri.res.in/" target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">CSIR-CFTRI Research</span>
                  </a>
                </div>
              </div>
            </Card>
          </div>

          {/* Storage Solutions Section */}
          <div id="storage" className="mt-24 scroll-mt-20">
            <div className="mb-8">
              <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
                <Package className="h-3 w-3 mr-1" />
                Storage Solutions
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nearby Storage & Alternate Use Cases
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Find nearby storage facilities, cold storage options, and explore alternate use cases for surplus or expiring produce.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Package className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-amber-900">Storage Facilities</h3>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-600 mt-0.5">✓</span>
                    <span>Locate nearest warehouses and godowns</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-600 mt-0.5">✓</span>
                    <span>Cold storage for perishable goods</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-600 mt-0.5">✓</span>
                    <span>Real-time availability and pricing</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-600 mt-0.5">✓</span>
                    <span>Quality preservation techniques</span>
                  </li>
                </ul>
                <Button className="w-full" variant="default">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Storage Near Me
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900">Alternate Use Cases</h3>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Processing units for value addition</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Organic fertilizer and compost production</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Animal feed manufacturing contacts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Bio-energy and industrial use options</span>
                  </li>
                </ul>
                <Button className="w-full" variant="default">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explore Options
                </Button>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Storage Best Practices</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Proper storage can reduce post-harvest losses by up to 30%. Follow CSIR-CFTRI guidelines for optimal storage conditions, 
                    temperature control, and humidity management to maintain crop quality and extend shelf life.
                  </p>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Storage Guidelines
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Location-Based Services Section */}
          <div id="location" className="mt-24 scroll-mt-20">
            <div className="mb-8">
              <Badge className="mb-4 bg-rose-100 text-rose-700 border-rose-200">
                <MapPin className="h-3 w-3 mr-1" />
                Location-Based Services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Connect with Local Agricultural Network
              </h2>
              <p className="text-gray-600 max-w-3xl">
                Find and connect with nearby farmers, distributors, retailers, KVKs, and agricultural service providers in your area.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-rose-100 rounded-xl">
                    <Users className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-rose-900">Network</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Connect with nearby farmers</li>
                  <li>• Find local distributors</li>
                  <li>• Locate retailers in your area</li>
                  <li>• Agricultural cooperatives</li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <Users className="h-4 w-4 mr-2" />
                  View Network
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900">Services</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Krishi Vigyan Kendras (KVKs)</li>
                  <li>• Soil testing laboratories</li>
                  <li>• Equipment rental services</li>
                  <li>• Veterinary services</li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Services
                </Button>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900">Markets</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Nearby mandis and APMCs</li>
                  <li>• Farmers markets</li>
                  <li>• Direct selling opportunities</li>
                  <li>• Export facilitation centers</li>
                </ul>
                <Button className="w-full mt-6" variant="default">
                  <FileText className="h-4 w-4 mr-2" />
                  View Markets
                </Button>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-rose-600" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Enable Location Services</h4>
                <p className="text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
                  Allow location access to discover nearby agricultural services, connect with local stakeholders, 
                  and get personalized recommendations based on your geographic region and climate zone.
                </p>
                <Button size="lg">
                  <MapPin className="h-4 w-4 mr-2" />
                  Enable Location Access
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
