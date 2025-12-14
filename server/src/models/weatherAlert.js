import mongoose from 'mongoose'

const weatherAlertSchema = new mongoose.Schema({
  farmerId: { type: String },
  batchId: { type: String },
  alertType: { type: String, required: true }, // e.g., frost, irrigation, monsoon, harvest, heat
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  lang: { type: String, default: 'en' },
  location: {
    lat: Number,
    lon: Number
  },
  weatherSnapshot: {},
  sentVia: { type: String, default: 'api' },
  read: { type: Boolean, default: false },
  actionTaken: {
    action: { type: String },
    timestamp: { type: Date }
  }
}, { timestamps: true })

export const WeatherAlert = mongoose.model('WeatherAlert', weatherAlertSchema)
