import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const GradePricing = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/90 rounded-xl shadow-lg">
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                Grade-Based Pricing
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Fair Pricing Based on Crop Quality
              </h1>
              <p className="text-green-50 text-lg">
                Get fair market prices based on scientifically assessed crop quality grades
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900">Quality Grading</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Scientific quality assessment using AI/ML</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Grade A, B, C classification based on standards</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Moisture content and purity analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Blockchain-verified quality certificates</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900">Market Pricing</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Real-time market price updates</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Grade-specific price recommendations</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Historical price trend analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Transparent pricing with no hidden margins</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-purple-900">Price Discovery</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Compare prices across multiple mandis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Direct buyer-seller negotiation platform</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Minimum Support Price (MSP) tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">✓</span>
                  <span>Best time to sell recommendations</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* How It Works Section */}
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-slate-50 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How Grade-Based Pricing Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload Crop Photos</h4>
                <p className="text-sm text-gray-600">Take clear photos of your produce for quality assessment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">Our AI system analyzes quality parameters and assigns grade</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Get Fair Price</h4>
                <p className="text-sm text-gray-600">Receive grade-specific pricing based on market rates</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Connect & Sell</h4>
                <p className="text-sm text-gray-600">Connect with buyers offering best prices for your grade</p>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Using Grade-Based Pricing</h4>
                <p className="text-sm text-gray-600">Connect your harvest to get quality assessment and fair pricing</p>
              </div>
              <Button size="lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GradePricing;
