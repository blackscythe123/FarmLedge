import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	FileText,
	Bell,
	AlertCircle,
	MapPin,
	CheckCircle2,
	Search,
	Filter,
	Calendar,
	ExternalLink,
	ChevronRight,
	Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// Images
import kccImg from "@/assets/schemes/kcc.jpg";
import pmfbyImg from "@/assets/schemes/pmfby.jpg";
import pmkisanImg from "@/assets/schemes/pmkisan.jpg";
import soilHealthImg from "@/assets/schemes/soilhealth.jpg";
import enamImg from "@/assets/schemes/enam.jpg";
import pmfmeImg from "@/assets/schemes/pmfme.jpg";
import milletImg from "@/assets/schemes/millet.jpg";
import kaliaImg from "@/assets/schemes/kalia.jpg";
import balaramImg from "@/assets/schemes/balaram.jpg";
import poultryImg from "@/assets/schemes/poultry.jpg";

// Scheme type that mirrors the backend response shape
type Scheme = {
	id: string;
	name: string;
	summary: string;
	status: "active" | "upcoming" | "closed";
	window: string;
	applyUrl?: string;
	benefits: string[];
	documents?: string[];
	reminders?: number[];
	contact?: string;
	image?: string; // New image field
};

const fallbackSchemes: Scheme[] = [
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
		contact: "Bank / CSC",
		image: kccImg
	},
	{
		id: "pmfby",
		name: "Pradhan Mantri Fasal Bima Yojana",
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
		contact: "CSC / Bank",
		image: pmfbyImg
	},
	{
		id: "pmkisan",
		name: "PM-KISAN Income Support",
		summary: "₹6000 per year in three installments via DBT.",
		status: "active",
		window: "Enroll anytime",
		applyUrl: "https://pmkisan.gov.in/",
		benefits: ["₹2000 per installment", "Direct bank transfer", "Online eKYC"],
		documents: ["Aadhaar", "Bank passbook", "Land record"],
		reminders: [30, 14, 7, 1],
		contact: "CSC / pmkisan.gov.in",
		image: pmkisanImg
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
		contact: "Block Agriculture Office",
		image: soilHealthImg
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
		contact: "Regulated Market Committee",
		image: enamImg
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
		contact: "DIC / APICOL",
		image: pmfmeImg
	},
	{
		id: "milletmission",
		name: "Odisha Millet Mission",
		summary: "Support for millet cultivation, processing and market linkages (Shree Ann).",
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
		contact: "DAFE / District office",
		image: milletImg
	},
	{
		id: "mkuy",
		name: "Mukhyamantri Krushi Udyog Yojana",
		summary: "Capital subsidy for agri/food processing/dairy/poultry enterprises.",
		status: "active",
		window: "Year-round based on project",
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
		contact: "Krushak Odisha / CSC",
		image: kaliaImg
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
		contact: "Block Agriculture Office / Bank",
		image: balaramImg
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
		contact: "APICOL / AH&VS",
		image: poultryImg
	}
];

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
				if (resp.ok && data?.schemes) {
					// Merge images from fallback if backend doesn't provide them
					const merged = data.schemes.map((s: Scheme) => {
						const fallback = fallbackSchemes.find(f => f.id === s.id);
						return { ...s, image: fallback?.image || s.image };
					});
					setSchemes(merged);
				}
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
		// Simulate API call
		setSubscribed(true);
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
		<div className="min-h-screen bg-slate-50 font-sans">
			<Navigation />

			{/* Hero Section */}
			<section className="pt-32 pb-16 bg-emerald-900 overflow-hidden relative">
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-4xl mx-auto text-center space-y-6">
						<Badge className="bg-emerald-800/50 text-emerald-100 border-emerald-700/50 hover:bg-emerald-800/50 px-4 py-1.5 text-sm uppercase tracking-widest backdrop-blur-sm">
							Government Services
						</Badge>
						<h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
							Schemes & Subsidies
						</h1>
						<p className="text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
							Direct access to PM-KISAN, crop insurance, and state livelihood missions.
							Simple summaries, deadline alerts, and document checklists.
						</p>
					</div>

					{/* Alert Subscription Card */}
					<Card className="mt-12 max-w-5xl mx-auto p-1 bg-white/10 border-white/10 backdrop-blur-md rounded-2xl shadow-xl">
						<div className="bg-white rounded-xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center justify-between">
							<div className="flex-1 space-y-2 text-center lg:text-left">
								<h3 className="text-xl font-bold text-slate-800 flex items-center justify-center lg:justify-start gap-2">
									<Bell className="w-5 h-5 text-emerald-600" />
									Never Miss a Deadline
								</h3>
								<p className="text-slate-600">
									Get free WhatsApp alerts <span className="font-semibold text-emerald-700">30 days</span> before renewal windows close.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
								<Input
									placeholder="+91 WhatsApp Number"
									className="h-12 text-lg min-w-[260px] border-slate-300 focus:border-emerald-500"
									value={subscribePhone}
									onChange={(e) => setSubscribePhone(e.target.value)}
								/>
								<Button size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 font-semibold" onClick={handleSubscribe}>
									Get Alerts
								</Button>
							</div>
						</div>
						{subscribed && <div className="text-center text-emerald-300 font-medium py-2">✓ Alerts enabled for your number</div>}
					</Card>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-16 bg-slate-50">
				<div className="container mx-auto px-4">

					{/* Filters & Search */}
					<div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
						<div>
							<h2 className="text-3xl font-serif font-bold text-slate-900">Available Schemes</h2>
							<p className="text-slate-500 mt-1">Found {filteredSchemes.length} schemes for you</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Search schemes..."
									className="pl-10 w-full sm:w-64 bg-white shadow-sm border-slate-200"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</div>
							<div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
								{(["all", "active", "upcoming"] as const).map(filter => (
									<button
										key={filter}
										onClick={() => setStatusFilter(filter)}
										className={cn(
											"px-4 py-1.5 rounded-md text-sm font-medium transition-all",
											statusFilter === filter
												? "bg-slate-900 text-white shadow-sm"
												: "text-slate-600 hover:bg-slate-50"
										)}
									>
										{filter.charAt(0).toUpperCase() + filter.slice(1)}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Scheme Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filteredSchemes.map((scheme) => (
							<SchemeCard key={scheme.id} scheme={scheme} />
						))}
					</div>

					{filteredSchemes.length === 0 && (
						<div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
							<div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
								<Search className="w-8 h-8 text-slate-400" />
							</div>
							<h3 className="text-lg font-semibold text-slate-900">No schemes found</h3>
							<p className="text-slate-500">Try adjusting your search or filters</p>
						</div>
					)}

					{/* Important Portals Grid */}
					<div className="mt-24">
						<h3 className="text-2xl font-serif font-bold text-slate-900 mb-8 border-l-4 border-emerald-500 pl-4">
							Government Portals Directory
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<PortalLink href="https://pmkisan.gov.in" label="PM-KISAN" sub="Direct Benefit Transfer" />
							<PortalLink href="https://pmfby.gov.in" label="PMFBY" sub="Crop Insurance" />
							<PortalLink href="https://soilhealth.dac.gov.in" label="Soil Health" sub="Testing Labs" />
							<PortalLink href="https://enam.gov.in" label="e-NAM" sub="National Market" />
							<PortalLink href="https://kalia.odisha.gov.in" label="KALIA" sub="Odisha State" />
							<PortalLink href="https://www.oredaodisha.com" label="OREDA" sub="Solar / Energy" />
							<PortalLink href="https://apicol.nic.in" label="APICOL" sub="Agri-Enterprise" />
							<PortalLink href="https://mkuy.odisha.gov.in" label="MKUY" sub="Capital Subsidy" />
						</div>
					</div>

				</div>
			</section>

			<Footer />
		</div>
	);
};

// ----------------------------------------------------------------------
// New Visual Scheme Card
// ----------------------------------------------------------------------

const SchemeCard = ({ scheme }: { scheme: Scheme }) => {
	return (
		<Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[420px]">

			{/* Background Image Layer */}
			<div className="absolute inset-0 z-0">
				{scheme.image ? (
					<img
						src={scheme.image}
						alt={scheme.name}
						className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full bg-slate-200 flex items-center justify-center">
						<FileText className="w-16 h-16 text-slate-400 opacity-20" />
					</div>
				)}
				{/* Dark Overlay Gradient */}
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent transition-opacity duration-300" />
			</div>

			{/* Content Layer */}
			<div className="relative z-10 flex flex-col h-full text-white p-6">

				{/* Top Status */}
				<div className="flex justify-between items-start">
					<Badge className={cn(
						"border-0 backdrop-blur-md px-3 py-1 text-xs font-semibold tracking-wide uppercase",
						scheme.status === 'active' ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
					)}>
						{scheme.status}
					</Badge>
				</div>

				{/* Middle Spacer */}
				<div className="flex-grow" />

				{/* Bottom Info */}
				<div className="space-y-4">
					<div>
						<h3 className="text-2xl font-bold leading-tight font-serif mb-2 text-white drop-shadow-md">
							{scheme.name}
						</h3>
						<p className="text-slate-200 line-clamp-2 text-sm leading-relaxed opacity-90">
							{scheme.summary}
						</p>
					</div>

					<div className="flex items-center gap-3 pt-2">
						<DetailsDialog scheme={scheme} />

						<Button
							asChild
							className="flex-1 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-900 border-0 font-semibold h-11"
						>
							<a href={scheme.applyUrl || "#"} target="_blank" rel="noreferrer">
								Apply / Renew
							</a>
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
};

// ----------------------------------------------------------------------
// Details Dialog (Modal)
// ----------------------------------------------------------------------

const DetailsDialog = ({ scheme }: { scheme: Scheme }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex-1 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm h-11">
					View Details
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-serif text-emerald-900 pt-2">{scheme.name}</DialogTitle>
					<DialogDescription className="text-base text-slate-600">
						{scheme.summary}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">

					{/* Window & Contact */}
					<div className="flex flex-wrap gap-4 text-sm">
						<div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 table-cell">
							<Calendar className="w-4 h-4 text-slate-400 inline mr-2" />
							<span className="font-semibold text-slate-700">Application Window:</span> {scheme.window}
						</div>
						<div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 table-cell">
							<MapPin className="w-4 h-4 text-slate-400 inline mr-2" />
							<span className="font-semibold text-slate-700">Contact:</span> {scheme.contact}
						</div>
					</div>

					{/* Benefits */}
					<div>
						<h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
							<CheckCircle2 className="w-4 h-4 text-emerald-600" />
							Key Benefits
						</h4>
						<ul className="grid sm:grid-cols-2 gap-3">
							{scheme.benefits.map((benefit, i) => (
								<li key={i} className="flex items-start gap-2 text-slate-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
									{benefit}
								</li>
							))}
						</ul>
					</div>

					{/* Documents */}
					{scheme.documents && (
						<div>
							<h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
								<FileText className="w-4 h-4 text-amber-600" />
								Documents Required
							</h4>
							<div className="flex flex-wrap gap-2">
								{scheme.documents.map((doc, i) => (
									<Badge key={i} variant="secondary" className="px-3 py-1 text-slate-600 bg-white border border-slate-200">
										{doc}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Footer Actions in Modal */}
					<div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
						<Button variant="outline" asChild>
							<a href={scheme.applyUrl} target="_blank" rel="noreferrer">
								Open Official Portal <ExternalLink className="w-4 h-4 ml-2" />
							</a>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

const PortalLink = ({ href, label, sub }: { href: string; label: string; sub: string }) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-center group"
	>
		<div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center mb-2 transition-colors">
			<ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
		</div>
		<span className="font-bold text-slate-800 text-sm">{label}</span>
		<span className="text-xs text-slate-500">{sub}</span>
	</a>
);

export default GovSchemes;