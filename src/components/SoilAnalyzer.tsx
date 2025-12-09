import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Leaf, Droplets, Mountain } from 'lucide-react';
import { toast } from 'sonner';

interface SoilAnalysis {
  type: string;
  quality: string;
  recommendations: string[];
  suitableCrops: string[];
}

export function SoilAnalyzer() {
  const [sand, setSand] = useState('');
  const [silt, setSilt] = useState('');
  const [clay, setClay] = useState('');
  const [analysis, setAnalysis] = useState<SoilAnalysis | null>(null);

  const analyzeSoil = () => {
    const sandPct = parseFloat(sand);
    const siltPct = parseFloat(silt);
    const clayPct = parseFloat(clay);

    if (!sand || !silt || !clay) {
      toast.error('Please enter all soil composition values');
      return;
    }

    const total = sandPct + siltPct + clayPct;
    if (Math.abs(total - 100) > 1) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    // Soil classification logic
    let soilType = '';
    let quality = '';
    let recommendations: string[] = [];
    let suitableCrops: string[] = [];

    if (sandPct > 85) {
      soilType = 'Sandy Soil';
      quality = 'Moderate';
      recommendations = [
        'Add organic matter to improve water retention',
        'Use mulching to prevent moisture loss',
        'Apply fertilizers in small, frequent doses'
      ];
      suitableCrops = ['Peanuts', 'Carrots', 'Radish', 'Potatoes', 'Watermelon'];
    } else if (clayPct > 40) {
      soilType = 'Clay Soil';
      quality = 'Good';
      recommendations = [
        'Ensure proper drainage systems',
        'Add gypsum to improve soil structure',
        'Avoid working soil when too wet'
      ];
      suitableCrops = ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Broccoli'];
    } else if (siltPct > 80) {
      soilType = 'Silty Soil';
      quality = 'Excellent';
      recommendations = [
        'Maintain organic matter content',
        'Prevent soil compaction',
        'Use crop rotation for soil health'
      ];
      suitableCrops = ['Wheat', 'Soybeans', 'Vegetables', 'Grass'];
    } else if (sandPct >= 40 && siltPct >= 40 && clayPct <= 20) {
      soilType = 'Loamy Soil';
      quality = 'Excellent';
      recommendations = [
        'Maintain current soil health practices',
        'Regular soil testing recommended',
        'Continue organic matter addition'
      ];
      suitableCrops = ['Most crops', 'Vegetables', 'Fruits', 'Grains'];
    } else if (sandPct > 50 && clayPct > 15 && clayPct < 30) {
      soilType = 'Sandy Loam';
      quality = 'Very Good';
      recommendations = [
        'Add compost to enhance fertility',
        'Moderate irrigation required',
        'Balanced fertilizer application'
      ];
      suitableCrops = ['Tomatoes', 'Peppers', 'Maize', 'Onion-bhima shweta', 'Onions'];
    } else {
      soilType = 'Mixed Soil';
      quality = 'Good';
      recommendations = [
        'Conduct detailed soil testing',
        'Customize fertilizer based on crop needs',
        'Monitor pH levels regularly'
      ];
      suitableCrops = ['Wheat', 'Maize', 'Pulses', 'Vegetables'];
    }

    setAnalysis({
      type: soilType,
      quality,
      recommendations,
      suitableCrops
    });

    toast.success('Soil analysis completed!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Soil Quality Analyzer</h2>
        <p className="text-gray-600">Analyze soil composition and get crop recommendations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Soil Composition Input</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-amber-600" />
                  Sand Percentage
                </Label>
                <span className="text-sm text-gray-500">{sand}%</span>
              </div>
              <Input 
                type="number" 
                placeholder="0-100"
                value={sand}
                onChange={(e) => setSand(e.target.value)}
                min="0"
                max="100"
              />
              <Progress value={parseFloat(sand) || 0} className="mt-2 h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  Silt Percentage
                </Label>
                <span className="text-sm text-gray-500">{silt}%</span>
              </div>
              <Input 
                type="number" 
                placeholder="0-100"
                value={silt}
                onChange={(e) => setSilt(e.target.value)}
                min="0"
                max="100"
              />
              <Progress value={parseFloat(silt) || 0} className="mt-2 h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Clay Percentage
                </Label>
                <span className="text-sm text-gray-500">{clay}%</span>
              </div>
              <Input 
                type="number" 
                placeholder="0-100"
                value={clay}
                onChange={(e) => setClay(e.target.value)}
                min="0"
                max="100"
              />
              <Progress value={parseFloat(clay) || 0} className="mt-2 h-2" />
            </div>

            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm">
                Total: {((parseFloat(sand) || 0) + (parseFloat(silt) || 0) + (parseFloat(clay) || 0)).toFixed(1)}%
              </p>
              {Math.abs(((parseFloat(sand) || 0) + (parseFloat(silt) || 0) + (parseFloat(clay) || 0)) - 100) > 1 && (
                <p className="text-sm text-red-600 mt-1">Total must equal 100%</p>
              )}
            </div>

            <Button onClick={analyzeSoil} className="w-full">
              Analyze Soil Quality
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
          
          {analysis ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Soil Type</p>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold">{analysis.type}</h4>
                  <Badge variant={
                    analysis.quality === 'Excellent' ? 'default' : 
                    analysis.quality === 'Very Good' ? 'secondary' : 
                    'outline'
                  }>
                    {analysis.quality}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Suitable Crops</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suitableCrops.map((crop, idx) => (
                    <Badge key={idx} variant="outline" className="bg-green-50">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 For detailed soil health card and testing services, visit your nearest 
                  Krishi Vigyan Kendra (KVK) or contact CSIR-CFTRI for laboratory analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter soil composition to view analysis</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <h3 className="text-xl font-semibold text-blue-900 mb-2">Soil Health Card Scheme</h3>
        <p className="text-gray-700">
          Get your free Soil Health Card from the Government of India. The card provides information on 
          nutrient status of soil along with recommendations on appropriate dosage of nutrients for improving 
          soil health and its fertility.
        </p>
        <Button className="mt-4" variant="outline">
          Apply for Soil Health Card
        </Button>
      </Card>
    </div>
  );
}
