import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown, Info, Sprout, Target, MapPin, Layers, CheckCircle2, Leaf, Droplets, Beaker, Activity, TrendingDown as TrendDown } from "lucide-react";

interface PredictionResult {
    predicted_price: number;
    confidence: number;
    unit: string;
    district: string;
    soil_type: string;
    crop: string;
}

interface SoilCharacteristics {
    name: string;
    description: string;
    texture: string;
    color: string;
    ph_range: string;
    ph_category: string;
    organic_carbon: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    water_retention: string;
    drainage: string;
    fertility: string;
    suitability_score: number;
    best_crops: string[];
    characteristics: string[];
    price_influence: {
        factor: string;
        impact: string;
        reason: string;
    };
    management: string;
    districts: string[];
}

const CROPS = ['Rice', 'Moong', 'Brinjal', 'Groundnut', 'Cotton', 'Sugarcane', 'Wheat', 'Maize', 'Onion', 'Tomato'];

// Real crop-soil suitability data based on Odisha agricultural practices
const CROP_SOIL_SUITABILITY = {
    "Rice": {
        best: ["Deltaic Alluvial", "Mixed Red and Yellow"],
        good: ["Black", "Red"],
        season: "Kharif",
        avgYield: "2.5-3.5 tons/hectare"
    },
    "Moong": {
        best: ["Red", "Mixed Red and Black"],
        good: ["Laterite", "Mixed Red and Yellow"],
        season: "Rabi",
        avgYield: "0.8-1.2 tons/hectare"
    },
    "Brinjal": {
        best: ["Red", "Laterite", "Deltaic Alluvial"],
        good: ["Black", "Mixed Red and Yellow"],
        season: "All Year",
        avgYield: "20-25 tons/hectare"
    },
    "Groundnut": {
        best: ["Red", "Laterite"],
        good: ["Mixed Red and Yellow"],
        season: "Kharif",
        avgYield: "1.5-2.0 tons/hectare"
    },
    "Cotton": {
        best: ["Black", "Red"],
        good: ["Mixed Red and Black"],
        season: "Kharif",
        avgYield: "1.2-1.8 tons/hectare"
    },
    "Sugarcane": {
        best: ["Black", "Deltaic Alluvial"],
        good: ["Red", "Mixed Red and Yellow"],
        season: "All Year",
        avgYield: "60-80 tons/hectare"
    },
    "Wheat": {
        best: ["Deltaic Alluvial", "Black"],
        good: ["Mixed Red and Yellow"],
        season: "Rabi",
        avgYield: "2.0-2.8 tons/hectare"
    },
    "Maize": {
        best: ["Red", "Mixed Red and Yellow"],
        good: ["Black", "Laterite"],
        season: "Kharif",
        avgYield: "2.5-3.5 tons/hectare"
    },
    "Onion": {
        best: ["Red", "Black"],
        good: ["Mixed Red and Black", "Laterite"],
        season: "Rabi",
        avgYield: "15-20 tons/hectare"
    },
    "Tomato": {
        best: ["Red", "Laterite"],
        good: ["Mixed Red and Yellow", "Black"],
        season: "All Year",
        avgYield: "25-30 tons/hectare"
    }
};

// Real soil characteristics data from Odisha
const SOIL_CHARACTERISTICS: Record<string, SoilCharacteristics> = {
    "Deltaic Alluvial": {
        name: "Deltaic Alluvial Soil",
        description: "Highly fertile soil formed by river deposits in delta regions, particularly along the Mahanadi, Brahmani, and Baitarani river deltas.",
        texture: "Loamy to clayey",
        color: "Dark grey to brown",
        ph_range: "6.5-7.5",
        ph_category: "Neutral to slightly alkaline",
        organic_carbon: "0.8-1.2%",
        nitrogen: "High (0.85)",
        phosphorus: "High (0.80)",
        potassium: "Medium-High (0.75)",
        water_retention: "Excellent",
        drainage: "Moderate to poor",
        fertility: "Very High",
        suitability_score: 0.92,
        best_crops: ["Rice", "Sugarcane", "Jute", "Vegetables"],
        characteristics: [
            "Rich in nutrients due to river sediment deposits",
            "High moisture retention capacity",
            "Excellent for paddy cultivation",
            "Deep soil profile (>150 cm)",
            "High cation exchange capacity"
        ],
        price_influence: {
            factor: "Positive",
            impact: "+15-20%",
            reason: "Superior fertility and water retention lead to higher yields and better quality crops, commanding premium prices"
        },
        management: "Requires proper drainage management during monsoon. Ideal for intensive agriculture.",
        districts: ["Cuttack", "Jagatsinghpur", "Kendrapara", "Puri", "Balasore"]
    },
    "Coastal Saline": {
        name: "Coastal Saline Soil",
        description: "Salt-affected soils found in coastal areas, influenced by seawater intrusion and tidal activity.",
        texture: "Sandy to sandy loam",
        color: "Light grey to whitish",
        ph_range: "8.0-9.0",
        ph_category: "Alkaline to highly alkaline",
        organic_carbon: "0.2-0.4%",
        nitrogen: "Low (0.40)",
        phosphorus: "Low (0.35)",
        potassium: "Medium (0.50)",
        water_retention: "Poor",
        drainage: "Good to excessive",
        fertility: "Low",
        suitability_score: 0.45,
        best_crops: ["Coconut", "Cashew", "Casuarina", "Salt-tolerant varieties"],
        characteristics: [
            "High salt content (EC >4 dS/m)",
            "Poor nutrient availability",
            "Prone to waterlogging during monsoon",
            "Low organic matter content",
            "Requires reclamation for agriculture"
        ],
        price_influence: {
            factor: "Negative",
            impact: "-25-35%",
            reason: "High salinity reduces crop yield and quality. Requires expensive soil amendments and salt-tolerant varieties, lowering market value"
        },
        management: "Needs gypsum application, organic matter addition, and proper drainage. Growing salt-tolerant crops recommended.",
        districts: ["Puri", "Balasore", "Kendrapara", "Jagatsinghpur"]
    },
    "Black": {
        name: "Black Cotton Soil (Vertisols)",
        description: "Deep, dark-colored clay soils with high moisture retention, excellent for cotton and pulses.",
        texture: "Heavy clay",
        color: "Dark black to grey",
        ph_range: "7.2-8.5",
        ph_category: "Neutral to alkaline",
        organic_carbon: "0.5-0.7%",
        nitrogen: "Medium-High (0.75)",
        phosphorus: "High (0.85)",
        potassium: "Very High (0.90)",
        water_retention: "Excellent",
        drainage: "Very poor",
        fertility: "High",
        suitability_score: 0.88,
        best_crops: ["Cotton", "Wheat", "Sugarcane", "Pulses", "Soybean"],
        characteristics: [
            "High clay content (>60%)",
            "Swells when wet, cracks when dry",
            "Rich in montmorillonite clay minerals",
            "High cation exchange capacity",
            "Self-ploughing due to shrink-swell property"
        ],
        price_influence: {
            factor: "Positive",
            impact: "+12-18%",
            reason: "Excellent nutrient retention and moisture holding capacity result in consistent yields and superior crop quality, especially for cotton and pulses"
        },
        management: "Requires careful water management. Best suited for rainfed crops. Avoid over-irrigation.",
        districts: ["Sambalpur", "Bargarh", "Bolangir", "Kalahandi", "Puri"]
    },
    "Red": {
        name: "Red Lateritic Soil",
        description: "Weathered soil rich in iron and aluminum oxides, common in upland and plateau regions.",
        texture: "Sandy loam to clay loam",
        color: "Red to reddish-brown",
        ph_range: "5.5-6.5",
        ph_category: "Acidic to slightly acidic",
        organic_carbon: "0.4-0.6%",
        nitrogen: "Medium (0.60)",
        phosphorus: "Medium (0.55)",
        potassium: "Medium (0.65)",
        water_retention: "Moderate",
        drainage: "Good",
        fertility: "Medium",
        suitability_score: 0.72,
        best_crops: ["Groundnut", "Maize", "Millets", "Pulses", "Vegetables"],
        characteristics: [
            "High iron oxide content (gives red color)",
            "Well-drained and aerated",
            "Low natural fertility",
            "Responds well to fertilizers",
            "Prone to erosion on slopes"
        ],
        price_influence: {
            factor: "Neutral",
            impact: "±5-8%",
            reason: "Moderate fertility requires balanced fertilization. With proper management, yields are good but not exceptional, resulting in average market prices"
        },
        management: "Needs regular organic matter addition and balanced fertilization. Mulching recommended to prevent erosion.",
        districts: ["Koraput", "Rayagada", "Gajapati", "Kandhamal", "Mayurbhanj"]
    },
    "Laterite": {
        name: "Laterite Soil",
        description: "Highly weathered tropical soil with hardpan formation, common in high rainfall areas.",
        texture: "Gravelly to clay",
        color: "Brick red to reddish-yellow",
        ph_range: "5.0-6.0",
        ph_category: "Acidic",
        organic_carbon: "0.3-0.5%",
        nitrogen: "Medium (0.50)",
        phosphorus: "Low (0.45)",
        potassium: "Medium (0.55)",
        water_retention: "Poor to moderate",
        drainage: "Excessive",
        fertility: "Low to medium",
        suitability_score: 0.58,
        best_crops: ["Cashew", "Tamarind", "Mango", "Groundnut", "Millets"],
        characteristics: [
            "High aluminum and iron content",
            "Forms hard laterite crust when exposed",
            "Low nutrient retention",
            "Acidic nature limits crop options",
            "High leaching of nutrients"
        ],
        price_influence: {
            factor: "Negative",
            impact: "-15-20%",
            reason: "Low fertility and acidic pH reduce crop yields. Requires extensive soil amendments and lime application, increasing production costs and lowering profitability"
        },
        management: "Lime application essential. Grow acid-tolerant crops. Add organic matter regularly. Prevent hardpan formation.",
        districts: ["Khurda", "Puri", "Ganjam", "Nayagarh", "Mayurbhanj"]
    },
    "Mixed Red and Yellow": {
        name: "Mixed Red and Yellow Soil",
        description: "Transitional soil type combining characteristics of red and yellow soils, found in undulating terrain.",
        texture: "Sandy loam to loam",
        color: "Red to yellowish-red",
        ph_range: "6.0-6.8",
        ph_category: "Slightly acidic to neutral",
        organic_carbon: "0.5-0.7%",
        nitrogen: "Medium-High (0.70)",
        phosphorus: "Medium (0.65)",
        potassium: "Medium-High (0.70)",
        water_retention: "Moderate to good",
        drainage: "Good",
        fertility: "Medium to high",
        suitability_score: 0.78,
        best_crops: ["Rice", "Maize", "Vegetables", "Pulses", "Oilseeds"],
        characteristics: [
            "Better fertility than pure red soil",
            "Good physical properties",
            "Moderate nutrient content",
            "Responds well to fertilizers",
            "Suitable for diverse crops"
        ],
        price_influence: {
            factor: "Positive",
            impact: "+8-12%",
            reason: "Balanced nutrient profile and good physical properties support healthy crop growth. Moderate input costs with good yields result in favorable market returns"
        },
        management: "Balanced fertilization recommended. Crop rotation beneficial. Maintain organic matter levels.",
        districts: ["Sambalpur", "Dhenkanal", "Angul", "Sundargarh", "Keonjhar"]
    },
    "Mixed Red and Black": {
        name: "Mixed Red and Black Soil",
        description: "Soil with combined properties of red and black soils, offering advantages of both types.",
        texture: "Loam to clay loam",
        color: "Dark red to brownish-black",
        ph_range: "6.5-7.5",
        ph_category: "Neutral",
        organic_carbon: "0.6-0.8%",
        nitrogen: "High (0.75)",
        phosphorus: "High (0.75)",
        potassium: "High (0.80)",
        water_retention: "Good to excellent",
        drainage: "Moderate",
        fertility: "High",
        suitability_score: 0.82,
        best_crops: ["Cotton", "Pulses", "Oilseeds", "Wheat", "Maize"],
        characteristics: [
            "Combines moisture retention of black soil",
            "Better drainage than pure black soil",
            "Rich in nutrients",
            "Good tilth and workability",
            "Suitable for both kharif and rabi crops"
        ],
        price_influence: {
            factor: "Positive",
            impact: "+10-15%",
            reason: "High nutrient content and excellent moisture retention enable superior crop quality and yields. Versatility for multiple crops enhances market value"
        },
        management: "Maintain soil structure through organic matter. Balanced NPK application. Suitable for intensive cropping.",
        districts: ["Sambalpur", "Bargarh", "Nuapada", "Bolangir", "Sonepur"]
    },
    "Brown Forest": {
        name: "Brown Forest Soil",
        description: "Soil developed under forest cover in hilly and mountainous regions with moderate to high rainfall.",
        texture: "Loam to sandy loam",
        color: "Brown to dark brown",
        ph_range: "5.5-6.5",
        ph_category: "Acidic to slightly acidic",
        organic_carbon: "0.6-0.9%",
        nitrogen: "Medium-High (0.65)",
        phosphorus: "Medium (0.60)",
        potassium: "Medium (0.62)",
        water_retention: "Good",
        drainage: "Good to moderate",
        fertility: "Medium to high",
        suitability_score: 0.68,
        best_crops: ["Turmeric", "Ginger", "Vegetables", "Millets", "Pulses"],
        characteristics: [
            "High organic matter from forest litter",
            "Well-structured soil",
            "Good biological activity",
            "Prone to erosion on slopes",
            "Rich in humus"
        ],
        price_influence: {
            factor: "Neutral to Positive",
            impact: "+5-10%",
            reason: "Good organic content supports healthy crops. Suitable for high-value spices and vegetables. Moderate yields with quality produce fetch reasonable prices"
        },
        management: "Prevent soil erosion through terracing. Maintain forest cover. Add lime if too acidic. Suitable for organic farming.",
        districts: ["Mayurbhanj", "Keonjhar", "Kandhamal", "Rayagada", "Koraput"]
    }
};

const CropPricePrediction = () => {
    const { t } = useTranslation();
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedSoil, setSelectedSoil] = useState<string>('');
    const [districts, setDistricts] = useState<string[]>([]);
    const [soils, setSoils] = useState<string[]>([]);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch districts on mount
    useEffect(() => {
        fetch('http://localhost:5001/districts')
            .then(res => res.json())
            .then(data => {
                setDistricts(data.districts);
            })
            .catch(err => console.error('Failed to fetch districts:', err));
    }, []);

    // Clear prediction when selections change
    useEffect(() => {
        setPrediction(null);
    }, [selectedCrop, selectedDistrict, selectedSoil]);

    // Fetch soils when district changes
    useEffect(() => {
        if (!selectedDistrict) return;
        
        fetch(`http://localhost:5001/soils/${selectedDistrict}`)
            .then(res => res.json())
            .then(data => {
                setSoils(data.soils);
                if (data.soils.length > 0) {
                    setSelectedSoil(data.soils[0]);
                }
            })
            .catch(err => console.error('Failed to fetch soils:', err));
    }, [selectedDistrict]);

    // Get recommended crops based on selected soil
    const getRecommendedCrops = () => {
        if (!selectedSoil) return [];
        
        const recommendations: Array<{crop: string, suitability: 'best' | 'good', data: any}> = [];
        
        Object.entries(CROP_SOIL_SUITABILITY).forEach(([crop, data]) => {
            if (data.best.some(soil => selectedSoil.includes(soil) || soil.includes(selectedSoil))) {
                recommendations.push({ crop, suitability: 'best', data });
            } else if (data.good.some(soil => selectedSoil.includes(soil) || soil.includes(selectedSoil))) {
                recommendations.push({ crop, suitability: 'good', data });
            }
        });
        
        // Sort: best first, then by crop name
        return recommendations.sort((a, b) => {
            if (a.suitability === b.suitability) return a.crop.localeCompare(b.crop);
            return a.suitability === 'best' ? -1 : 1;
        });
    };

    // Calculate prediction
    const calculatePrediction = async () => {
        if (!selectedCrop || !selectedDistrict || !selectedSoil) {
            setError('Please select crop, district, and soil type');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop: selectedCrop,
                    district: selectedDistrict,
                    soil_type: selectedSoil,
                    rainfall: 1200
                })
            });

            if (!response.ok) {
                throw new Error('Prediction failed');
            }

            const data = await response.json();
            setPrediction(data);

        } catch (err: any) {
            setError(err.message || 'Failed to get prediction');
        } finally {
            setLoading(false);
        }
    };

    const recommendedCrops = getRecommendedCrops();
    const soilData = selectedSoil ? SOIL_CHARACTERISTICS[selectedSoil] : null;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-bold text-emerald-900 flex items-center justify-center gap-2">
                    <Sprout className="w-8 h-8 text-emerald-600" />
                    {t('cropPrediction.title')}
                </h2>
                <p className="text-slate-600">{t('cropPrediction.subtitle')}</p>
            </div>

            <Card className="border-emerald-100 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{t('cropPrediction.selectParameters')}</CardTitle>
                    <CardDescription>{t('cropPrediction.selectDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Crop Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Sprout className="w-4 h-4" />
                                {t('cropPrediction.crop')}
                            </label>
                            <Select value={selectedCrop} onValueChange={setSelectedCrop} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('cropPrediction.selectCrop')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {CROPS.map(crop => (
                                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* District Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {t('cropPrediction.district')}
                            </label>
                            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('cropPrediction.selectDistrict')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {districts.map(district => (
                                        <SelectItem key={district} value={district}>{district}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Soil Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                {t('cropPrediction.soilType')}
                            </label>
                            <Select value={selectedSoil} onValueChange={setSelectedSoil} disabled={loading || !selectedDistrict}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('cropPrediction.selectSoil')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {soils.map(soil => (
                                        <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={calculatePrediction} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading || !selectedCrop || !selectedDistrict || !selectedSoil}
                    >
                        <Target className="w-4 h-4 mr-2" />
                        {loading ? t('cropPrediction.calculating') : t('cropPrediction.getPrediction')}
                    </Button>
                </CardContent>
            </Card>

            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('cropPrediction.error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {prediction && !loading && !error && (
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{t('cropPrediction.predictionResult', { crop: prediction.crop })}</span>
                            <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
                                {t('cropPrediction.confidence', { percent: prediction.confidence })}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {prediction.district} • {prediction.soil_type}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t('cropPrediction.predictedPrice')}</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-bold text-emerald-900">₹{prediction.predicted_price.toFixed(2)}</p>
                                    <span className="text-slate-500 font-medium">{t('cropPrediction.perQuintal')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                                <TrendingUp className="w-4 h-4" />
                                {t('cropPrediction.highAccuracy')}
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-slate-500 pt-2 border-t border-emerald-100">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{t('cropPrediction.predictionBased')}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Soil Characteristics Card */}
            {soilData && prediction && (
                <Card className="border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 via-white to-emerald-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-900">
                            <Beaker className="w-6 h-6 text-amber-600" />
                            {soilData.name} - {t('cropPrediction.detailedAnalysis')}
                        </CardTitle>
                        <CardDescription className="text-slate-700">{soilData.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Physical Properties */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-lg border border-amber-100">
                                <h4 className="font-semibold text-sm text-amber-900 mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    {t('cropPrediction.physicalProperties')}
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.texture')}:</span>
                                        <span className="font-medium text-slate-800">{soilData.texture}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.color')}:</span>
                                        <span className="font-medium text-slate-800">{soilData.color}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.drainage')}:</span>
                                        <span className="font-medium text-slate-800">{soilData.drainage}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.waterRetention')}:</span>
                                        <span className="font-medium text-slate-800">{soilData.water_retention}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white rounded-lg border border-emerald-100">
                                <h4 className="font-semibold text-sm text-emerald-900 mb-3 flex items-center gap-2">
                                    <Beaker className="w-4 h-4" />
                                    {t('cropPrediction.chemicalProperties')}
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.phRange')}:</span>
                                        <span className="font-medium text-slate-800">{soilData.ph_range}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.phCategory')}:</span>
                                        <Badge variant="outline" className="text-xs">{soilData.ph_category}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.organicCarbon')}:</span>
                                        <span className="font-medium text-slate-800">{soilData.organic_carbon}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">{t('cropPrediction.fertility')}:</span>
                                        <Badge className={
                                            soilData.fertility.includes('High') ? 'bg-green-600' :
                                            soilData.fertility.includes('Medium') ? 'bg-yellow-600' :
                                            'bg-red-600'
                                        }>{soilData.fertility}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nutrient Profile */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                {t('cropPrediction.npkProfile')}
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-xs text-slate-600 mb-1">{t('cropPrediction.nitrogen')}</div>
                                    <div className="text-lg font-bold text-blue-700">{soilData.nitrogen}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-600 mb-1">{t('cropPrediction.phosphorus')}</div>
                                    <div className="text-lg font-bold text-purple-700">{soilData.phosphorus}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-600 mb-1">{t('cropPrediction.potassium')}</div>
                                    <div className="text-lg font-bold text-green-700">{soilData.potassium}</div>
                                </div>
                            </div>
                        </div>

                        {/* Price Influence */}
                        <div className={`p-4 rounded-lg border-2 ${
                            soilData.price_influence.factor === 'Positive' 
                                ? 'bg-green-50 border-green-300' 
                                : soilData.price_influence.factor === 'Negative'
                                ? 'bg-red-50 border-red-300'
                                : 'bg-yellow-50 border-yellow-300'
                        }`}>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                {soilData.price_influence.factor === 'Positive' ? (
                                    <><TrendingUp className="w-4 h-4 text-green-600" /> <span className="text-green-900">{t('cropPrediction.positivePriceImpact')}</span></>
                                ) : soilData.price_influence.factor === 'Negative' ? (
                                    <><TrendDown className="w-4 h-4 text-red-600" /> <span className="text-red-900">{t('cropPrediction.negativePriceImpact')}</span></>
                                ) : (
                                    <><Activity className="w-4 h-4 text-yellow-600" /> <span className="text-yellow-900">{t('cropPrediction.neutralPriceImpact')}</span></>
                                )}
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge className={
                                        soilData.price_influence.factor === 'Positive' ? 'bg-green-600' :
                                        soilData.price_influence.factor === 'Negative' ? 'bg-red-600' :
                                        'bg-yellow-600'
                                    }>
                                        {soilData.price_influence.impact}
                                    </Badge>
                                    <span className="text-xs text-slate-600">on market price</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{soilData.price_influence.reason}</p>
                            </div>
                        </div>

                        {/* Key Characteristics */}
                        <div>
                            <h4 className="font-semibold text-sm text-slate-900 mb-2">{t('cropPrediction.keyCharacteristics')}</h4>
                            <ul className="space-y-1">
                                {soilData.characteristics.map((char, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>{char}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Management Recommendation */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-sm text-blue-900 mb-1 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                {t('cropPrediction.managementRecommendation')}
                            </h4>
                            <p className="text-sm text-slate-700">{soilData.management}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Crop Recommendations */}
            {selectedSoil && recommendedCrops.length > 0 && prediction && (
                <Card className="border-emerald-100 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                            {t('cropPrediction.recommendedCrops', { soilType: selectedSoil })}
                        </CardTitle>
                        <CardDescription>{t('cropPrediction.basedOnReal')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendedCrops.map(({ crop, suitability, data }) => (
                                <div 
                                    key={crop}
                                    className={`p-4 rounded-lg border-2 ${
                                        suitability === 'best' 
                                            ? 'bg-emerald-50 border-emerald-300' 
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg text-slate-800">{crop}</h3>
                                        <Badge 
                                            className={
                                                suitability === 'best'
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-blue-100 text-blue-700'
                                            }
                                        >
                                            {suitability === 'best' ? (
                                                <><CheckCircle2 className="w-3 h-3 mr-1" /> {t('cropPrediction.bestMatch')}</>
                                            ) : (
                                                t('cropPrediction.goodMatch')
                                            )}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-600">
                                        <p><strong>{t('cropPrediction.season')}:</strong> {data.season}</p>
                                        <p><strong>{t('cropPrediction.avgYield')}:</strong> {data.avgYield}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CropPricePrediction;