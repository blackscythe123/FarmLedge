// CropPricePrediction.jsx
import React, { useState, useEffect } from 'react';
import seasonalityData from './seasonality_database.json';

const CropPricePrediction = () => {
    const [selectedCrop, setSelectedCrop] = useState('Onion');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get list of available crops
    const availableCrops = Object.keys(seasonalityData.crops).sort();

    // Get seasonality factor for today
    const getSeasonalityFactor = (crop) => {
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

    // Fetch recent price from government API
    const fetchRecentPrice = async (crop) => {
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
                .map(r => parseFloat(r.Modal_Price))
                .filter(p => !isNaN(p) && p > 0)
                .slice(0, 30); // Last 30 records

            if (prices.length === 0) return null;

            return prices.reduce((a, b) => a + b) / prices.length;

        } catch (err) {
            console.error('API Error:', err);
            return null;
        }
    };

    // Calculate prediction
    const calculatePrediction = async () => {
        setLoading(true);
        setError(null);

        try {
            const cropData = seasonalityData.crops[selectedCrop];

            if (!cropData) {
                setError(`Crop "${selectedCrop}" not found in database`);
                setLoading(false);
                return;
            }

            // Get seasonality factor
            const seasonalFactor = getSeasonalityFactor(selectedCrop);

            // Fetch recent price
            const recentPrice = await fetchRecentPrice(selectedCrop);

            if (!recentPrice) {
                setError('No recent price data available from API');
                setLoading(false);
                return;
            }

            // Calculate prediction
            const predictedPrice = recentPrice * seasonalFactor;
            const priceChange = ((predictedPrice - recentPrice) / recentPrice) * 100;

            setPrediction({
                crop: selectedCrop,
                predictionDate: new Date().toLocaleDateString('en-IN'),
                predictedPrice: predictedPrice.toFixed(2),
                recentAveragePrice: recentPrice.toFixed(2),
                seasonalFactor: seasonalFactor.toFixed(3),
                priceChangePercent: priceChange.toFixed(2),
                weights: cropData.weights,
                dataInfo: cropData.date_range
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-predict on crop change
    useEffect(() => {
        calculatePrediction();
    }, [selectedCrop]);

    return (
        <div className="crop-price-prediction">
            <h2>🌾 Crop Price Prediction</h2>
            <p className="subtitle">Odisha State - Today's Prediction</p>

            {/* Crop Selector */}
            <div className="input-group">
                <label htmlFor="crop-select">Select Crop:</label>
                <select
                    id="crop-select"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    disabled={loading}
                >
                    {availableCrops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                    ))}
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading">
                    <p>🔄 Calculating prediction...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="error">
                    <p>❌ {error}</p>
                </div>
            )}

            {/* Prediction Result */}
            {prediction && !loading && !error && (
                <div className="prediction-result">
                    <div className="result-card">
                        <h3>{prediction.crop}</h3>
                        <p className="date">📅 {prediction.predictionDate}</p>

                        <div className="price-display">
                            <div className="price-item">
                                <span className="label">Current Average:</span>
                                <span className="value">₹{prediction.recentAveragePrice}</span>
                            </div>

                            <div className="price-item predicted">
                                <span className="label">Predicted Price:</span>
                                <span className="value">₹{prediction.predictedPrice}</span>
                            </div>

                            <div className="price-item">
                                <span className="label">Expected Change:</span>
                                <span className={`value ${parseFloat(prediction.priceChangePercent) >= 0 ? 'positive' : 'negative'}`}>
                                    {prediction.priceChangePercent > 0 ? '+' : ''}{prediction.priceChangePercent}%
                                </span>
                            </div>
                        </div>

                        <div className="details">
                            <p><strong>Seasonal Factor:</strong> {prediction.seasonalFactor}x</p>
                            <p><strong>Method:</strong> Method A (Performance-based)</p>
                            <p>
                                <strong>Weights:</strong> Recent {(prediction.weights.recent * 100).toFixed(0)}%,
                                Long-term {(prediction.weights.long_term * 100).toFixed(0)}%
                            </p>
                        </div>

                        <div className="data-info">
                            <p className="small">
                                📊 Based on historical data from {prediction.dataInfo.start} to {prediction.dataInfo.end}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropPricePrediction;
