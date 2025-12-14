import seasonalityDataRaw from '@/data/seasonality_database.json';

export interface CropData {
  crop: string;
  state: string;
  data_points: number;
  date_range: {
    start: string;
    end: string;
  };
  weights: {
    recent: number;
    long_term: number;
  };
  seasonality_factors: Record<string, number>;
}

export interface SeasonalityData {
  metadata: any;
  crops: Record<string, CropData>;
}

const seasonalityData = seasonalityDataRaw as unknown as SeasonalityData;

export const getAvailableCrops = () => Object.keys(seasonalityData.crops).sort();

export const getCropData = (crop: string) => seasonalityData.crops[crop];

export const getSeasonalityFactor = (crop: string) => {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const day = today.getDate();

    const cropData = seasonalityData.crops[crop];
    if (!cropData) return 1.0;

    const factors = cropData.seasonality_factors;
    const key = `${month}-${day}`;

    // Try exact day
    if (factors[key]) {
        return factors[key];
    }

    // Fallback to monthly average
    const monthFactors = Object.entries(factors)
        .filter(([k]) => k.startsWith(`${month}-`))
        .map(([, v]) => v);

    if (monthFactors.length > 0) {
        return monthFactors.reduce((a, b) => a + b) / monthFactors.length;
    }

    return 1.0;
};

export const fetchRecentPrice = async (crop: string) => {
    const API_KEY = '579b464db66ec23bdd000001e6d6fb1e05a94ea57b21c49b416acd07';
    const BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';

    try {
        const params = new URLSearchParams({
            'api-key': API_KEY,
            'format': 'json',
            'limit': '100',
            'filters[Commodity]': crop,
            'filters[State]': 'Odisha',
            'sort[Arrival_Date]': 'desc'
        });

        const response = await fetch(`${BASE_URL}?${params}`);
        const data = await response.json();

        if (!data.records || data.records.length === 0) {
            return null;
        }

        // Calculate average of recent prices
        const prices = data.records
            .map((r: any) => parseFloat(r.Modal_Price))
            .filter((p: number) => !isNaN(p) && p > 0)
            .slice(0, 30); // Last 30 records

        if (prices.length === 0) return null;

        return prices.reduce((a: number, b: number) => a + b) / prices.length;

    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
};
