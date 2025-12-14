import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  Truck,
  Store,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Mail,
  Lightbulb
} from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roleFromQuery = query.get("role") as import("@/context/AuthContext").Role | null;
  const roleFromState = (location.state as any)?.roleRequired as import("@/context/AuthContext").Role | undefined;
  const lastRole = (typeof window !== 'undefined' ? localStorage.getItem('lastRole') : null) as import("@/context/AuthContext").Role | null;
  const initialRole = (roleFromState || roleFromQuery || lastRole || "farmer") as import("@/context/AuthContext").Role;
  const [role, setRole] = useState<import("@/context/AuthContext").Role>(initialRole);

  // Farmer uses Aadhaar, others use Email
  const [aadhaar, setAadhaar] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    const nextRole = (roleFromState || roleFromQuery) as import("@/context/AuthContext").Role | undefined;
    if (nextRole && nextRole !== role) {
      setRole(nextRole);
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFromState, roleFromQuery]);

  useEffect(() => {
    try { localStorage.setItem('lastRole', role); } catch { }
  }, [role]);

  const resetForm = () => {
    setAadhaar("");
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setGeneratedOtp("");
  };

  const sendOtp = () => {
    // Validate input
    if (role === "farmer" && aadhaar.length !== 12) return;
    if (role !== "farmer" && (!email || !email.includes("@"))) return;

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(generatedOtp);
    setOtpSent(true);
  };

  const verifyAndLogin = () => {
    if (otp !== generatedOtp) return;

    const dest = role === "farmer" ? "/farmers"
      : role === "distributor" ? "/distributors"
        : role === "retailer" ? "/retailers"
          : role === "verifier" ? "/verifiers"
            : "/consumers";

    const addresses: Record<string, string> = {
      farmer: '0x1111111111111111111111111111111111111111',
      distributor: '0x2222222222222222222222222222222222222222',
      retailer: '0x3333333333333333333333333333333333333333',
      consumer: '0x4444444444444444444444444444444444444444',
      verifier: '0x9999999999999999999999999999999999999999'
    };

    login({ role, email: role === "farmer" ? aadhaar : email, address: addresses[role] });
    nav(dest);
  };

  const roleConfig = {
    farmer: {
      icon: Sprout,
      title: "Farmers",
      description: "Grow and manage your crops with blockchain transparency",
      color: "emerald"
    },
    distributor: {
      icon: Truck,
      title: "Distributors",
      description: "Transport and track produce across the supply chain",
      color: "blue"
    },
    retailer: {
      icon: Store,
      title: "Retailers",
      description: "Sell verified products to consumers with confidence",
      color: "purple"
    },
    consumer: {
      icon: ShoppingCart,
      title: "Consumers",
      description: "Buy authentic products and track their journey",
      color: "orange"
    },
    verifier: {
      icon: ShieldCheck,
      title: "Verifiers",
      description: "Verify and validate product authenticity",
      color: "indigo"
    }
  };

  const currentConfig = roleConfig[role];
  const RoleIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-full text-sm font-medium text-slate-700 mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t("login.hero.badge")}
          </div>

          {/* Welcome to Farmledge Title */}
          <div className="mb-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-2">
              {t("login.hero.welcome")} <span className="text-emerald-600">Farmledge</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {t("login.hero.tagline")}
            </p>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-start">

          {/* Left Column - Role Selection */}
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("login.chooseRole")}</h2>
              <p className="text-slate-600">{t("login.selectAccount")}</p>
            </div>

            <div className="space-y-3">
              {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map((r) => {
                const config = roleConfig[r];
                const Icon = config.icon;
                const isActive = role === r;

                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      resetForm();
                    }}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-emerald-500' : 'bg-slate-100'
                          }`}>
                          <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{t(`nav.${r}s`)}</h3>
                            {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          </div>
                          <p className={`text-sm mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                            {t(`login.roleDescriptions.${r}`)}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="lg:sticky lg:top-24">
            <Card className="p-8 shadow-xl border-0">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
                  <RoleIcon className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {t("login.form.signInAs")} {t(`nav.${role}s`).slice(0, -1)}
                </h2>
                <p className="text-slate-600">{t("login.form.accessDashboard")}</p>
              </div>

              <div className="space-y-5">
                {/* Farmer - Aadhaar Number */}
                {role === "farmer" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">{t("login.form.aadhaar")}</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="text"
                        maxLength={12}
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                        placeholder={t("login.form.aadhaarPlaceholder")}
                        className="pl-11 h-12 border-slate-300"
                        disabled={otpSent}
                      />
                    </div>
                    <div className="flex items-start gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">{t("login.form.aadhaarExample")}</p>
                    </div>
                  </div>
                )}

                {/* Other Roles - Email */}
                {role !== "farmer" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">{t("login.form.emailAddress")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("login.form.emailPlaceholder")}
                        className="pl-11 h-12 border-slate-300"
                        disabled={otpSent}
                      />
                    </div>
                  </div>
                )}

                {/* OTP Input (shown after OTP sent) */}
                {otpSent && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">{t("login.form.enterOtp")}</Label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder={t("login.form.otpPlaceholder")}
                      className="h-12 border-slate-300 text-center text-lg tracking-widest"
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm text-emerald-700 font-medium">{t("login.form.otpDisplay")} {generatedOtp}</p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!otpSent ? (
                  <Button
                    onClick={sendOtp}
                    disabled={role === "farmer" ? aadhaar.length !== 12 : !email || !email.includes("@")}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  >
                    {t("login.form.getOtp")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={verifyAndLogin}
                    disabled={otp.length !== 6}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    {t("login.form.verifyContinue")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}

                <div className="text-center pt-4">
                  <p className="text-sm text-slate-500 font-medium">{t("login.form.testMode").toUpperCase()}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("login.form.demoMode")} {role === "farmer" ? t("login.form.demoFarmer") : t("login.form.demoOther")} {t("login.form.noSending")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
