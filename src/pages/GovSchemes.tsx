import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Bell, AlertCircle, MapPin, CheckCircle2, Search, Filter, Calendar, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Scheme type that mirrors the backend response shape
type Scheme = {
	id: string;
	name: string;
	summary: string;
	status: string;
	window: string;
	applyUrl?: string;
	benefits: string[];
	documents?: string[];
	reminders?: number[];
	contact?: string;
};

const fallbackSchemes: Scheme[] = [
	{
		id: "pmfby",
		name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
		summary: "Crop insurance with low farmer premium and quick claim support.",
		status: "active",
		window: "Apply before sowing (Kharif/Rabi)",
		applyUrl: "https://pmfby.gov.in/",
		benefits: [
			"Premium: 1.5% Rabi / 2% Kharif",
			"Covers drought, flood, hail, pest/disease",
			"CSC / bank assisted enrollment"
		],
		documents: ["Aadhaar", "Land proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "CSC / Bank"
	},
	{
		id: "pmkisan",
		name: "PM-KISAN Income Support",
		summary: "₹6000 per year in three installments via DBT.",
		status: "active",
		window: "Enroll anytime; installment every 4 months",
		applyUrl: "https://pmkisan.gov.in/",
		benefits: ["₹2000 per installment", "Direct bank transfer", "Online eKYC"],
		documents: ["Aadhaar", "Bank passbook", "Land record"],
		reminders: [30, 14, 7, 1],
		contact: "CSC / pmkisan.gov.in"
 	},
	{
		id: "kcc",
		name: "Kisan Credit Card (KCC)",
		summary: "Flexible, low-interest working capital for crops and allied activities.",
		status: "active",
		window: "Year-round via banks/CSC",
		applyUrl: "https://pmkisan.gov.in/",
		benefits: [
			"Short-term credit with interest subvention",
			"Covers crops, dairy, fisheries, poultry",
			"Rupay-enabled KCC card"
		],
		documents: ["Aadhaar", "Land/lease proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "Bank / CSC"
	},
	{
		id: "pmkusum",
		name: "PM-KUSUM (Solar Pumps)",
		summary: "Subsidy for standalone/GRID solar pumps; Odisha implemented via OREDA.",
		status: "active",
		window: "As per OREDA notifications",
		applyUrl: "https://www.oredaodisha.com/",
		benefits: [
			"Subsidy support for solar irrigation",
			"Cuts diesel cost; reliable day-time power",
			"Implementation through OREDA"
		],
		documents: ["Aadhaar", "Land proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "OREDA / District office"
	},
	{
		id: "soilhealth",
		name: "Soil Health Card",
		summary: "Free soil testing and crop-wise fertilizer advisory.",
		status: "active",
		window: "Year-round",
		applyUrl: "https://soilhealth.dac.gov.in/",
		benefits: [
			"Know NPK and micro-nutrient status",
			"Reduce input cost; improve yield",
			"Accessible via Krushak Odisha / CSC"
		],
		documents: ["Aadhaar", "Land details", "Phone number"],
		reminders: [30, 14, 7, 1],
		contact: "Block Agriculture Office"
	},
	{
		id: "enam",
		name: "e-NAM Market Linkage",
		summary: "Online transparent agri-trading; check connected mandis in Odisha.",
		status: "active",
		window: "Year-round",
		applyUrl: "https://enam.gov.in/",
		benefits: [
			"Better price discovery",
			"Payment assurance",
			"Weighing/quality standardization"
		],
		documents: ["Aadhaar", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "Regulated Market Committee"
	},
	{
		id: "pmfme",
		name: "PM-FME (Food Processing)",
		summary: "Credit-linked subsidy for micro food processing enterprises.",
		status: "active",
		window: "Year-round via state nodal agencies",
		applyUrl: "https://mofpi.nic.in/",
		benefits: [
			"Up to 35% subsidy (caps apply)",
			"Branding, marketing, FSSAI support",
			"Individual & group enterprises"
		],
		documents: ["Aadhaar", "Bank account", "Project report"],
		reminders: [30, 14, 7, 1],
		contact: "DIC / APICOL"
	},
	{
		id: "microirrigation",
		name: "Micro Irrigation Subsidy (PMKSY)",
		summary: "Drip/sprinkler subsidy with state support via Horticulture Odisha.",
		status: "active",
		window: "Seasonal; as per notifications",
		applyUrl: "https://odihort.nic.in/",
		benefits: [
			"Cost subsidy as per norms",
			"Water-use efficiency; higher productivity",
			"Farmer training and handholding"
		],
		documents: ["Aadhaar", "Land proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "Horticulture Dept / Block"
	},
	{
		id: "midh",
		name: "MIDH Horticulture Assistance",
		summary: "Plantation, nursery, protected cultivation and post-harvest support.",
		status: "active",
		window: "As per annual action plans",
		applyUrl: "https://midh.gov.in/",
		benefits: [
			"Subsidy for orchards and nurseries",
			"Shade-net/polyhouse assistance",
			"Cold-chain/post-harvest support"
		],
		documents: ["Aadhaar", "Land proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "Horticulture Dept / Block"
	},
	{
		id: "kalia",
		name: "KALIA (Odisha)",
		summary: "Income support and livelihood assistance for small, marginal and landless.",
		status: "active",
		window: "As per state notifications",
		applyUrl: "https://kalia.odisha.gov.in/",
		benefits: [
			"Income support for cultivators",
			"Assistance for landless agri-labour",
			"Insurance and interest benefits"
		],
		documents: ["Aadhaar", "Bank account", "Land/occupation details"],
		reminders: [30, 14, 7, 1],
		contact: "Krushak Odisha / CSC"
	},
	{
		id: "balaram",
		name: "BALARAM (Sharecropper Credit)",
		summary: "Institutional credit to sharecroppers via Joint Liability Groups.",
		status: "active",
		window: "Year-round via Agriculture Dept",
		applyUrl: "https://krushak.odisha.gov.in/",
		benefits: [
			"Bank credit without land ownership",
			"JLG model with facilitation",
			"Insurance cover as per norms"
		],
		documents: ["Aadhaar", "JLG documents", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "Block Agriculture Office / Bank"
	},
	{
		id: "milletmission",
		name: "Odisha Millet Mission (Shree Ann)",
		summary: "Support for millet cultivation, processing and market linkages.",
		status: "active",
		window: "Seasonal; district-wise coverage",
		applyUrl: "https://krushak.odisha.gov.in/",
		benefits: [
			"Seed, extension and incentives",
			"FPO and processing support",
			"Inclusion in nutrition programs"
		],
		documents: ["Aadhaar", "Bank account", "Land details"],
		reminders: [30, 14, 7, 1],
		contact: "DAFE / District office"
	},
	{
		id: "mkuy",
		name: "Mukhyamantri Krushi Udyog Yojana (MKUY)",
		summary: "Capital subsidy for agri/food processing/dairy/poultry enterprises.",
		status: "active",
		window: "Year-round; project-based",
		applyUrl: "https://apicol.nic.in/",
		benefits: [
			"Capital subsidy as per sector norms",
			"Facilitation via APICOL",
			"Credit linkage and approvals"
		],
		documents: ["Aadhaar", "Bank account", "Project report"],
		reminders: [30, 14, 7, 1],
		contact: "APICOL / DIC"
	},
	{
		id: "soura",
		name: "Soura Jalanidhi (Solar Irrigation)",
		summary: "Solar-powered micro-irrigation for small/marginal farmers (Odisha).",
		status: "active",
		window: "Batch-wise; as per OREDA",
		applyUrl: "https://www.oredaodisha.com/",
		benefits: [
			"Subsidized solar pumps",
			"Lower irrigation cost",
			"Beneficiary contribution as per norms"
		],
		documents: ["Aadhaar", "Land/water source proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "OREDA / Block"
	},
	{
		id: "mmpy",
		name: "Matsya Pokhari Yojana (Fisheries)",
		summary: "Assistance for new/renovation of fish ponds and inputs.",
		status: "active",
		window: "As per Fisheries Dept calendar",
		applyUrl: "https://fardodisha.gov.in/",
		benefits: [
			"Subsidy for pond development",
			"Fingerlings/feed support",
			"Training and extension"
		],
		documents: ["Aadhaar", "Land/water body proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "Fisheries Dept / Block"
	},
	{
		id: "dairy_poultry",
		name: "Dairy & Poultry Enterprise Assistance",
		summary: "Credit-linked subsidy for dairy/poultry units via APICOL/Dept.",
		status: "active",
		window: "Year-round; project-based",
		applyUrl: "https://apicol.nic.in/",
		benefits: [
			"Capital subsidy as per unit size",
			"Fodder/equipment support",
			"Market linkage facilitation"
		],
		documents: ["Aadhaar", "Project report", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "APICOL / AH&VS"
	},
	{
		id: "kalia_scholarship",
		name: "KALIA Chhatra Bruti (Scholarship)",
		summary: "Scholarship for children of KALIA beneficiaries for professional courses.",
		status: "active",
		window: "Annual; as notified",
		applyUrl: "https://kalia.odisha.gov.in/",
		benefits: [
			"Tuition/maintenance support",
			"Merit-based with KALIA eligibility",
			"Application via state portal"
		],
		documents: ["Aadhaar", "Admission proof", "Bank account"],
		reminders: [30, 14, 7, 1],
		contact: "KALIA Helpdesk"
	}
];

const statusTone: Record<string, string> = {
	active: "bg-emerald-100 text-emerald-700",
	upcoming: "bg-amber-100 text-amber-800",
	closed: "bg-slate-100 text-slate-600",
};

const GovSchemes = () => {
	const { user } = useAuth();
	const [schemes, setSchemes] = useState<Scheme[]>(fallbackSchemes);
	const [loading, setLoading] = useState(false);
	const [subscribePhone, setSubscribePhone] = useState("");
	const [language, setLanguage] = useState("en");
	const [subscribed, setSubscribed] = useState(false);
	const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "closed">("all");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const resp = await fetch("/api/schemes");
				const data = await resp.json();
				if (resp.ok && data?.schemes) setSchemes(data.schemes);
			} catch {
				// keep fallback data if fetch fails
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const handleSubscribe = async () => {
		setError(null);
		if (!subscribePhone.trim()) {
			setError("Enter a phone/WhatsApp number to enable alerts.");
			return;
		}
		try {
			const resp = await fetch("/api/schemes/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: subscribePhone.trim(),
					language,
					schemeIds: schemes.map((s) => s.id),
					farmerAddress: user?.address
				})
			});
			const data = await resp.json();
			if (!resp.ok || !data?.ok) throw new Error(data?.error || "subscribe_failed");
			setSubscribed(true);
		} catch (e: any) {
			setError(e?.message || "Unable to subscribe right now.");
		}
	};

	const counts = useMemo(() => ({
		total: schemes.length,
		active: schemes.filter(s => s.status === "active").length,
		upcoming: schemes.filter(s => s.status === "upcoming").length,
		closed: schemes.filter(s => s.status === "closed").length,
	}), [schemes]);

	const filteredSchemes = useMemo(() => {
		const q = query.trim().toLowerCase();
		return schemes
			.filter(s => (statusFilter === "all" ? true : s.status === statusFilter))
			.filter(s => !q || s.name.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
	}, [schemes, query, statusFilter]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
			<Navigation />

			<section className="pt-32 pb-16 bg-gradient-to-r from-indigo-500 via-blue-400 to-purple-500">
				<div className="container mx-auto px-4">
					<div className="flex items-center gap-4 mb-6">
						<div className="p-4 bg-white/90 rounded-xl shadow-lg">
							<FileText className="h-12 w-12 text-indigo-600" />
						</div>
						<div>
							<Badge className="mb-2 bg-white/20 text-white border-white/30">Government Schemes</Badge>
							<h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3">
								Scheme Deadlines, Support & Renewals
							</h1>
							<p className="text-indigo-50 text-xl">
								Actionable guides for PMFBY, PM-KISAN, KCC, Soil Health Cards, e-NAM, PM-FME and more.
							</p>
						</div>
					</div>

					<Card className="p-4 md:p-6 bg-white/10 border-white/20 text-white">
						<div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
							<div className="flex-1 space-y-1">
								<p className="text-base uppercase tracking-wider text-indigo-100">Never miss a window</p>
								<h3 className="text-3xl font-bold">Enable WhatsApp deadline alerts</h3>
								<p className="text-indigo-50 text-base">We remind you <span className="font-semibold text-white">30/14/7/1 days</span> before renewal or application windows close.</p>
							</div>
							<div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
								<Input
									placeholder="WhatsApp number"
									value={subscribePhone}
									onChange={(e) => setSubscribePhone(e.target.value)}
									className="bg-white text-slate-800 text-lg py-6"
								/>
								<div className="flex items-center gap-2">
									<select
										value={language}
										onChange={(e) => setLanguage(e.target.value)}
										className="text-slate-800 text-base rounded-md border border-indigo-200 px-4 py-3"
									>
										<option value="en">English</option>
										<option value="hi">हिन्दी</option>
										<option value="or">ଓଡିଆ</option>
										<option value="ta">தமிழ்</option>
									</select>
									<Button onClick={handleSubscribe} className="bg-emerald-500 hover:bg-emerald-600 text-lg py-6" disabled={loading}>
										<Bell className="h-5 w-5 mr-2" />
										Enable Alerts
									</Button>
								</div>
							</div>
						</div>
						{error && <p className="mt-3 text-base font-semibold text-orange-100">{error}</p>}
						{subscribed && !error && <p className="mt-3 text-base text-emerald-100">You will receive WhatsApp reminders for all selected schemes.</p>}
					</Card>
				</div>
			</section>

			<section className="py-16">
				<div className="container mx-auto px-4 space-y-10">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<p className="text-sm uppercase tracking-wider text-indigo-600 font-semibold">Curated for FarmLedge</p>
							<h2 className="text-4xl font-extrabold text-slate-900">High-impact schemes</h2>
							<p className="text-base text-slate-700">Insurance, income support, credit, soil, markets, and processing incentives.</p>
						</div>
						<div className="flex flex-col md:items-end gap-2">
						<div className="flex items-center gap-3 text-sm text-slate-600">
							<MapPin className="h-4 w-4 text-indigo-600" />
							Works pan-India; consult local CSC for district specifics.
						</div>
						<div className="flex items-center gap-2 text-xs md:text-sm">
							<span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active: {counts.active}</span>
							<span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Upcoming: {counts.upcoming}</span>
							<span className="px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">Closed: {counts.closed}</span>
						</div>
					</div>
					</div>

					{/* Search + Filters */}
					<div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
						<div className="relative w-full md:max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search schemes (e.g., PMFBY, PM-KISAN)"
								className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
							/>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-slate-500 text-sm flex items-center gap-1"><Filter className="h-4 w-4" /> Status:</span>
							{(["all","active","upcoming","closed"] as const).map((key) => (
								<button
									key={key}
									onClick={() => setStatusFilter(key)}
									className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
										statusFilter === key
											? "bg-indigo-600 text-white border-indigo-600"
											: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
									}`}
								>
									{key[0].toUpperCase() + key.slice(1)}
								</button>
							))}
						</div>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredSchemes.map((scheme) => (
							<Card key={scheme.id} className="p-7 bg-white hover:shadow-2xl transition-shadow border border-slate-100">
								<div className="flex items-start justify-between mb-3">
									<Badge className={`${statusTone[scheme.status] || statusTone.active} text-sm px-3 py-1 border` }>
										{scheme.status === "active" ? "Active" : scheme.status === "upcoming" ? "Upcoming" : "Closed"}
									</Badge>
									<span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  <Calendar className="h-4 w-4" /> {scheme.window}
                </span>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">{scheme.name}</h3>
								<p className="text-base text-gray-700 mb-5">{scheme.summary}</p>

								<div className="mb-4">
									<p className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Key Benefits</p>
									<ul className="space-y-2">
										{scheme.benefits.map((benefit) => (
											<li key={benefit} className="flex items-start gap-3 text-sm text-gray-800">
												<CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
												<span className="font-medium"><span className="font-bold text-emerald-700">{benefit.split(':')[0]}</span>{benefit.includes(':') ? `:${benefit.split(':').slice(1).join(':')}` : ` ${''}`}</span>
											</li>
										))}
									</ul>
								</div>

								{scheme.documents?.length ? (
									<div className="mb-4">
										<p className="text-sm font-semibold text-gray-800 mb-2">Required</p>
										<div className="flex flex-wrap gap-2">
											{scheme.documents.map((doc) => (
												<Badge key={doc} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-sm px-3 py-1">
													{doc}
												</Badge>
											))}
										</div>
									</div>
								) : null}

								<div className="pt-5 border-t border-gray-100 flex items-center justify-between">
									<span className="text-sm font-medium text-gray-600">{scheme.contact || "CSC / online"}</span>
									<Button size="lg" className="px-5" asChild>
										<a href={scheme.applyUrl || "#"} target="_blank" rel="noreferrer">
											Apply / Renew <ExternalLink className="h-4 w-4 ml-2" />
										</a>
									</Button>
								</div>
							</Card>
						))}
					</div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              No schemes found. Try clearing filters or searching a different term.
            </div>
          )}

					<Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
						<h3 className="text-3xl font-extrabold text-blue-900 mb-6">Important Government Portals</h3>
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
							<PortalLink href="https://soilhealth.dac.gov.in/" title="Soil Health Card" subtitle="Portal" />
							<PortalLink href="https://pmfby.gov.in/" title="PM Fasal Bima" subtitle="Yojana" />
							<PortalLink href="https://enam.gov.in/" title="e-NAM" subtitle="Market" />
							<PortalLink href="https://pmkisan.gov.in/" title="PM-KISAN" subtitle="Portal" />
							<PortalLink href="https://krushak.odisha.gov.in/" title="Krushak Odisha" subtitle="State Portal" />
							<PortalLink href="https://kalia.odisha.gov.in/" title="KALIA" subtitle="Odisha" />
							<PortalLink href="https://apicol.nic.in/" title="APICOL" subtitle="Enterprises" />
							<PortalLink href="https://www.oredaodisha.com/" title="OREDA" subtitle="Solar / Energy" />
						</div>
					</Card>

					<Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
						<div className="flex items-start gap-4">
							<AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
							<div>
								<h4 className="text-2xl font-bold text-gray-900 mb-2">Get proactive reminders</h4>
								<p className="text-base text-gray-700 mb-4">
									We nudge you 30/14/7/1 days before key windows for insurance renewal, PM-KISAN installments, and KCC check-ins.
								</p>
								<div className="flex gap-3">
									<Button onClick={handleSubscribe} className="bg-emerald-600 hover:bg-emerald-700 text-lg py-6" disabled={loading}>
										<Bell className="h-5 w-5 mr-2" /> Enable Scheme Alerts
									</Button>
									<Button variant="outline" className="text-lg py-6" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
										Update number
									</Button>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</section>

			<Footer />
		</div>
	);
};

const PortalLink = ({ href, title, subtitle }: { href: string; title: string; subtitle: string }) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-lg transition-shadow"
	>
		<FileText className="h-5 w-5 text-blue-600" />
		<div>
			<p className="text-sm font-semibold text-gray-900">{title}</p>
			<p className="text-xs text-gray-600">{subtitle}</p>
		</div>
	</a>
);

export default GovSchemes;