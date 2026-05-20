import mongoose from 'mongoose'

const processingOptionSchema = new mongoose.Schema({
  type: String,
  relatedUnits: [String]
}, { _id: false })

const alternateMarketSchema = new mongoose.Schema({
  marketType: String,
  description: String,
  priceRange: String,
  processingTime: String
}, { _id: false })

const cropGuideSchema = new mongoose.Schema({
  cropName: { type: String, required: true, unique: true },
  category: String,
  shelfLife: {
    normal: String,
    coldStorage: String,
    daysInNumbers: {
      normal: Number,
      extended: Number
    }
  },
  zeroLossMeasures: {
    primary: String,
    secondary: [String],
    processingOptions: [processingOptionSchema]
  },
  sellingChannels: {
    direct: [String],
    aggregation: [String],
    processing: [String],
    government: [String]
  },
  alternateMarkets: [alternateMarketSchema],
  mnregaPotential: {
    eligible: Boolean,
    wasteConversionRate: String,
    dailyWage: Number
  },
  translations: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  recommendations: [String],
  ipfsDocHash: String
}, { timestamps: true })

export const CropGuide = mongoose.model('CropGuide', cropGuideSchema)
