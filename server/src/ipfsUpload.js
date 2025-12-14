// server/src/ipfsUpload.js
import "dotenv/config";

import axios from "axios";

const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

export async function uploadAlertToIPFS(alertJson) {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.error("[IoT → IPFS] Missing Pinata API keys in backend .env");
    return null;
  }

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      alertJson,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );
    console.log("[IoT → IPFS] stored:", response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (err) {
    console.error("[IoT → IPFS] failed:", err?.response?.data || err);
    return null;
  }
}
