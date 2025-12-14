import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CropPricePrediction from "@/components/CropPricePrediction";

const PricePrediction = () => {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-600">
      <Navigation />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <CropPricePrediction />
      </main>
      <Footer />
    </div>
  );
};

export default PricePrediction;
