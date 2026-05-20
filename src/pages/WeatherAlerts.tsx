import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AlertsPanel } from "@/components/AlertsPanel";
import WeatherAlertWidget from "@/components/WeatherAlertWidget";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bell, Calendar, CloudRain, Radio, Smartphone, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const WeatherAlerts = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />

      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="pb-12">
          <div className="container mx-auto px-4 max-w-6xl space-y-10">
            <div className="space-y-6">
              <Badge className="bg-blue-600 text-white border-none shadow-md">
                {t('weather.badge')}
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  {t('weather.title')}
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl">
                  {t('weather.subtitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="#weather-dashboard">
                  <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/20">
                    <CloudRain className="h-5 w-5 mr-2" />
                    View Live Alerts
                  </Button>
                </a>
                <Link to="/price-prediction">
                  <Button variant="outline" size="lg" className="border-blue-200 text-blue-800 hover:bg-white">
                    Explore Price Insights
                  </Button>
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600 max-w-4xl">
                <div className="p-4 rounded-xl border border-blue-100 bg-white/80 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-blue-700 font-semibold mb-1">COVERAGE</p>
                  <p className="font-semibold text-slate-900">Odisha-first rollout</p>
                  <p className="text-slate-600">Geofenced to avoid off-target forecasts.</p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-100 bg-white/80 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-1">CHANNELS</p>
                  <p className="font-semibold text-slate-900">WhatsApp, SMS, Voice</p>
                  <p className="text-slate-600">Works even in low-connectivity zones.</p>
                </div>
              </div>
            </div>

            {/* Weather Dashboard with new design */}
            <div id="weather-dashboard" className="space-y-6">
              <WeatherAlertWidget />
            </div>

            {/* Original AlertsPanel for compatibility */}
            <div id="alert-center" className="relative w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300/25 via-cyan-200/25 to-blue-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-blue-100 bg-white shadow-xl p-4 md:p-6">
                <AlertsPanel />
              </div>
            </div>
          </div>
        </section>

        {/* Communication Channels */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Multi-Channel Alert Delivery</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Receive alerts through your preferred communication channel, even in areas with limited connectivity
            </p>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 text-center hover:shadow-xl transition-shadow">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                <p className="text-sm text-gray-600">Instant alerts with images and videos in your local language</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-xl transition-shadow">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Radio className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Voice Calls</h3>
                <p className="text-sm text-gray-600">Automated voice alerts in Hindi, English, Tamil, and Odia</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-xl transition-shadow">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">SMS</h3>
                <p className="text-sm text-gray-600">Reliable text alerts that work on basic mobile phones</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-xl transition-shadow">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Wifi className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-sm text-gray-600">Detailed reports with charts and weather forecasts</p>
              </Card>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default WeatherAlerts;
