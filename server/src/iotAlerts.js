// server/src/iotAlerts.js

import crypto from "crypto";
import { cropThresholds } from "../config/cropThresholds.js";
import { uploadAlertToIPFS } from "./ipfsUpload.js";

// Reuse the same webhook env that you already use elsewhere
const { N8N_WEBHOOK_SECRET } = process.env;

const iotAlerts = [];

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function evaluateStatus(cropName, temp, ph, humidity) {
  const defaults = { tempMin: 4, tempMax: 10, phMin: 6.0, phMax: 7.5, humidityMin: 60, humidityMax: 85 };
  const t = cropThresholds[cropName] || defaults;

  let tempStatus = "OK";
  if (temp < t.tempMin) tempStatus = "LOW";
  else if (temp > t.tempMax) tempStatus = "HIGH";

  let phStatus = "N/A";
  if (ph != null && t.phMin != null && t.phMax != null) {
    phStatus = "OK";
    if (ph < t.phMin) phStatus = "LOW";
    else if (ph > t.phMax) phStatus = "HIGH";
  }

  let humidityStatus = "N/A";
  if (humidity != null) {
    const hMin = t.humidityMin ?? defaults.humidityMin;
    const hMax = t.humidityMax ?? defaults.humidityMax;
    humidityStatus = "OK";
    if (humidity < hMin) humidityStatus = "LOW";
    else if (humidity > hMax) humidityStatus = "HIGH";
  }

  return { tempStatus, phStatus, humidityStatus };
}

async function sendDistributorAlert(alert, phone) {
  if (!N8N_WEBHOOK_SECRET) {
    console.warn("[IoT] Distributor webhook not configured");
    return;
  }
  if (!phone) {
    console.warn("[IoT] No distributor contact provided");
    return;
  }

  const message =
    `🚨 Storage Alert\n` +
    `Crop: ${alert.cropName}\n` +
    `Batch: ${alert.batchId}\n` +
    `Storage: ${alert.storageId}\n` +
    `Temp: ${alert.temp}°C (${alert.tempStatus})\n` +
    (alert.humidity != null ? `Humidity: ${alert.humidity}% (${alert.humidityStatus})\n` : "") +
    (alert.ph != null ? `pH: ${alert.ph} (${alert.phStatus})\n` : "") +
    (alert.ipfsHash ? `IPFS: ${alert.ipfsHash}\n` : "") +
    `Time: ${alert.timestamp}`;

  try {
    console.log(
      "[IoT] Sending distributor WhatsApp alert →",
      phone,
      "via",
      N8N_WEBHOOK_SECRET
    );

    const response = await fetch(N8N_WEBHOOK_SECRET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone, message }),
    });

    console.log("[IoT] Distributor alert webhook status:", response.status);

    if (!response.ok) {
      console.error(
        "[IoT] Distributor webhook failed:",
        await response.text().catch(() => "no body")
      );
    } else {
      console.log("[IoT] Distributor alert sent");
    }
  } catch (e) {
    console.error("[IoT] Failed to send distributor alert:", e.message);
  }
}

export async function createAlert({
  batchId,
  cropName,
  storageId,
  distributorContact,
}) {
  const defaults = { tempMin: 4, tempMax: 10, phMin: 6.0, phMax: 7.5, humidityMin: 60, humidityMax: 85 };
  const t = cropThresholds[cropName] || defaults;

  // Simulate temp, pH, humidity around crop-specific ranges with occasional excursions
  const tempRange = (t.tempMax - t.tempMin) || 6;
  const phRange = (t.phMax - t.phMin) || 1.5;
  const humidityRange = (t.humidityMax ?? defaults.humidityMax) - (t.humidityMin ?? defaults.humidityMin) || 20;

  const tempMid = (t.tempMin + t.tempMax) / 2;
  const phMid = (t.phMin + t.phMax) / 2;
  const humidityMid = ((t.humidityMin ?? defaults.humidityMin) + (t.humidityMax ?? defaults.humidityMax)) / 2;

  // Allow up to ~80% of the range deviation to create breaches occasionally
  const temp = parseFloat((tempMid + (Math.random() - 0.5) * tempRange * 1.6).toFixed(2));
  const ph = parseFloat((phMid + (Math.random() - 0.5) * phRange * 1.4).toFixed(2));
  const humidity = parseFloat((humidityMid + (Math.random() - 0.5) * humidityRange * 1.5).toFixed(1));

  const { tempStatus, phStatus, humidityStatus } = evaluateStatus(cropName, temp, ph, humidity);

  const alert = {
    id: generateId(),
    stage: "DISTRIBUTOR",
    batchId: String(batchId),
    cropName,
    storageId: String(storageId),
    temp,
    humidity,
    ph,
    tempStatus,
    phStatus,
    humidityStatus,
    timestamp: new Date().toISOString(),
    ipfsHash: null,
    notifiedDistributor: false,
  };

  // Store snapshot on IPFS
  const ipfsHash = await uploadAlertToIPFS(alert);
  alert.ipfsHash = ipfsHash;

  iotAlerts.push(alert);

  const breach =
    (tempStatus !== "OK" && tempStatus !== "UNKNOWN") ||
    (phStatus !== "OK" && phStatus !== "N/A" && phStatus !== "UNKNOWN") ||
    (humidityStatus !== "OK" && humidityStatus !== "N/A" && humidityStatus !== "UNKNOWN");

  if (breach) {
    await sendDistributorAlert(alert, distributorContact);
    alert.notifiedDistributor = true;
  }

  return alert;
}

export function getAlerts(batchId) {
  return iotAlerts
    .filter((a) => (batchId ? a.batchId === String(batchId) : true))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
