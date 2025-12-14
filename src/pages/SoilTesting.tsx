import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SoilAnalyzer } from "@/components/SoilAnalyzer";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

const SoilTesting = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/90 rounded-xl shadow-lg">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                Soil Testing & Analysis
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Scientific Soil Quality Analysis
              </h1>
              <p className="text-emerald-50 text-lg">
                Analyze your soil composition and get personalized recommendations for optimal crop selection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <SoilAnalyzer />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SoilTesting;
