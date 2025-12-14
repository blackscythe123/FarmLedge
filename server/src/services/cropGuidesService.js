import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CropGuide } from '../models/cropGuide.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Allow overriding the data file, else use bundled JSON
const DATA_FILE = process.env.CROP_GUIDE_FILE || path.join(__dirname, '..', '..', 'data', 'crop_guides.json')

function loadGuidesFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const guides = JSON.parse(raw)
    if (Array.isArray(guides)) return guides
  } catch (e) {
    console.warn('[crop-guides] failed to load data file', e?.message || e)
  }
  return []
}

export async function listCropGuides(lang = 'en') {
  const docs = await CropGuide.find({}).lean()
  const guides = docs.length ? docs : loadGuidesFromFile()
  
  if (docs.length === 0 && guides.length > 0) {
    // Background upsert if using fallback
    upsertCropGuides(guides).catch((e) => console.warn('[crop-guides] upsert fallback failed', e?.message || e))
  }

  return guides.map(g => translateGuide(g, lang))
}

export async function getCropGuideByName(name, lang = 'en') {
  if (!name) return null
  let doc = await CropGuide.findOne({ cropName: new RegExp(`^${name}$`, 'i') }).lean()
  
  if (!doc) {
    const fallback = loadGuidesFromFile()
    doc = fallback.find((g) => g.cropName?.toLowerCase() === String(name).toLowerCase()) || null
  }

  return doc ? translateGuide(doc, lang) : null
}

function translateGuide(guide, lang) {
  if (!guide) return guide
  if (lang === 'en' || !guide.translations || !guide.translations[lang]) return guide
  
  // Merge translation over base guide
  // We exclude 'translations' from the output to keep it clean
  const { translations, ...base } = guide
  const translated = translations[lang]
  
  // Deep merge could be better, but shallow merge of top-level keys is a start.
  // However, structure like shelfLife is nested.
  // Let's assume the translation object mirrors the structure and we just spread it.
  // For nested objects, we might need deep merge if partial translation is allowed.
  // For now, simple spread.
  return { ...base, ...translated }
}

export async function upsertCropGuides(guides) {
  if (!Array.isArray(guides)) throw new Error('guides must be an array')
  const ops = guides.map((guide) => ({
    updateOne: {
      filter: { cropName: guide.cropName },
      update: guide,
      upsert: true,
      setDefaultsOnInsert: true
    }
  }))
  if (ops.length === 0) return { matched: 0, upserted: 0 }
  const res = await CropGuide.bulkWrite(ops)
  return { matched: res.nMatched, upserted: res.nUpserted }
}
