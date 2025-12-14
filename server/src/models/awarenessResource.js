import mongoose from 'mongoose'

const processorSchema = new mongoose.Schema({
  type: String,
  nearbyFacilities: [String],
  averagePrice: Number
}, { _id: false })

const shelfLifeChartSchema = new mongoose.Schema({
  normal: Number,
  coldStorage: Number,
  recommendations: String
}, { _id: false })

const mnregaInfoSchema = new mongoose.Schema({
  eligible: Boolean,
  wage: Number,
  documentRequired: [String]
}, { _id: false })

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cropTypes: [String],
  scope: { type: String, enum: ['storage', 'processing', 'scheme', 'food_safety', 'market'], default: 'processing' },
  resourceType: { type: String, default: 'guide' },
  summary: String,
  link: String,
  language: { type: String, default: 'en' },
  zeroLossMeasures: [String],
  governmentOptions: [String],
  processorContacts: [processorSchema],
  mnregaInfo: mnregaInfoSchema,
  shelfLifeChart: shelfLifeChartSchema,
  linkedSchemes: [String]
}, { timestamps: true })

export const AwarenessResource = mongoose.model('AwarenessResource', resourceSchema)
