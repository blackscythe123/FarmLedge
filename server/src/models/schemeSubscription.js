import mongoose from 'mongoose'

const schemeSubscriptionSchema = new mongoose.Schema({
  farmerId: { type: String },
  farmerAddress: { type: String, index: true },
  phone: { type: String, required: true },
  language: { type: String, default: 'en' },
  schemeIds: { type: [String], default: [] },
}, { timestamps: true })

export const SchemeSubscription = mongoose.model('SchemeSubscription', schemeSubscriptionSchema)
